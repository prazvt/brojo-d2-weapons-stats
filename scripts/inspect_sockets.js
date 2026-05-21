const fs = require('fs');
const path = require('path');

const weapons = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/weapons.json'), 'utf8'));
const perks = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/perks.json'), 'utf8'));

// Find Autumn Wind
const autumnWind = weapons.find(w => w.name === 'Autumn Wind');
console.log('Autumn Wind Sockets:', JSON.stringify(autumnWind?.sockets, null, 2));

// Let's check some other weapons to see if they have duplicate barrel/magazine categories
weapons.slice(0, 10).forEach(w => {
  const cats = w.sockets.map(s => s.cat);
  const duplicates = cats.filter((c, index) => cats.indexOf(c) !== index);
  if (duplicates.length > 0) {
    console.log(`Weapon: ${w.name} (${w.weaponType}) has duplicate cats:`, duplicates);
  }
});
