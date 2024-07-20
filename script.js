// const bfj = require('bfj');
const fsSync = require('fs');
const fs = require('fs/promises');
const Asm = require('stream-json/Assembler');
const { parser } = require('stream-json');
const { chain } = require('stream-chain');

// async function mainA() {
//   console.log(444444);

//   const documentTree = await new Promise((resolve, reject) => {
//     bfj
//       .parse(fsSync.createReadStream('/Users/sneko/Documents/beta.gouv.fr/repos/figpot/test.json'))
//       // .parse(compatibleReadable)
//       .then((parsedObject) => {
//         resolve(parsedObject);
//       })
//       .catch(reject);
//   });

//   console.log('parsing ended');
//   console.log(22222);
// }

// async function mainB() {
//   console.log(444444);

//   const content = await fs.readFile('/Users/sneko/Documents/beta.gouv.fr/repos/figpot/test.json', 'utf-8');

//   const parsed = JSON.parse(content);

//   console.log(55555);
// }

async function mainC() {
  console.log(444444);

  const pipeline = chain([fsSync.createReadStream('/Users/sneko/Documents/beta.gouv.fr/repos/figpot/test.json'), parser()]);

  const asm = Asm.connectTo(pipeline);
  asm.on('done', (asm) => {
    console.log(6666);
    // console.log(asm.current);
    console.log(typeof asm.current);
  });

  console.log(55555);
}

// mainA();
// mainB();
mainC();
