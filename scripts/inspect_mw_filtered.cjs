const fs = require('fs');
const weapons = JSON.parse(fs.readFileSync('src/data/weapons.json', 'utf8'));
const perks = JSON.parse(fs.readFileSync('src/data/perks.json', 'utf8'));
const activeWeapon = weapons.find(x => x.hash === 2763843898);

const ALLOWED_MASTERWORKS = {
  'Hand Cannon': ['Range', 'Stability', 'Handling', 'Reload Speed']
};

activeWeapon.sockets.forEach(socket => {
  if (socket.cat !== 'masterwork') return;
  console.log(`Socket Index: ${socket.index}`);
  
  const seenNames = new Set();
  const filtered = socket.plugs.filter(pHash => {
    const perk = perks[pHash];
    if (!perk) return false;
    const name = perk.name || '';
    const isOldStyle = /^(Masterwork Upgrade|Rework Weapon|Vanguard Masterwork|Crucible Masterwork)$/i.test(name);
    if (isOldStyle) return true;
    const match = name.match(/^(?:Masterwork|Masterworked|Tier 10): (Range|Stability|Handling|Reload Speed|Blast Radius|Velocity|Charge Time|Draw Time|Impact|Accuracy)$/i);
    if (!match) return false;
    const statName = match[1];
    const allowedStats = ALLOWED_MASTERWORKS[activeWeapon.weaponType] || ['Range', 'Stability', 'Handling', 'Reload Speed'];
    const isAllowed = allowedStats.includes(statName);
    if (!isAllowed) return false;
    if (perk.investmentStats && perk.investmentStats.length > 0) {
      let primaryStatHash = null;
      let highestValue = -999;
      perk.investmentStats.forEach(stat => {
        if (stat.value > highestValue) {
          highestValue = stat.value;
          primaryStatHash = stat.statHash;
        }
      });
      if (primaryStatHash) {
        const hasStat = activeWeapon.baseStats[primaryStatHash] !== undefined;
        if (!hasStat) return false;
        if (seenNames.has(name)) return false;
        seenNames.add(name);
        return true;
      }
    }
    return true;
  });
  
  console.log(`  Filtered Plugs:`, filtered.map(pHash => ({ hash: pHash, name: perks[pHash]?.name })));
});
