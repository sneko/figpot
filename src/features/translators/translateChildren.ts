import { SubcanvasNode } from '@figpot/src/clients/figma';
import { transformSceneNode } from '@figpot/src/features/transformers/transformSceneNode';
import { PenpotNode } from '@figpot/src/models/entities/penpot/node';

export function translateChildren(figmaChildren: readonly SubcanvasNode[], flattenChildren: PenpotNode[], baseX: number = 0, baseY: number = 0) {
  for (const figmaChild of figmaChildren) {
    const penpotNode = transformSceneNode(figmaChild, baseX, baseY);

    if (penpotNode) {
      flattenChildren.push(penpotNode);
    }
  }
}
