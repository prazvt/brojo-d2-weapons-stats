const fs = require('fs');
const path = require('path');

const weapons = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/weapons.json'), 'utf8'));
const perks = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/perks.json'), 'utf8'));

// Print socket structures for 10 legendary weapons of different types
const legendaryWeapons = weapons.filter(w => w.tier === 'Legendary');
legendaryWeapons.slice(0, 10).forEach(w => {
  console.log(`\nWeapon: ${w.name} (${w.weaponType})`);
  w.sockets.forEach(s => {
    const firstPlugName = perks[s.plugs[0]]?.name || 'Unknown';
    console.log(`  Socket Index ${s.index}: Category = ${s.cat}, First Plug = ${firstPlugName}`);
  });
});
