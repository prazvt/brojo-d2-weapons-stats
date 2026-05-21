import fs from 'fs';

const weapons = JSON.parse(fs.readFileSync('src/data/weapons.json', 'utf8'));

const coupList = weapons.filter(w => w.name === 'Midnight Coup');
coupList.forEach((coup, i) => {
  console.log(`\n--- Midnight Coup #${i + 1} ---`);
  console.log(JSON.stringify(coup, null, 2).substring(0, 1500));
});
