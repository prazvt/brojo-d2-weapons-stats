import fs from 'fs';

const weapons = JSON.parse(fs.readFileSync('src/data/weapons.json', 'utf8'));
const perks = JSON.parse(fs.readFileSync('src/data/perks.json', 'utf8'));

const coup = weapons.find(w => w.name === 'Midnight Coup');

if (!coup) {
  console.log('Midnight Coup not found!');
  process.exit(1);
}

console.log('Midnight Coup Sockets:');
coup.sockets.forEach((s, idx) => {
  console.log(`\nSocket ${idx} - Category: ${s.cat}`);
  s.plugs.forEach(pHash => {
    const perk = perks[pHash];
    if (perk) {
      console.log(`  - Plug: ${pHash} => Name: "${perk.name}"`);
      if (perk.investmentStats) {
        console.log(`    Stats:`, perk.investmentStats);
      }
    } else {
      console.log(`  - Plug: ${pHash} => [Unknown Perk]`);
    }
  });
});
