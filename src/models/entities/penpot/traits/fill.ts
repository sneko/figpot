import { Gradient } from '@figpot/src/models/entities/penpot/traits/gradient';
import { ImageColor, PartialImageColor } from '@figpot/src/models/entities/penpot/traits/imageColor';
import { Uuid } from '@figpot/src/models/entities/penpot/traits/uuid';

export type Fill = {
  fillColor?: string;
  fillOpacity?: number;
  fillColorGradient?: Gradient;
  fillColorRefFile?: Uuid;
  fillColorRefId?: Uuid;
  fillImage?: ImageColor | PartialImageColor; // @TODO: move to any other place
};
