import fs from 'fs';

const weapons = JSON.parse(fs.readFileSync('src/data/weapons.json', 'utf8'));

let nonArrayCount = 0;
weapons.forEach(weapon => {
  Object.entries(weapon.baseStats).forEach(([statHash, value]) => {
    if (!Array.isArray(value)) {
      nonArrayCount++;
      console.log(`Weapon "${weapon.name}" (${weapon.hash}) stat ${statHash} is not an array: ${JSON.stringify(value)}`);
    }
  });
});

console.log(`Total non-array stat values: ${nonArrayCount}`);
