import fs from 'fs';

const weapons = JSON.parse(fs.readFileSync('src/data/weapons.json', 'utf8'));
const perks = JSON.parse(fs.readFileSync('src/data/perks.json', 'utf8'));

const coup = weapons.find(w => w.hash === 2763843898);
if (coup) {
  const mwSocket = coup.sockets.find(s => s.cat === 'masterwork');
  if (mwSocket) {
    console.log(`Modern Midnight Coup (2763843898) Masterwork Plugs count: ${mwSocket.plugs.length}`);
    mwSocket.plugs.forEach(pHash => {
      const perk = perks[pHash];
      console.log(`  - Plug ${pHash} => Name: "${perk?.name}", Icon: ${perk?.icon}`);
    });
  } else {
    console.log('No masterwork socket found for modern Midnight Coup!');
  }
} else {
  console.log('Modern Midnight Coup not found!');
}
