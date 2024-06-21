import assert from 'assert';

import { PostCommandGetFileResponse } from '@figpot/src/clients/penpot';
import { PenpotDocument } from '@figpot/src/models/entities/penpot/document';

export function cleanHostedDocument(hostedTree: PostCommandGetFileResponse): PenpotDocument {
  assert(hostedTree.data);

  // Remove fields not meaningful and specific to Penpot and those that are dynamic (so it can be compared to the conversion from Figma)

  const pagesIndex = (hostedTree.data as PenpotDocument['data']).pagesIndex;

  for (const [, page] of Object.entries(pagesIndex)) {
    for (const [, object] of Object.entries(page.objects)) {
      if (object.type === 'bool' || object.type === 'frame' || object.type === 'group') {
        delete object.shapes; // Since object is a reference it will act on the main object
      }
    }
  }

  return {
    name: hostedTree.name,
    data: {
      pagesIndex: pagesIndex,
    },
  };
}
