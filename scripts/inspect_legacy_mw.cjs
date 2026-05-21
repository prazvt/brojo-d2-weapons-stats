const fs = require('fs');
const weapons = JSON.parse(fs.readFileSync('src/data/weapons.json', 'utf8'));
const perks = JSON.parse(fs.readFileSync('src/data/perks.json', 'utf8'));
const legacyCoup = weapons.find(x => x.hash === 1128225405);
const mwSocket = legacyCoup.sockets.find(s => s.cat === 'masterwork');

console.log('Legacy Coup masterwork plugs count:', mwSocket.plugs.length);
mwSocket.plugs.forEach(pHash => {
  const perk = perks[pHash];
  if (perk) {
    console.log(`Hash: ${pHash}`);
    console.log(`  Name: ${perk.name}`);
    console.log(`  Icon: ${perk.icon}`);
    console.log(`  Description: ${perk.description}`);
    console.log(`  InvestmentStats:`, perk.investmentStats);
  } else {
    console.log(`Hash: ${pHash} (NOT FOUND in perks.json)`);
  }
});
