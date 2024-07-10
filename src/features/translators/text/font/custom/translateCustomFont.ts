import { TypeStyle } from '@figpot/src/clients/figma';
import { translateFontVariantId } from '@figpot/src/features/translators/text/font/custom/translateFontVariantId';
import { translateFontId } from '@figpot/src/features/translators/translateId';
import { TextTypography } from '@figpot/src/models/entities/penpot/shapes/text';
import { BoundVariableRegistry } from '@figpot/src/models/entities/registry';

export function translateCustomFont(
  registry: BoundVariableRegistry,
  fontName: TypeStyle,
  fontWeight: string
): Pick<TextTypography, 'fontId' | 'fontVariantId' | 'fontWeight'> | undefined {
  const penpotFontVariantId = translateFontVariantId(fontName, fontWeight);

  // [WORKAROUND]
  // This is an issue with their Figma UI...
  const simulatedFigmaFontVariantId =
    fontName.fontFamily === 'Marianne Medium' ? `Marianne-${penpotFontVariantId}` : `${fontName.fontFamily}-${penpotFontVariantId}`; // Use to be consistent across synchronizations

  return {
    fontId: translateFontId(simulatedFigmaFontVariantId, fontName, registry.getMapping()),
    fontVariantId: translateFontVariantId(fontName, fontWeight),
    fontWeight: fontWeight,
  };
}
