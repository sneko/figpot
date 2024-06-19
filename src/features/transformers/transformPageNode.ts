import { CanvasNode } from '@figpot/src/clients/figma';
import { translateChildren } from '@figpot/src/features/translators/translateChildren';
import { PenpotNode } from '@figpot/src/models/entities/penpot/node';
import { PenpotPage } from '@figpot/src/models/entities/penpot/page';
import { rgbToHex } from '@figpot/src/utils/color';

export function transformPageNode(figmaNode: CanvasNode): PenpotPage {
  //
  // TODO: we should strip properties of Penpot features like `proportionLock`
  // to be sure it does not trigger a useless update
  //

  const page: PenpotPage = {
    options: {},
    objects: {
      '00000000_0000_0000_0000_000000000000': {
        id: '00000000-0000-0000-0000-000000000000',
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
        parentId: '00000000-0000-0000-0000-000000000000',
        frameId: '00000000-0000-0000-0000-000000000000',
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
        shapes: [],
      },
    },
    id: figmaNode.id,
    name: figmaNode.name,
  };

  const registeredPageNodes: PenpotNode[] = [];

  translateChildren(registeredPageNodes, figmaNode.children, figmaNode.id);

  for (const pageNode of registeredPageNodes) {
    page.objects[pageNode.id] = pageNode;
  }

  return page;
}
