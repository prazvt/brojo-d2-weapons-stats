const fs = require('fs');
const weapons = JSON.parse(fs.readFileSync('src/data/weapons.json', 'utf8'));
const coups = weapons.filter(x => x.name.includes('Coup'));
console.log('Coups found:', JSON.stringify(coups.map(x => ({
  hash: x.hash,
  name: x.name,
  frame: x.frame,
  damageType: x.damageType,
  weaponType: x.weaponType,
  socketsCount: x.sockets.length,
  sockets: x.sockets.map(s => ({ index: s.index, cat: s.cat, plugsLength: s.plugs.length }))
})), null, 2));
