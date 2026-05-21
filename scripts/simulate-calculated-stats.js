import fs from 'fs';

const weaponsData = JSON.parse(fs.readFileSync('src/data/weapons.json', 'utf8'));
const perksData = JSON.parse(fs.readFileSync('src/data/perks.json', 'utf8'));
const statsData = JSON.parse(fs.readFileSync('src/data/stats.json', 'utf8'));

const activeWeapon = weaponsData.find(w => w.name === 'Midnight Coup');

const STAT_METADATA = {
  4043523819: { name: 'Impact', icon: 'Sword' },
  1240592695: { name: 'Range', icon: 'Layers' },
  155624089: { name: 'Stability', icon: 'Activity' },
  943549884: { name: 'Handling', icon: 'Zap' },
  4188031367: { name: 'Reload Speed', icon: 'Zap' },
  1345609583: { name: 'Aim Assistance', icon: 'Compass' },
  3555269338: { name: 'Zoom', icon: 'SlidersHorizontal' },
  2714457168: { name: 'Airborne Effectiveness', icon: 'Sparkles' },
  2715839340: { name: 'Recoil Direction', icon: 'Compass' },
  3871231066: { name: 'Magazine', icon: 'Layers' },
  4284893193: { name: 'RPM', icon: 'Activity' }
};

const ALLOWED_MASTERWORKS = {
  'Hand Cannon': ['Range', 'Stability', 'Handling', 'Reload Speed']
};

const activePerks = {};
activeWeapon.sockets.forEach(socket => {
  let defaultPlug = socket.plugs[0];
  if (socket.cat === 'masterwork') {
    const seenNames = new Set();
    const filtered = socket.plugs.filter(pHash => {
      const perk = perksData[pHash];
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
    if (filtered.length > 0) {
      defaultPlug = filtered[0];
    }
  }
  activePerks[socket.index] = defaultPlug;
});

const stats = {};
Object.entries(activeWeapon.baseStats).forEach(([sHashStr, [baseVal, minVal, maxVal]]) => {
  const sHash = parseInt(sHashStr);
  stats[sHash] = {
    base: baseVal,
    min: minVal,
    max: maxVal,
    offset: 0,
    final: baseVal
  };
});

Object.entries(activePerks).forEach(([socketIndex, perkHash]) => {
  const socket = activeWeapon.sockets.find(s => s.index === parseInt(socketIndex));
  if (socket && socket.cat === 'intrinsic' && socket.index === 0) return;

  const perk = perksData[perkHash];
  if (perk && perk.investmentStats) {
    perk.investmentStats.forEach(stat => {
      if (stats[stat.statHash]) {
        stats[stat.statHash].offset += stat.value;
      }
    });
  }
});

Object.keys(stats).forEach(sHash => {
  const stat = stats[sHash];
  const rawVal = stat.base + stat.offset;
  if (stat.max > 0) {
    stat.final = Math.max(stat.min, Math.min(stat.max, rawVal));
  } else {
    stat.final = Math.max(0, rawVal);
    stat.max = Math.max(100, stat.base);
  }
});

console.log('Calculated Stats:');
Object.entries(stats).forEach(([sHash, stat]) => {
  const meta = STAT_METADATA[sHash];
  if (meta) {
    console.log(`  - ${meta.name} (${sHash}): base=${stat.base}, final=${stat.final}, max=${stat.max}, offset=${stat.offset}`);
  } else {
    console.log(`  - [Unmapped Stat] (${sHash}): base=${stat.base}, final=${stat.final}`);
  }
});
