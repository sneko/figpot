import { SubcanvasNode } from '@figpot/src/clients/figma';
import { PenpotNode } from '@figpot/src/features/penpot';

export async function translateChildren(children: readonly SubcanvasNode[], baseX: number = 0, baseY: number = 0): Promise<PenpotNode[]> {
  const transformedChildren: PenpotNode[] = [];

  for (const child of children) {
    const penpotNode = await transformSceneNode(child, baseX, baseY);

    if (penpotNode) transformedChildren.push(penpotNode);
  }

  return transformedChildren;
}
