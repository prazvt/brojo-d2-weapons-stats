const fs = require('fs');
const weapons = JSON.parse(fs.readFileSync('src/data/weapons.json', 'utf8'));
const legacyCoup = weapons.find(x => x.hash === 1128225405);
const modernCoup = weapons.find(x => x.hash === 2763843898);

console.log('Legacy Coup baseStats keys:', Object.keys(legacyCoup.baseStats));
console.log('Legacy Coup baseStats details:');
Object.entries(legacyCoup.baseStats).forEach(([sHash, val]) => {
  console.log(`  StatHash: ${sHash}, baseValue: ${val[0]}, min: ${val[1]}, max: ${val[2]}`);
});

console.log('\nModern Coup baseStats keys:', Object.keys(modernCoup.baseStats));
console.log('Modern Coup baseStats details:');
Object.entries(modernCoup.baseStats).forEach(([sHash, val]) => {
  console.log(`  StatHash: ${sHash}, baseValue: ${val[0]}, min: ${val[1]}, max: ${val[2]}`);
});
