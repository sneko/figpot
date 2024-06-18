import { SubcanvasNode } from '@figpot/src/clients/figma';
import { transformRectangleNode } from '@figpot/src/features/transformers/transformRectangleNode';
import { PenpotNode } from '@figpot/src/models/entities/penpot/node';

// TODO:
// import {
//   transformBooleanNode,
//   transformComponentNode,
//   transformEllipseNode,
//   transformFrameNode,
//   transformGroupNode,
//   transformInstanceNode,
//   transformPathNode,
//   transformTextNode,
//   transformVectorNode,
// } from '.';

export function transformSceneNode(node: SubcanvasNode, baseX: number = 0, baseY: number = 0): Promise<PenpotNode | undefined> {
  let penpotNode: PenpotNode | undefined;

  switch (node.type) {
    case 'RECTANGLE':
      penpotNode = transformRectangleNode(node, baseX, baseY);
      break;
    // case 'ELLIPSE':
    //   penpotNode = transformEllipseNode(node, baseX, baseY);
    //   break;
    // case 'SECTION':
    // case 'FRAME':
    // case 'COMPONENT_SET':
    //   penpotNode = await transformFrameNode(node, baseX, baseY);
    //   break;
    // case 'GROUP':
    //   penpotNode = await transformGroupNode(node, baseX, baseY);
    //   break;
    // case 'TEXT':
    //   penpotNode = transformTextNode(node, baseX, baseY);
    //   break;
    // case 'VECTOR':
    //   penpotNode = transformVectorNode(node, baseX, baseY);
    //   break;
    // case 'STAR':
    // // case 'POLYGON':
    // case 'REGULAR_POLYGON':
    // case 'LINE':
    //   penpotNode = transformPathNode(node, baseX, baseY);
    //   break;
    // case 'BOOLEAN_OPERATION':
    //   penpotNode = await transformBooleanNode(node, baseX, baseY);
    //   break;
    // case 'COMPONENT':
    //   penpotNode = await transformComponentNode(node, baseX, baseY);
    //   break;
    // case 'INSTANCE':
    //   penpotNode = await transformInstanceNode(node, baseX, baseY);
    //   break;
  }

  if (penpotNode === undefined) {
    console.error(`Unsupported node type: ${node.type}`);
  }

  return penpotNode;
}
