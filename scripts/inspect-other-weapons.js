import fs from 'fs';

const weapons = JSON.parse(fs.readFileSync('src/data/weapons.json', 'utf8'));
const stats = JSON.parse(fs.readFileSync('src/data/stats.json', 'utf8'));

for (let i = 0; i < 5; i++) {
  const weapon = weapons[i];
  console.log(`\n--- Weapon #${i + 1}: ${weapon.name} (${weapon.hash}) ---`);
  Object.entries(weapon.baseStats).forEach(([sHash, val]) => {
    const statName = stats[sHash]?.name || sHash;
    console.log(`  - ${statName} (${sHash}): ${JSON.stringify(val)}`);
  });
}
