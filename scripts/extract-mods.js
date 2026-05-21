import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables if available
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

const API_KEY = process.env.BUNGIE_API_KEY || '';
const BUNGIE_BASE_URL = 'https://www.bungie.net';
const MANIFEST_URL = `${BUNGIE_BASE_URL}/Platform/Destiny2/Manifest/`;
const OUTPUT_DIR = path.join(__dirname, '../src/data');

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

const TARGET_MODS = {
  // Standard Mods
  'Targeting Adjuster': { category: 'Standard', id: 'targeting_adjuster' },
  'Backup Mag': { category: 'Standard', id: 'backup_mag' },
  'Freehand Grip': { category: 'Standard', id: 'freehand_grip' },
  'Icarus Grip': { category: 'Standard', id: 'icarus_grip' },
  'Quick Access Sling': { category: 'Standard', id: 'quick_access_sling' },
  'Counterbalance Stock': { category: 'Standard', id: 'counterbalance_stock' },
  'Sprint Grip': { category: 'Standard', id: 'sprint_grip' },
  'Radar Tuner': { category: 'Standard', id: 'radar_tuner' },
  'Radar Booster': { category: 'Standard', id: 'radar_booster' },
  'Minor Spec': { category: 'Standard', id: 'minor_spec' },
  'Major Spec': { category: 'Standard', id: 'major_spec' },
  'Boss Spec': { category: 'Standard', id: 'boss_spec' },
  'Taken Spec': { category: 'Standard', id: 'taken_spec' },

  // Adept Mods
  'Adept Range': { category: 'Adept', id: 'adept_range' },
  'Adept Stability': { category: 'Adept', id: 'adept_stability' },
  'Adept Handling': { category: 'Adept', id: 'adept_handling' },
  'Adept Reload': { category: 'Adept', id: 'adept_reload' },
  'Adept Counterbalance': { category: 'Adept', id: 'adept_counterbalance' },
  'Adept Icarus': { category: 'Adept', id: 'adept_icarus' },
  'Adept Charge Time': { category: 'Adept', id: 'adept_charge_time' },
  'Adept Draw Time': { category: 'Adept', id: 'adept_draw_time' },
  'Adept Projectile Speed': { category: 'Adept', id: 'adept_projectile_speed' },
  'Adept Blast Radius': { category: 'Adept', id: 'adept_blast_radius' },
  'Adept Big Ones Spec': { category: 'Adept', id: 'adept_big_ones_spec' },

  // Anti-Champion Mods / Artifact Champion Sockets
  'Anti-Barrier Pulse Rifle': { category: 'Anti-Champion', id: 'anti_barrier_pulse' },
  'Unstoppable Hand Cannon': { category: 'Anti-Champion', id: 'unstoppable_hc' },
  'Overload Submachine Gun': { category: 'Anti-Champion', id: 'overload_smg' },
  'Anti-Barrier Sidearm': { category: 'Anti-Champion', id: 'anti_barrier_sidearm' },
  'Unstoppable Scout Rifle': { category: 'Anti-Champion', id: 'unstoppable_scout' },
  'Overload Bow': { category: 'Anti-Champion', id: 'overload_bow' },
  'Anti-Barrier Auto Rifle': { category: 'Anti-Champion', id: 'anti_barrier_auto' },
  'Overload Auto Rifle': { category: 'Anti-Champion', id: 'overload_auto' },
  'Unstoppable Bow': { category: 'Anti-Champion', id: 'unstoppable_bow' },
  'Unstoppable Glaive': { category: 'Anti-Champion', id: 'unstoppable_glaive' },
  'Overload Pulse Rifle': { category: 'Anti-Champion', id: 'overload_pulse' },
  'Overload Sidearm': { category: 'Anti-Champion', id: 'overload_sidearm' },
  'Anti-Barrier Submachine Gun': { category: 'Anti-Champion', id: 'anti_barrier_smg' },
  'Unstoppable Shotgun': { category: 'Anti-Champion', id: 'unstoppable_shotgun' },
  'Anti-Barrier Scout Rifle': { category: 'Anti-Champion', id: 'anti_barrier_scout' }
};

async function main() {
  try {
    console.log('--- Fetching Manifest Metadata ---');
    const manifestMeta = await fetchJson(MANIFEST_URL);
    const componentPaths = manifestMeta.Response?.jsonWorldComponentContentPaths?.en;

    if (!componentPaths) {
      throw new Error('Failed to resolve English component paths from manifest metadata.');
    }

    const itemsUrl = `${BUNGIE_BASE_URL}${componentPaths.DestinyInventoryItemDefinition}`;
    console.log('--- Fetching Inventory Items Table ---');
    const itemsTable = await fetchJson(itemsUrl);

    console.log('Searching for weapon mods...');
    const extractedMods = [];
    const foundNames = new Set();

    for (const [hashStr, itemDef] of Object.entries(itemsTable)) {
      const hash = parseInt(hashStr);
      const name = itemDef.displayProperties?.name || '';
      
      if (!name) continue;

      // Check if it matches one of our target mods
      const matchedTarget = TARGET_MODS[name];
      if (!matchedTarget) continue;

      // To avoid duplicates (e.g. deprecated versions or duplicate entries)
      // We prioritize entries that have plug definitions or investmentStats or look more authentic
      const hasStats = itemDef.investmentStats && itemDef.investmentStats.length > 0;
      const isPlug = itemDef.plug !== undefined;
      const isSandboxMod = itemDef.itemType === 19; // Mod

      const key = `${name}_${matchedTarget.category}`;
      // If we already saw this name, only overwrite if this one has stats and plug, or if the previous one didn't
      if (foundNames.has(key)) {
        const existing = extractedMods.find(m => m.name === name && m.category === matchedTarget.category);
        if (existing) {
          const existingScore = (existing.hasStats ? 2 : 0) + (existing.isPlug ? 1 : 0);
          const currentScore = (hasStats ? 2 : 0) + (isPlug ? 1 : 0);
          if (currentScore > existingScore) {
            // Replace
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

      // Special check: E.g., Adept mods have specific stat boosts.
      // Let's print out what we find.
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

    // Some mods might have missing stats or description in the database (e.g., champion mods have descriptions of what they stun).
    // Let's ensure standard stats are properly set if the database definition is lacking.
    // For example:
    // Adept Range adds +10 Range
    // Adept Stability adds +10 Stability
    // Adept Handling adds +10 Handling
    // Adept Reload adds +10 Reload Speed
    // Adept Counterbalance adds +35 Recoil Direction, -10 Range
    // Adept Icarus adds +15 Airborne Effectiveness, +5 Handling (historically +5 handling)
    // Adept Charge Time adds -10 Charge Time (stat value)
    // Adept Draw Time adds -10 Draw Time (stat value)
    // Adept Projectile Speed adds +10 Velocity
    // Adept Blast Radius adds +10 Blast Radius
    // Adept Big Ones Spec adds +7.7% damage against majors and bosses (no stat modifications, just description)
    // Let's hardcode fallbacks/corrections if they are missing or to ensure absolute precision.
    extractedMods.forEach(mod => {
      // Clean up auxiliary fields used for filtering
      delete mod.hasStats;
      delete mod.isPlug;

      // Ensure anti-champion mods have champion details in description if not present
      if (mod.category === 'Anti-Champion') {
        if (!mod.description) {
          if (mod.name.includes('Anti-Barrier')) {
            mod.description = 'Shield-Piercing. Firing this weapon pierces combatant shields, stuns Barrier Champions, and makes the weapon strong against Barrier Champions.';
          } else if (mod.name.includes('Unstoppable')) {
            mod.description = 'Strong against Unstoppable Champions. Aiming down sights for a short time loads a powerful explosive payload that stuns unshielded combatants and stuns Unstoppable Champions.';
          } else if (mod.name.includes('Overload')) {
            mod.description = 'Disruption. Landing consecutive hits disrupts combatants, delaying ability energy regeneration, lowering combatant damage output, and stunning Overload Champions.';
          }
        }
      }

      // Standardize stat overrides for accuracy
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
        // Adept counterbalance adds +35 Recoil Direction and -10 Range
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
        mod.investmentStats = [{ statHash: 2961396640, value: 10 }]; // Velocity
      }
      if (mod.id === 'adept_charge_time') {
        mod.investmentStats = [{ statHash: 2961396640, value: -10 }]; // Charge Time decrease (or similar stat)
      }
    });

    // Write to mods.json
    fs.writeFileSync(path.join(OUTPUT_DIR, 'mods.json'), JSON.stringify(extractedMods, null, 2));
    console.log(`Saved ${extractedMods.length} mods to mods.json`);

  } catch (error) {
    console.error('Mods extraction script encountered an error:', error);
    process.exit(1);
  }
}

main();
