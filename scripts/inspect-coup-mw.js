import fs from 'fs';

const weapons = JSON.parse(fs.readFileSync('src/data/weapons.json', 'utf8'));
const perks = JSON.parse(fs.readFileSync('src/data/perks.json', 'utf8'));

const coup = weapons.find(w => w.hash === 1128225405);
if (coup) {
  const mwSocket = coup.sockets.find(s => s.cat === 'masterwork');
  if (mwSocket) {
    console.log(`Midnight Coup (1128225405) Masterwork Plugs count: ${mwSocket.plugs.length}`);
    mwSocket.plugs.forEach(pHash => {
      const perk = perks[pHash];
      console.log(`  - Plug ${pHash} => Name: "${perk?.name}", Icon: ${perk?.icon}`);
    });
  } else {
    console.log('No masterwork socket found for legacy Midnight Coup!');
  }
} else {
  console.log('Legacy Midnight Coup not found!');
}
