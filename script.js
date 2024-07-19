const bfj = require('bfj');
const fsSync = require('fs');
const fs = require('fs/promises');

async function mainA() {
  console.log(444444);

  const documentTree = await new Promise((resolve, reject) => {
    bfj
      .parse(fsSync.createReadStream('/Users/sneko/Documents/beta.gouv.fr/repos/figpot/test.json'))
      // .parse(compatibleReadable)
      .then((parsedObject) => {
        resolve(parsedObject);
      })
      .catch(reject);
  });

  console.log('parsing ended');
  console.log(22222);
}

async function mainB() {
  console.log(444444);

  const content = await fs.readFile('/Users/sneko/Documents/beta.gouv.fr/repos/figpot/test.json', 'utf-8');

  const parsed = JSON.parse(content);

  console.log(55555);
}

mainA();
// mainB();
