import { ImagePaint } from '@figpot/src/clients/figma';
import { Fill } from '@figpot/src/models/entities/penpot/traits/fill';

export function translateImageFill(fill: ImagePaint): Fill | undefined {
  return {
    fillOpacity: !fill.visible ? 0 : fill.opacity,
  };
}
