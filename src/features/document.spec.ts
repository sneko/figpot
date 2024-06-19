import { GetFileResponse } from '@figpot/src/clients/figma';
import { MappingType, getDifferences, transformDocument } from '@figpot/src/features/document';
import { cleanHostedDocument } from '@figpot/src/features/penpot';
import emptyFigmaTree from '@figpot/src/fixtures/documents/empty/figma.json';
import emptyPenpotTree from '@figpot/src/fixtures/documents/empty/penpot.json';

describe('document comparaison', () => {
  describe('empty', () => {
    it('should be equivalent', () => {
      const mapping: MappingType = {
        lastExport: new Date(),
        assets: [],
        documents: [],
        fonts: [],
        nodes: [
          {
            figmaId: '0:0',
            penpotId: '00000000-0000-0000-0000-000000000000',
          },
          {
            figmaId: '0:1',
            penpotId: '4bf0e9f6-08c8-809c-8004-85445179c2aa',
          },
        ],
      };

      const transformedTree = transformDocument(emptyFigmaTree as GetFileResponse, mapping);
      const cleanHostedTree = cleanHostedDocument(emptyPenpotTree);
      const diff = getDifferences(cleanHostedTree, transformedTree);

      expect(diff).toBeNull();
    });

    it('should require creation on penpot', () => {
      const mapping: MappingType = {
        lastExport: new Date(),
        assets: [],
        documents: [],
        fonts: [],
        nodes: [],
      };

      const transformedTree = transformDocument(emptyFigmaTree as GetFileResponse, mapping);
      const cleanHostedTree = cleanHostedDocument(emptyPenpotTree);
      const diff = getDifferences(cleanHostedTree, transformedTree);

      expect(diff).not.toBeNull();
    });
  });
});
