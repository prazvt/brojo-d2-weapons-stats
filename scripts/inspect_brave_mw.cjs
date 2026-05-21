const fs = require('fs');
const perks = JSON.parse(fs.readFileSync('src/data/perks.json', 'utf8'));

const bravePlugs = [2302094943, 3915764595, 3915764594, 3915764593, 1187045864, 1690059054, 16638393, 1124054883, 3624435060, 16638392, 2617715132, 2617715133, 3349747415, 38912240, 905869860, 2240097604];
bravePlugs.forEach(pHash => {
  const perk = perks[pHash];
  if (perk) {
    console.log(`Hash: ${pHash}, Name: ${perk.name}, Stats: ${JSON.stringify(perk.investmentStats)}`);
  }
});
