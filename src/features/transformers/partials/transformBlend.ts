import { BasePaint } from '@figpot/src/clients/figma';
import { ShapeAttributes } from '@figpot/src/features/penpot';
import { translateBlendMode } from '@figpot/src/features/translators/translateBlendMode';

export function transformBlend(node: BasePaint): Pick<ShapeAttributes, 'blendMode' | 'opacity'> {
  return {
    blendMode: translateBlendMode(node.blendMode),
    opacity: !node.visible ? 0 : node.opacity, // @TODO: check this. If we use the property hidden and it's hidden, it won't export
  };
}
