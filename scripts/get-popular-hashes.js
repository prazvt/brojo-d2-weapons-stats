import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const weaponsPath = path.join(__dirname, '../src/data/weapons.json');
const perksPath = path.join(__dirname, '../src/data/perks.json');

const weapons = JSON.parse(fs.readFileSync(weaponsPath, 'utf8'));
const perks = JSON.parse(fs.readFileSync(perksPath, 'utf8'));

const targetNames = ['Midnight Coup', 'Apex Predator', 'Luna\'s Howl', 'The Recluse', 'Forbearance'];
const results = weapons.filter(w => targetNames.includes(w.name));

console.log('--- FOUND WEAPONS ---');
results.forEach(w => {
  console.log(`\nWeapon: ${w.name} (Hash: ${w.hash})`);
  console.log(`Type: ${w.weaponType} | Frame: ${w.frame} | Damage: ${w.damageType}`);
  console.log('Sockets:');
  w.sockets.forEach(s => {
    console.log(`  - Category: ${s.cat} (Index: ${s.index})`);
    const plugDetails = s.plugs.slice(0, 5).map(pHash => {
      const perk = perks[pHash];
      return perk ? `${perk.name} (${pHash})` : `Unknown (${pHash})`;
    });
    console.log(`    Plugs: [${plugDetails.join(', ')}]`);
  });
});
