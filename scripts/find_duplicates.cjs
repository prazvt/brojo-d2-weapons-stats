const fs = require('fs');
const weapons = JSON.parse(fs.readFileSync('src/data/weapons.json', 'utf8'));

const nameCounts = {};
weapons.forEach(x => {
  nameCounts[x.name] = (nameCounts[x.name] || 0) + 1;
});

const duplicates = Object.keys(nameCounts).filter(name => nameCounts[name] > 1);
console.log('Duplicate weapon names:', duplicates.map(name => {
  const matching = weapons.filter(x => x.name === name);
  return {
    name,
    instances: matching.map(m => ({
      hash: m.hash,
      damageType: m.damageType,
      sockets: m.sockets.length,
      hasOriginTrait: m.sockets.some(s => s.cat === 'origin_trait')
    }))
  };
}));
