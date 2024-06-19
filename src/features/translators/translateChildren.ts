import { SubcanvasNode } from '@figpot/src/clients/figma';
import { transformSceneNode } from '@figpot/src/features/transformers/transformSceneNode';
import { PenpotNode } from '@figpot/src/models/entities/penpot/node';

export function translateChildren(
  registeredPageNodes: PenpotNode[],
  figmaChildren: SubcanvasNode[],
  figmaParentId: string,
  baseX: number = 0,
  baseY: number = 0
) {
  for (const figmaChild of figmaChildren) {
    const penpotNode = transformSceneNode(registeredPageNodes, figmaChild, baseX, baseY);

    if (penpotNode) {
      // TODO: placeholder ID
      penpotNode.parentId = figmaParentId;

      registeredPageNodes.push(penpotNode);
    }
  }
}
