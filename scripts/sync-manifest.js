/**
 * Destiny 2 Manifest Data Synchronizer Pipeline
 * Downloads Bungie D2 JSON component tables, prunes them, maps weapon sockets,
 * resolves all valid weapon perks and mods, and saves highly optimized JSON files.
 * Designed to run both via CLI and programmatically as part of a scheduled Vercel Cron job.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables if available (e.g. in local development)
const envPath = path.join(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  try {
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
  } catch (err) {
    console.warn('Could not load .env.local file:', err.message);
  }
}

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

const TARGET_MODS = {
  // Standard Mods
  "Quick Access Sling": { "id": "quick_access_sling", "category": "Standard" },
  "Counterbalance Stock": { "id": "counterbalance_stock", "category": "Standard" },
  "Radar Tuner": { "id": "radar_tuner", "category": "Standard" },
  "Sprint Grip": { "id": "sprint_grip", "category": "Standard" },
  "Freehand Grip": { "id": "freehand_grip", "category": "Standard" },
  "Icarus Grip": { "id": "icarus_grip", "category": "Standard" },
  "Major Spec": { "id": "major_spec", "category": "Standard" },
  "Taken Spec": { "id": "taken_spec", "category": "Standard" },
  "Backup Mag": { "id": "backup_mag", "category": "Standard" },
  "Boss Spec": { "id": "boss_spec", "category": "Standard" },
  "Targeting Adjuster": { "id": "targeting_adjuster", "category": "Standard" },
  "Radar Booster": { "id": "radar_booster", "category": "Standard" },
  "Minor Spec": { "id": "minor_spec", "category": "Standard" },
  "Full Auto Retrofit": { "id": "full_auto_retrofit", "category": "Standard" },
  "Sweaty Confetti": { "id": "sweaty_confetti", "category": "Standard" },

  // Adept Mods
  "Adept Blast Radius": { "id": "adept_blast_radius", "category": "Adept" },
  "Adept Range": { "id": "adept_range", "category": "Adept" },
  "Adept Reload": { "id": "adept_reload", "category": "Adept" },
  "Adept Charge Time": { "id": "adept_charge_time", "category": "Adept" },
  "Adept Counterbalance": { "id": "adept_counterbalance", "category": "Adept" },
  "Adept Draw Time": { "id": "adept_draw_time", "category": "Adept" },
  "Adept Projectile Speed": { "id": "adept_projectile_speed", "category": "Adept" },
  "Adept Big Ones Spec": { "id": "adept_big_ones_spec", "category": "Adept" },
  "Adept Stability": { "id": "adept_stability", "category": "Adept" },
  "Adept Handling": { "id": "adept_handling", "category": "Adept" },
  "Adept Accuracy": { "id": "adept_accuracy", "category": "Adept" },
  "Adept Impact": { "id": "adept_impact", "category": "Adept" },
  "Adept Persistence": { "id": "adept_persistence", "category": "Adept" },
  "Adept Shield Duration": { "id": "adept_shield_duration", "category": "Adept" },
  "Adept Targeting": { "id": "adept_targeting", "category": "Adept" },
  "Adept Mag": { "id": "adept_mag", "category": "Adept" },

  // Anti-Champion Mods
  "Overload Pulse Rifle": { "id": "overload_pulse", "category": "Anti-Champion" },
  "Overload Submachine Gun": { "id": "overload_smg", "category": "Anti-Champion" },
  "Unstoppable Bow": { "id": "unstoppable_bow", "category": "Anti-Champion" },
  "Anti-Barrier Pulse Rifle": { "id": "anti_barrier_pulse", "category": "Anti-Champion" },
  "Unstoppable Hand Cannon": { "id": "unstoppable_hc", "category": "Anti-Champion" },
  "Anti-Barrier Sidearm": { "id": "anti_barrier_sidearm", "category": "Anti-Champion" },
  "Unstoppable Scout Rifle": { "id": "unstoppable_scout", "category": "Anti-Champion" },
  "Overload Bow": { "id": "overload_bow", "category": "Anti-Champion" },
  "Anti-Barrier Auto Rifle": { "id": "anti_barrier_auto", "category": "Anti-Champion" },
  "Overload Auto Rifle": { "id": "overload_auto", "category": "Anti-Champion" },
  "Unstoppable Glaive": { "id": "unstoppable_glaive", "category": "Anti-Champion" },
  "Overload Sidearm": { "id": "overload_sidearm", "category": "Anti-Champion" },
  "Anti-Barrier Submachine Gun": { "id": "anti_barrier_smg", "category": "Anti-Champion" },
  "Unstoppable Shotgun": { "id": "unstoppable_shotgun", "category": "Anti-Champion" },
  "Anti-Barrier Scout Rifle": { "id": "anti_barrier_scout", "category": "Anti-Champion" },

  // Modern / Artifact Specs
  "Anti-Flinch Spec": { "id": "anti_flinch_spec", "category": "Modern" },
  "Origin Perk Spec": { "id": "origin_perk_spec", "category": "Modern" },
  "Volatile Flow": { "id": "volatile_flow", "category": "Artifact" },

  // Shaped Mods
  "Anti-Flinch": { "id": "anti_flinch", "category": "Shaped" },
  "Synergy": { "id": "synergy", "category": "Shaped" },
  "Bandolier": { "id": "bandolier", "category": "Shaped" },
  "Stunloader": { "id": "stunloader", "category": "Shaped" },
  "Aerodynamics": { "id": "aerodynamics", "category": "Shaped" },
  "Tension": { "id": "tension", "category": "Shaped" },
  "Tactical": { "id": "tactical", "category": "Shaped" },
  "Ballistics": { "id": "ballistics", "category": "Shaped" },
  "CQC Optics: High": { "id": "cqc_optics__high", "category": "Shaped" },
  "CQC Optics: Low": { "id": "cqc_optics__low", "category": "Shaped" },
  "Marksman Optics: High": { "id": "marksman_optics__high", "category": "Shaped" },
  "Marksman Optics: Low": { "id": "marksman_optics__low", "category": "Shaped" },
  "Flight": { "id": "flight", "category": "Shaped" },
  "Jumpshot": { "id": "jumpshot", "category": "Shaped" },
  "Shattershafts": { "id": "shattershafts", "category": "Shaped" },
  "Tungsten Bowstring": { "id": "tungsten_bowstring", "category": "Shaped" },
  "Abundant Ammo": { "id": "abundant_ammo", "category": "Shaped" },
  "Calm Amidst Chaos": { "id": "calm_amidst_chaos", "category": "Shaped" },
  "Overpressured Munitions": { "id": "overpressured_munitions", "category": "Shaped" },
  "Stay in the Fight": { "id": "stay_in_the_fight", "category": "Shaped" },
  "Kill Shot": { "id": "kill_shot", "category": "Shaped" },
  "Opening Salvo": { "id": "opening_salvo", "category": "Shaped" },

  // Enhanced Mods
  "Enhanced Accuracy": { "id": "enhanced_accuracy", "category": "Enhanced" },
  "Enhanced Blast Radius": { "id": "enhanced_blast_radius", "category": "Enhanced" },
  "Enhanced Charge Time": { "id": "enhanced_charge_time", "category": "Enhanced" },
  "Enhanced Draw Time": { "id": "enhanced_draw_time", "category": "Enhanced" },
  "Enhanced Handling": { "id": "enhanced_handling", "category": "Enhanced" },
  "Enhanced Heat Generated": { "id": "enhanced_heat_generated", "category": "Enhanced" },
  "Enhanced Impact": { "id": "enhanced_impact", "category": "Enhanced" },
  "Enhanced Persistence": { "id": "enhanced_persistence", "category": "Enhanced" },
  "Enhanced Projectile Speed": { "id": "enhanced_projectile_speed", "category": "Enhanced" },
  "Enhanced Range": { "id": "enhanced_range", "category": "Enhanced" },
  "Enhanced Reload": { "id": "enhanced_reload", "category": "Enhanced" },
  "Enhanced Shield Duration": { "id": "enhanced_shield_duration", "category": "Enhanced" },
  "Enhanced Stability": { "id": "enhanced_stability", "category": "Enhanced" },
  "Enhanced Vent Speed": { "id": "enhanced_vent_speed", "category": "Enhanced" }
};

async function fetchJson(url, apiKey) {
  console.log(`Fetching: ${url}`);
  const headers = {};
  if (apiKey) {
    headers['X-API-Key'] = apiKey;
  }
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`HTTP Error ${res.status}: ${res.statusText}`);
  return res.json();
}

/**
 * Main synchronizer function.
 * Connects to the Bungie Manifest, downloads items/plugsets/stats definitions,
 * extracts and processes all valid weapons/perks/stats/mods, and writes them to local snapshots.
 * @returns {Promise<{success: boolean, summary: object}>}
 */
export async function sync() {
  try {
    // Read active API Key from environment
    const apiKey = process.env.BUNGIE_API_KEY || process.env.VITE_BUNGIE_API_KEY || '';

    // 1. Create output directory if it doesn't exist
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    console.log('--- Step 1: Querying Bungie Manifest Metadata ---');
    const manifestMeta = await fetchJson(MANIFEST_URL, apiKey);
    const componentPaths = manifestMeta.Response?.jsonWorldComponentContentPaths?.en;

    if (!componentPaths) {
      throw new Error('Failed to resolve English component paths from manifest metadata.');
    }

    // Resolve specific component file endpoints
    const itemsUrl = `${BUNGIE_BASE_URL}${componentPaths.DestinyInventoryItemDefinition}`;
    const plugSetsUrl = `${BUNGIE_BASE_URL}${componentPaths.DestinyPlugSetDefinition}`;
    const statsUrl = `${BUNGIE_BASE_URL}${componentPaths.DestinyStatDefinition}`;

    console.log('--- Step 2: Downloading Component Tables ---');
    console.log('Downloading items, plugSets, and stats tables. This can take 10-25 seconds...');
    
    const [itemsTable, plugSetsTable, statsTable] = await Promise.all([
      fetchJson(itemsUrl, apiKey),
      fetchJson(plugSetsUrl, apiKey),
      fetchJson(statsUrl, apiKey)
    ]);

    console.log('Downloaded tables successfully.');
    console.log(`- Items Table Size: ${Object.keys(itemsTable).length} entries`);
    console.log(`- PlugSets Table Size: ${Object.keys(plugSetsTable).length} entries`);
    console.log(`- Stats Table Size: ${Object.keys(statsTable).length} entries`);

    console.log('--- Step 3: Processing & Saving Stats Catalog ---');
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

    console.log('--- Step 4: Processing Weapons ---');
    const prunedWeapons = [];
    const activePerkHashes = new Set();

    // Iterate items to filter weapons
    for (const [itemHashStr, itemDef] of Object.entries(itemsTable)) {
      const itemHash = parseInt(itemHashStr);

      // itemType 3 represents DestinyItemType.Weapon
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

        // Collect all possible plug hashes for this socket
        const possiblePlugs = new Set();
        
        if (entry.singleInitialItemHash) {
          possiblePlugs.add(entry.singleInitialItemHash);
        }

        if (entry.reusablePlugItems) {
          for (const item of entry.reusablePlugItems) {
            if (item.currentlyCanRoll !== false) {
              possiblePlugs.add(item.plugItemHash);
            }
          }
        }

        const randomPlugSetHash = entry.randomizedPlugSetHash;
        if (randomPlugSetHash && plugSetsTable[randomPlugSetHash]) {
          const plugSet = plugSetsTable[randomPlugSetHash];
          for (const plug of plugSet.reusablePlugItems || []) {
            if (plug.currentlyCanRoll !== false) {
              possiblePlugs.add(plug.plugItemHash);
            }
          }
        }

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
          if (plugItem.displayProperties?.name?.includes('Deprecated') || 
              plugItem.displayProperties?.name?.includes('Dummy')) return false;
          return true;
        });

        if (plugList.length === 0) return;

        // Classify socket category dynamically
        let categoryType = 'other';
        
        if (categoryHash === 3956125808) {
          categoryType = 'intrinsic';
        } else {
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
            categoryType = 'perk';
          }
        }

        // Exclude cosmetic, modification, or tracker sockets
        if (categoryType === 'other' || categoryType === 'mod') return;

        parsedSockets.push({
          index,
          cat: categoryType,
          plugs: plugList
        });

        plugList.forEach(pHash => activePerkHashes.add(pHash));

        // Resolve intrinsic frame display name (e.g., "Precision Frame") strictly at index 0
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
    fs.writeFileSync(path.join(OUTPUT_DIR, 'weapons.json'), JSON.stringify(prunedWeapons));
    console.log('Saved weapons.json.');

    console.log('--- Step 5: Processing Perks & Plugs ---');
    const perksMap = {};

    for (const perkHash of activePerkHashes) {
      const perkDef = itemsTable[perkHash];
      if (!perkDef) continue;

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
    fs.writeFileSync(path.join(OUTPUT_DIR, 'perks.json'), JSON.stringify(perksMap));
    console.log('Saved perks.json.');

    console.log('--- Step 6: Processing & Standardizing Mods ---');
    const extractedMods = [];
    const foundNames = new Set();

    for (const [hashStr, itemDef] of Object.entries(itemsTable)) {
      const hash = parseInt(hashStr);
      const name = itemDef.displayProperties?.name || '';
      
      if (!name) continue;

      const matchedTarget = TARGET_MODS[name];
      if (!matchedTarget) continue;

      const hasStats = itemDef.investmentStats && itemDef.investmentStats.length > 0;
      const isPlug = itemDef.plug !== undefined;
      const key = `${name}_${matchedTarget.category}`;

      if (foundNames.has(key)) {
        const existing = extractedMods.find(m => m.name === name && m.category === matchedTarget.category);
        if (existing) {
          const existingScore = (existing.hasStats ? 2 : 0) + (existing.isPlug ? 1 : 0);
          const currentScore = (hasStats ? 2 : 0) + (isPlug ? 1 : 0);
          if (currentScore > existingScore) {
            extractedMods.splice(extractedMods.indexOf(existing), 1);
          } else {
            continue;
          }
        }
      }

      const investmentStats = [];
      if (itemDef.investmentStats) {
        for (const stat of itemDef.investmentStats) {
          investmentStats.push({
            statHash: stat.statTypeHash,
            value: stat.value
          });
        }
      }

      extractedMods.push({
        id: matchedTarget.id,
        hash,
        name,
        description: itemDef.displayProperties?.description || '',
        icon: itemDef.displayProperties?.icon ? `${BUNGIE_BASE_URL}${itemDef.displayProperties.icon}` : null,
        category: matchedTarget.category,
        investmentStats,
        hasStats,
        isPlug
      });

      foundNames.add(key);
    }

    // Apply manual overrides / standardizations for complete reliability
    extractedMods.forEach(mod => {
      delete mod.hasStats;
      delete mod.isPlug;

      // Add standardized anti-champion fallback descriptions
      if (mod.category === 'Anti-Champion' && !mod.description) {
        if (mod.name.includes('Anti-Barrier')) {
          mod.description = 'Shield-Piercing. Firing this weapon pierces combatant shields, stuns Barrier Champions, and makes the weapon strong against Barrier Champions.';
        } else if (mod.name.includes('Unstoppable')) {
          mod.description = 'Strong against Unstoppable Champions. Aiming down sights for a short time loads a powerful explosive payload that stuns unshielded combatants and stuns Unstoppable Champions.';
        } else if (mod.name.includes('Overload')) {
          mod.description = 'Disruption. Landing consecutive hits disrupts combatants, delaying ability energy regeneration, lowering combatant damage output, and stunning Overload Champions.';
        }
      }

      // Standardize stat boosts for extreme precision
      if (mod.id === 'backup_mag' && mod.investmentStats.length === 0) {
        mod.investmentStats = [{ statHash: 3871231066, value: 30 }];
      }
      if (mod.id === 'adept_range' && mod.investmentStats.length === 0) {
        mod.investmentStats = [{ statHash: 1240592695, value: 10 }];
      }
      if (mod.id === 'adept_stability' && mod.investmentStats.length === 0) {
        mod.investmentStats = [{ statHash: 155624089, value: 10 }];
      }
      if (mod.id === 'adept_handling' && mod.investmentStats.length === 0) {
        mod.investmentStats = [{ statHash: 943549884, value: 10 }];
      }
      if (mod.id === 'adept_reload' && mod.investmentStats.length === 0) {
        mod.investmentStats = [{ statHash: 4188031367, value: 10 }];
      }
      if (mod.id === 'adept_counterbalance') {
        mod.investmentStats = [
          { statHash: 2715839340, value: 35 },
          { statHash: 1240592695, value: -10 }
        ];
      }
      if (mod.id === 'adept_icarus') {
        mod.investmentStats = [
          { statHash: 2714457168, value: 15 },
          { statHash: 943549884, value: 5 }
        ];
      }
      if (mod.id === 'adept_blast_radius') {
        mod.investmentStats = [{ statHash: 3444329767, value: 10 }];
      }
      if (mod.id === 'adept_projectile_speed') {
        mod.investmentStats = [{ statHash: 2961396640, value: 10 }];
      }
      if (mod.id === 'adept_charge_time') {
        mod.investmentStats = [{ statHash: 2961396640, value: -10 }];
      }
    });

    // Explicitly add specialized modern mods if not already generated from the manifest
    const modernSpecs = [
      {
        id: "anti_flinch_spec",
        hash: 2801436041,
        name: "Anti-Flinch Spec",
        description: "Reduces incoming flinch when taking damage from combatants.",
        icon: "https://www.bungie.net/common/destiny2_content/icons/89ffcaed9c4d7768197611016ace4e12.png",
        category: "Modern",
        investmentStats: []
      },
      {
        id: "origin_perk_spec",
        hash: 385627708,
        name: "Origin Perk Spec",
        description: "Slightly improves the benefits provided by this weapon's Origin Traits.",
        icon: "https://www.bungie.net/common/destiny2_content/icons/8fdd6abaa158ef90014fdd65abe25bbf.png",
        category: "Modern",
        investmentStats: []
      },
      {
        id: "volatile_flow",
        hash: 4217417025,
        name: "Volatile Flow",
        description: "Void weapons gain Volatile Rounds upon picking up an Orb of Power. Active seasonal modifier.",
        icon: "https://www.bungie.net/common/destiny2_content/icons/fba96cc885a0b062dab457e9a8a2dc4a.png",
        category: "Artifact",
        investmentStats: []
      }
    ];

    modernSpecs.forEach(spec => {
      const exists = extractedMods.some(m => m.id === spec.id);
      if (!exists) {
        extractedMods.push(spec);
      }
    });

    console.log(`Processed ${extractedMods.length} mods.`);
    fs.writeFileSync(path.join(OUTPUT_DIR, 'mods.json'), JSON.stringify(extractedMods, null, 2));
    console.log('Saved mods.json.');

    console.log('--- Automated Sync Pipeline Completed Successfully! ---');
    const summary = {
      weaponsCount: prunedWeapons.length,
      perksCount: Object.keys(perksMap).length,
      modsCount: extractedMods.length,
      weaponsSizeMB: (fs.statSync(path.join(OUTPUT_DIR, 'weapons.json')).size / (1024 * 1024)).toFixed(2),
      perksSizeMB: (fs.statSync(path.join(OUTPUT_DIR, 'perks.json')).size / (1024 * 1024)).toFixed(2),
      modsSizeKB: (fs.statSync(path.join(OUTPUT_DIR, 'mods.json')).size / 1024).toFixed(2)
    };
    console.log(summary);

    return { success: true, summary };

  } catch (error) {
    console.error('Extraction script encountered an error:', error);
    return { success: false, error: error.message };
  }
}

// Run immediately if executed directly from terminal
const isMain = process.argv[1] && (
  process.argv[1].endsWith('sync-manifest.js') || 
  process.argv[1].includes('sync-manifest')
);
if (isMain) {
  sync().then(res => {
    if (!res.success) {
      process.exit(1);
    }
  });
}
