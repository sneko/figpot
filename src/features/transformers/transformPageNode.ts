import assert from 'assert';

import { CanvasNode } from '@figpot/src/clients/figma';
import { MappingType } from '@figpot/src/features/document';
import { translateChildren } from '@figpot/src/features/translators/translateChildren';
import { translateId, translateUuidAsObjectKey } from '@figpot/src/features/translators/translateId';
import { PenpotNode } from '@figpot/src/models/entities/penpot/node';
import { PenpotPage } from '@figpot/src/models/entities/penpot/page';
import { rgbToHex } from '@figpot/src/utils/color';

export function transformPageNode(figmaNode: CanvasNode, mapping: MappingType): PenpotPage {
  //
  // TODO: we should strip properties of Penpot features like `proportionLock`
  // to be sure it does not trigger a useless update
  //

  // By default it should be `00000000-0000-0000-0000-000000000000` for each page but it would cause issues with multiple pages inside our unique graph
  // Since Penpot allows forcing IDs we rely on generating a random one (but using a fixed pattern as input for the mapping to work across synchronizations)
  const penpotRootFrameId = translateId('00000000-0000-0000-0000-000000000000', mapping);

  const page: PenpotPage = {
    id: translateId(figmaNode.id, mapping),
    name: figmaNode.name,
    options: {},
    objects: {
      [translateUuidAsObjectKey(penpotRootFrameId)]: {
        id: penpotRootFrameId,
        parentId: penpotRootFrameId,
        frameId: penpotRootFrameId,
        name: 'Root Frame',
        type: 'frame',
        x: 0,
        y: 0,
        width: 0.01,
        height: 0.01,
        rotation: 0,
        selrect: {
          x: 0,
          y: 0,
          width: 0.01,
          height: 0.01,
          x1: 0,
          y1: 0,
          x2: 0.01,
          y2: 0.01,
        },
        points: [
          {
            x: 0,
            y: 0,
          },
          {
            x: 0.01,
            y: 0,
          },
          {
            x: 0.01,
            y: 0.01,
          },
          {
            x: 0,
            y: 0.01,
          },
        ],
        transform: {
          a: 1,
          b: 0,
          c: 0,
          d: 1,
          e: 0,
          f: 0,
        },
        transformInverse: {
          a: 1,
          b: 0,
          c: 0,
          d: 1,
          e: 0,
          f: 0,
        },
        flipX: null,
        flipY: null,
        hideFillOnExport: false,
        proportionLock: false,
        strokes: [],
        proportion: 1,
        fills: [
          {
            fillColor: rgbToHex(figmaNode.backgroundColor),
            fillOpacity: 1,
          },
        ],
        // shapes: [], // This one seems just informational and would complicates the recursive top-down logic (this concerns bool, frame and group types)
      },
    },
  };

  const registeredPageNodes: PenpotNode[] = [];

  translateChildren(registeredPageNodes, figmaNode.children, figmaNode.id, mapping);

  for (const penpotPageNode of registeredPageNodes) {
    assert(penpotPageNode.id); // It would mean we forget to translate it in a specific node type

    page.objects[translateUuidAsObjectKey(penpotPageNode.id)] = penpotPageNode;
  }

  return page;
}
