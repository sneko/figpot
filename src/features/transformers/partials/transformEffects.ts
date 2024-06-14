import { HasEffectsTrait } from '@figpot/src/clients/figma';
import { ShapeAttributes } from '@figpot/src/features/penpot';
import { translateBlurEffects } from '@figpot/src/features/translators/translateBlurEffects';
import { translateShadowEffects } from '@figpot/src/features/translators/translateShadowEffects';

export function transformEffects(node: HasEffectsTrait): Pick<ShapeAttributes, 'shadow' | 'blur'> {
  return {
    shadow: translateShadowEffects(node.effects),
    blur: translateBlurEffects(node.effects),
  };
}
