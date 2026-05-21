const fs = require('fs');
const weapons = JSON.parse(fs.readFileSync('src/data/weapons.json', 'utf8'));
const coup24 = weapons.find(x => x.hash === 2499720827);
const coup27 = weapons.find(x => x.hash === 2763843898);

console.log('Coup 2499720827 key count:', Object.keys(coup24).length);
console.log('Coup 2763843898 key count:', Object.keys(coup27).length);

// Check if they are deeply identical
const diffs = {};
for (const key of Object.keys(coup24)) {
  if (JSON.stringify(coup24[key]) !== JSON.stringify(coup27[key])) {
    diffs[key] = {
      coup24: typeof coup24[key] === 'object' ? 'object' : coup24[key],
      coup27: typeof coup27[key] === 'object' ? 'object' : coup27[key]
    };
  }
}
console.log('Differences:', diffs);
