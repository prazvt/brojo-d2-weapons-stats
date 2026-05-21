/**
 * Destiny 2 Manifest Data Extractor Pipeline
 * Downloads Bungie D2 JSON component tables, prunes them, maps weapon sockets,
 * resolves all valid weapon perks, and saves highly optimized JSON files for the client.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables if available
const envPath = path.join(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  try {
    if (typeof process.loadEnvFile === 'function') {
      process.loadEnvFile(envPath);
    } else {
      // Fallback parser
      const envContent = fs.readFileSync(envPath, 'utf8');
      envContent.split(/\r?\n/).forEach(line => {
        const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
        if (match) {
          const key = match[1];
          let value = match[2] || '';
          if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
          if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
          process.env[key] = value;
        }
      });
    }
  } catch (err) {
    console.warn('Could not load .env.local file:', err.message);
  }
}

const API_KEY = process.env.BUNGIE_API_KEY || '';

const BUNGIE_BASE_URL = 'https://www.bungie.net';
const MANIFEST_URL = `${BUNGIE_BASE_URL}/Platform/Destiny2/Manifest/`;
const OUTPUT_DIR = path.join(__dirname, '../src/data');

// Static Mapping Constants
const SLOT_HASHES = {
  1498876634: 'Kinetic',
  2465295065: 'Energy',
  953998645: 'Power'
};

const DAMAGE_TYPES = {
  1: 'Kinetic',
  2: 'Arc',
  3: 'Solar',
  4: 'Void',
  5: 'Raid',
  6: 'Stasis',
  7: 'Strand'
};

const AMMO_TYPES = {
  1: 'Primary',
  2: 'Special',
  3: 'Heavy'
};

// Sockets Category Hashes mapping
const SOCKET_CATEGORIES = {
  INTRINSIC: [3956125801],
  BARRELS: [2715839340],
  MAGAZINES: [2618002886],
  PERK_COLUMNS: [595050604, 760089695, 2337777174], // columns 1, 2, and double rolls
  ORIGIN_TRAITS: [3993098925],
  MODS: [2685412230],
  MASTERWORKS: [2048532648]
};

async function fetchJson(url) {
  console.log(`Fetching: ${url}`);
  const headers = {};
  if (API_KEY) {
    headers['X-API-Key'] = API_KEY;
  }
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`HTTP Error ${res.status}: ${res.statusText}`);
  return res.json();
}

async function main() {
  try {
    // 1. Create output directory if it doesn't exist
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    console.log('--- Phase 1: Fetching Manifest Metadata ---');
    const manifestMeta = await fetchJson(MANIFEST_URL);
    const componentPaths = manifestMeta.Response?.jsonWorldComponentContentPaths?.en;

    if (!componentPaths) {
      throw new Error('Failed to resolve English component paths from manifest metadata.');
    }

    // Get specific component file endpoints
    const itemsUrl = `${BUNGIE_BASE_URL}${componentPaths.DestinyInventoryItemDefinition}`;
    const plugSetsUrl = `${BUNGIE_BASE_URL}${componentPaths.DestinyPlugSetDefinition}`;
    const statsUrl = `${BUNGIE_BASE_URL}${componentPaths.DestinyStatDefinition}`;

    console.log('\n--- Phase 2: Fetching Component Tables ---');
    console.log('Downloading tables. This may take 15-30 seconds depending on network speeds...');
    
    const [itemsTable, plugSetsTable, statsTable] = await Promise.all([
      fetchJson(itemsUrl),
      fetchJson(plugSetsUrl),
      fetchJson(statsUrl)
    ]);

    console.log('Downloaded tables successfully.');
    console.log(`- Items Table Size: ${Object.keys(itemsTable).length} entries`);
    console.log(`- PlugSets Table Size: ${Object.keys(plugSetsTable).length} entries`);
    console.log(`- Stats Table Size: ${Object.keys(statsTable).length} entries`);

    console.log('\n--- Phase 3: Processing Weapon Stats Catalog ---');
    // Extract human readable stats
    const statsMap = {};
    for (const [hash, statDef] of Object.entries(statsTable)) {
      statsMap[hash] = {
        name: statDef.displayProperties?.name || 'Unknown Stat',
        description: statDef.displayProperties?.description || '',
        icon: statDef.displayProperties?.icon ? `${BUNGIE_BASE_URL}${statDef.displayProperties.icon}` : null
      };
    }
    fs.writeFileSync(path.join(OUTPUT_DIR, 'stats.json'), JSON.stringify(statsMap, null, 2));
    console.log('Saved stats.json.');

    console.log('\n--- Phase 4: Processing Weapons ---');
    const prunedWeapons = [];
    const activePerkHashes = new Set();

    // Iterate items to filter weapons
    for (const [itemHashStr, itemDef] of Object.entries(itemsTable)) {
      const itemHash = parseInt(itemHashStr);

      // itemType: 3 represents DestinyItemType.Weapon
      // We also verify itemDef.sockets exists to build rolls
      if (itemDef.itemType !== 3 || !itemDef.sockets) continue;

      // Filter out dummy/test weapons
      if (!itemDef.displayProperties?.name || itemDef.displayProperties.name.includes('Test Weapon')) continue;

      const weaponName = itemDef.displayProperties.name;
      const tier = itemDef.inventory?.tierTypeName || 'Common';

      // Get slot, damage, ammo types
      const slotHash = itemDef.equippingBlock?.equipmentSlotTypeHash;
      const slotName = SLOT_HASHES[slotHash] || 'Kinetic';
      
      const damageTypeHash = itemDef.defaultDamageType;
      const damageTypeName = DAMAGE_TYPES[damageTypeHash] || 'Kinetic';

      const ammoTypeVal = itemDef.equippingBlock?.ammoType;
      const ammoTypeName = AMMO_TYPES[ammoTypeVal] || 'Primary';

      // Parse base stats: [baseValue, minValue, maxValue]
      const baseStats = {};
      if (itemDef.stats?.stats) {
        for (const [statHashStr, statVal] of Object.entries(itemDef.stats.stats)) {
          const statHash = parseInt(statHashStr);
          baseStats[statHash] = [statVal.value, statVal.minimum, statVal.maximum];
        }
      }

      // Parse Frame details from intrinsic perk sockets
      let intrinsicFrame = 'Standard';
      
      // Map weapon sockets
      const parsedSockets = [];
      const socketEntries = itemDef.sockets.socketEntries || [];
      const socketCategories = itemDef.sockets.socketCategories || [];

      // Create a dictionary of socket indices to their category hash
      const socketIndexToCategory = {};
      for (const cat of socketCategories) {
        const catHash = cat.socketCategoryHash;
        for (const index of cat.socketIndexes || []) {
          socketIndexToCategory[index] = catHash;
        }
      }

      // Process each socket entry
      socketEntries.forEach((entry, index) => {
        const categoryHash = socketIndexToCategory[index];
        if (!categoryHash) return;

        // 1. Collect all possible plug hashes for this socket first
        const possiblePlugs = new Set();
        
        // Single default/initial item
        if (entry.singleInitialItemHash) {
          possiblePlugs.add(entry.singleInitialItemHash);
        }

        // Reusable static plugs
        if (entry.reusablePlugItems) {
          for (const item of entry.reusablePlugItems) {
            if (item.currentlyCanRoll !== false) {
              possiblePlugs.add(item.plugItemHash);
            }
          }
        }

        // Randomized plug sets (essential for dynamic perk rolls!)
        const randomPlugSetHash = entry.randomizedPlugSetHash;
        if (randomPlugSetHash && plugSetsTable[randomPlugSetHash]) {
          const plugSet = plugSetsTable[randomPlugSetHash];
          for (const plug of plugSet.reusablePlugItems || []) {
            if (plug.currentlyCanRoll !== false) {
              possiblePlugs.add(plug.plugItemHash);
            }
          }
        }

        // Static reusable plug sets (e.g. Masterworks, Mods, or exotic static sets)
        const reusablePlugSetHash = entry.reusablePlugSetHash;
        if (reusablePlugSetHash && plugSetsTable[reusablePlugSetHash]) {
          const plugSet = plugSetsTable[reusablePlugSetHash];
          for (const plug of plugSet.reusablePlugItems || []) {
            if (plug.currentlyCanRoll !== false) {
              possiblePlugs.add(plug.plugItemHash);
            }
          }
        }

        // Filter and collect active perks
        const plugList = Array.from(possiblePlugs).filter(pHash => {
          const plugItem = itemsTable[pHash];
          if (!plugItem) return false;
          // Exclude template or dummy plugs
          if (plugItem.displayProperties?.name?.includes('Deprecated') || 
              plugItem.displayProperties?.name?.includes('Dummy')) return false;
          return true;
        });

        if (plugList.length === 0) return;

        // 2. Dynamically classify socket category Type based on plugCategoryIdentifier keywords
        let categoryType = 'other';
        
        if (categoryHash === 3956125808) {
          categoryType = 'intrinsic';
        } else {
          // Inspect the representative plug (the default single item, or first in plug list)
          const repPlugHash = entry.singleInitialItemHash || plugList[0];
          const repPlug = itemsTable[repPlugHash];
          const plugCatId = (repPlug?.plug?.plugCategoryIdentifier || '').toLowerCase();

          if (plugCatId.includes('intrinsic') || plugCatId.includes('archetype') || plugCatId.includes('frame')) {
            categoryType = 'intrinsic';
          } else if (plugCatId.includes('barrel') || plugCatId.includes('sight') || plugCatId.includes('scope') || 
                     plugCatId.includes('grip') || plugCatId.includes('stock') || plugCatId.includes('lens')) {
            categoryType = 'barrel';
          } else if (plugCatId.includes('magazine') || plugCatId.includes('battery') || plugCatId.includes('projectile') || 
                     plugCatId.includes('arrow') || plugCatId.includes('string')) {
            categoryType = 'magazine';
          } else if (plugCatId.includes('origin')) {
            categoryType = 'origin_trait';
          } else if (plugCatId.includes('masterwork')) {
            categoryType = 'masterwork';
          } else if (plugCatId.includes('mod')) {
            categoryType = 'mod';
          } else if (plugCatId.includes('trait') || plugCatId.includes('perk') || plugCatId.startsWith('v400.weapons.')) {
            categoryType = 'perk';
          } else if (categoryHash === 4241085061) {
            // General weapon perks fallback if categorized under WEAPON PERKS
            categoryType = 'perk';
          }
        }

        // Exclude cosmetic, modification, or tracker sockets for a lightweight payload
        if (categoryType === 'other' || categoryType === 'mod') return;

        parsedSockets.push({
          index,
          cat: categoryType,
          plugs: plugList
        });

        // Track this perk hash to extract detailed metadata later
        plugList.forEach(pHash => activePerkHashes.add(pHash));

        // Resolve intrinsic frame display name (e.g., "Precision Frame")
        if (index === 0 && categoryType === 'intrinsic' && entry.singleInitialItemHash) {
          const frameItem = itemsTable[entry.singleInitialItemHash];
          if (frameItem && frameItem.displayProperties?.name) {
            intrinsicFrame = frameItem.displayProperties.name;
          }
        }
      });

      prunedWeapons.push({
        hash: itemHash,
        name: weaponName,
        icon: itemDef.displayProperties.icon ? `${BUNGIE_BASE_URL}${itemDef.displayProperties.icon}` : null,
        screenshot: itemDef.screenshot ? `${BUNGIE_BASE_URL}${itemDef.screenshot}` : null,
        weaponType: itemDef.itemTypeDisplayName || 'Unknown Weapon',
        tier,
        damageType: damageTypeName,
        slot: slotName,
        ammoType: ammoTypeName,
        frame: intrinsicFrame,
        baseStats,
        sockets: parsedSockets
      });
    }

    console.log(`Processed ${prunedWeapons.length} weapons.`);
    // Minify output JSON for client performance
    fs.writeFileSync(path.join(OUTPUT_DIR, 'weapons.json'), JSON.stringify(prunedWeapons));
    console.log('Saved weapons.json.');

    console.log('\n--- Phase 5: Processing Perks & Plugs ---');
    const perksMap = {};

    // Extract detailed data only for perks that are actually rollable on weapons
    for (const perkHash of activePerkHashes) {
      const perkDef = itemsTable[perkHash];
      if (!perkDef) continue;

      // Extract investment stats
      const investmentStats = [];
      if (perkDef.investmentStats) {
        for (const stat of perkDef.investmentStats) {
          investmentStats.push({
            statHash: stat.statTypeHash,
            value: stat.value
          });
        }
      }

      perksMap[perkHash] = {
        hash: perkHash,
        name: perkDef.displayProperties?.name || 'Unknown Perk',
        icon: perkDef.displayProperties?.icon ? `${BUNGIE_BASE_URL}${perkDef.displayProperties.icon}` : null,
        description: perkDef.displayProperties?.description || '',
        investmentStats
      };
    }

    console.log(`Processed ${Object.keys(perksMap).length} active perks.`);
    // Minify perks output JSON for client performance
    fs.writeFileSync(path.join(OUTPUT_DIR, 'perks.json'), JSON.stringify(perksMap));
    console.log('Saved perks.json.');

    console.log('\n--- Data Extraction Completed Successfully! ---');
    console.log(`- Pruned Weapons size: ${(fs.statSync(path.join(OUTPUT_DIR, 'weapons.json')).size / (1024 * 1024)).toFixed(2)} MB`);
    console.log(`- Pruned Perks size: ${(fs.statSync(path.join(OUTPUT_DIR, 'perks.json')).size / (1024 * 1024)).toFixed(2)} MB`);
    console.log(`- Pruned Stats size: ${(fs.statSync(path.join(OUTPUT_DIR, 'stats.json')).size / 1024).toFixed(2)} KB`);

  } catch (error) {
    console.error('Extraction script encountered an error:', error);
    process.exit(1);
  }
}

main();
