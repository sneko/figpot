import bfj from 'bfj';
import { Readable } from 'stream';
import streamJson from 'stream-json';
import streamJsonValues from 'stream-json/streamers/StreamValues';

import { GetFileResponse } from '@figpot/src/clients/figma';
import withRectangeFigmaTree from '@figpot/src/fixtures/documents/rectangle/figma.json';

describe('streamToJson()', () => {
  it('should transform to the right object', async () => {
    const dataObject = withRectangeFigmaTree as GetFileResponse;
    const dataString = JSON.stringify(dataObject);

    const dataStream = new Readable();

    // streamJson.parser();

    // throw 555;

    const jsonParser = streamJson.parser({
      // jsonStreaming: true,
      // objectMode:
    });

    // dataStream

    //
    //
    //
    // sinon choper le nombre de pages avec un "depth=1", et ensuite faire la même sans "depth" mais mettre des "ids=$pageID"
    // mettre ça dans un ENV_VAR pour override le comportement par défaut
    //
    //
    // il faut quand même voir pour splitter la logique "par page" partout... ou alors gérer un unique "JSON file" mais avec un stream
    // (plus compliqué à faire ?)
    //
    //
    // OU juste détecter qu'il y a des fichiers "tree.json" / "tree-page-XXXX.json"
    // ce qui indiquerait qu'il faut d'abord parser tree.json, puis le patcher avec le contenu de chaque page...
    // ---
    // idem pour écrire, on écrit chaque page, puis un "delete" les properties, et on écrit "tree.json"
    // il faudrait avoir ça dans différents helpers
    //
    // dans tous les cas il faut avoir response.body.getReader()
    //
    //

    bfj;

    // await new Promise<void>((resolve, reject) => {
    //   dataStream
    //     .pipe(jsonParser)
    //     // Uncomment one of the following lines based on your need to filter, pick, or ignore parts of the JSON
    //     // .pipe(jsonFilter)
    //     // .pipe(jsonPick)
    //     // .pipe(jsonIgnore)
    //     // .pipe(streamJsonValues.streamValues({}))
    //     .on('data', (data) => {
    //       console.log('-----');
    //       console.log(data);
    //       // if (data.name === 'keyValue') {
    //       //   console.log('Key:', data.key);
    //       //   console.log('Value:', data.value);
    //       // }
    //     })
    //     .on('end', () => {
    //       console.log('Finished processing JSON file');

    //       resolve();
    //     })
    //     .on('error', (error) => {
    //       console.error('Error processing JSON file:', error);

    //       reject();
    //     });

    //   dataStream.push(Buffer.from(dataString, 'utf-8'));

    //   // // TODO: convert
    //   // JSON.parse();

    //   // const stream = fs.createReadStream('path/to/your/large.json');

    //   // expect(diffResult.get(2)?.state).toBe('updated');
    // });
  });
});
