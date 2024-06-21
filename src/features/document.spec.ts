import { GetFileResponse } from '@figpot/src/clients/figma';
import { MappingType, getDifferences, transformDocument } from '@figpot/src/features/document';
import { cleanHostedDocument } from '@figpot/src/features/penpot';
import emptyFigmaTree from '@figpot/src/fixtures/documents/empty/figma.json';
import emptyPenpotTree from '@figpot/src/fixtures/documents/empty/penpot.json';
import withRectangeFigmaTree from '@figpot/src/fixtures/documents/rectangle/figma.json';
import withRectangePenpotTree from '@figpot/src/fixtures/documents/rectangle/penpot.json';

describe('document comparaison', () => {
  describe('empty', () => {
    it('should be equivalent', () => {
      const mapping: MappingType = {
        lastExport: new Date(),
        assets: {},
        documents: {},
        fonts: {},
        nodes: {
          '0:0': '00000000-0000-0000-0000-000000000000',
          '0:1': '4bf0e9f6-08c8-809c-8004-85445179c2aa',
        },
      };

      const transformedTree = transformDocument(emptyFigmaTree as GetFileResponse, mapping);
      const cleanHostedTree = cleanHostedDocument(emptyPenpotTree);

      expect(transformedTree).toEqual(cleanHostedTree);

      const differences = getDifferences(cleanHostedTree, transformedTree);

      expect(differences.newDocumentName).toBeNull();
      expect(differences.newTreeOperations).toEqual([]);
    });

    it('should require changes', () => {
      const mapping: MappingType = {
        lastExport: new Date(),
        assets: {},
        documents: {},
        fonts: {},
        nodes: {},
      };

      const transformedTree = transformDocument(emptyFigmaTree as GetFileResponse, mapping);
      const cleanHostedTree = cleanHostedDocument(emptyPenpotTree);

      expect(transformedTree).not.toEqual(cleanHostedTree);

      const differences = getDifferences(cleanHostedTree, transformedTree);

      expect(differences.newDocumentName).not.toBeNull();
      expect(differences.newTreeOperations.length).toBe(3);
      expect(differences.newTreeOperations.map((op) => op.type)).toEqual(['add-page', 'mod-obj', 'del-page']);
    });
  });

  describe('with rectangle', () => {
    it('should be equivalent', () => {
      const mapping: MappingType = {
        lastExport: new Date(),
        assets: {},
        documents: {},
        fonts: {},
        nodes: {
          '0:0': '00000000-0000-0000-0000-000000000000',
          '0:1': '4bf0e9f6-08c8-809c-8004-85445179c2aa',
          '1:2': 'ddfee392-d246-80fc-8004-8664a46a5d1f',
        },
      };

      const transformedTree = transformDocument(withRectangeFigmaTree as GetFileResponse, mapping);
      const cleanHostedTree = cleanHostedDocument(withRectangePenpotTree);

      expect(transformedTree).toEqual(cleanHostedTree);

      const differences = getDifferences(cleanHostedTree, transformedTree);

      expect(differences.newDocumentName).toBeNull();
      expect(differences.newTreeOperations).toEqual([]);
    });

    it('should require changes2', () => {
      const mapping: MappingType = {
        lastExport: new Date(),
        assets: {},
        documents: {},
        fonts: {},
        nodes: {},
      };

      const transformedTree = transformDocument(withRectangeFigmaTree as GetFileResponse, mapping);
      const cleanHostedTree = cleanHostedDocument(withRectangePenpotTree);

      expect(transformedTree).not.toEqual(cleanHostedTree);

      const differences = getDifferences(cleanHostedTree, transformedTree);

      console.log(444444);
      console.log(JSON.stringify(transformedTree));
      console.log(5555555);
      console.log(JSON.stringify(differences));

      expect(differences.newDocumentName).not.toBeNull();
      expect(differences.newTreeOperations.length).toBe(4);
      expect(differences.newTreeOperations.map((op) => op.type)).toEqual(['add-page', 'mod-obj', 'del-page']);
    });
  });
});
