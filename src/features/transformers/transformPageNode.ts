import { CanvasNode } from '@figpot/src/clients/figma';
import { PenpotPage } from '@figpot/src/features/penpot';
import { translateChildren } from '@figpot/src/features/translators/translateChildren';
import { rgbToHex } from '@figpot/src/utils/color';

export async function transformPageNode(node: CanvasNode): Promise<PenpotPage> {
  return {
    name: node.name,
    options: {
      background: rgbToHex(node.backgroundColor),
    },
    children: await translateChildren(node.children),
  };
}
