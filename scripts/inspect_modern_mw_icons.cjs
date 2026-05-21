const fs = require('fs');
const perks = JSON.parse(fs.readFileSync('src/data/perks.json', 'utf8'));

const modernMWHashes = [2942552113, 2697220197, 186337601, 758092021];
modernMWHashes.forEach(pHash => {
  const perk = perks[pHash];
  if (perk) {
    console.log(`Hash: ${pHash}, Name: ${perk.name}, Icon: ${perk.icon}`);
  } else {
    console.log(`Hash: ${pHash} not found!`);
  }
});
