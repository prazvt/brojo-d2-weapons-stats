import fs from 'fs';
import path from 'path';

const weapons = JSON.parse(fs.readFileSync('src/data/weapons.json', 'utf8'));
const stats = JSON.parse(fs.readFileSync('src/data/stats.json', 'utf8'));

const coupList = weapons.filter(w => w.name === 'Midnight Coup');
console.log(`Found ${coupList.length} weapons named "Midnight Coup":`);

coupList.forEach((coup, i) => {
  console.log(`\n--- Midnight Coup #${i + 1} ---`);
  console.log(`Hash: ${coup.hash}`);
  console.log(`weaponType: ${coup.weaponType}`);
  console.log(`damageType: ${coup.damageType}`);
  console.log(`tier: ${coup.tier}`);
  console.log(`Base Stats:`);
  Object.entries(coup.baseStats).forEach(([sHash, val]) => {
    const statName = stats[sHash]?.name || sHash;
    console.log(`  - ${statName} (${sHash}): ${JSON.stringify(val)}`);
  });
});
