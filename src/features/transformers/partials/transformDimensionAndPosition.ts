import { HasLayoutTrait } from '@figpot/src/clients/figma';
import { ShapeGeomAttributes } from '@figpot/src/models/entities/penpot/shape';

export function transformDimension(node: HasLayoutTrait): Pick<ShapeGeomAttributes, 'width' | 'height'> {
  // TODO: the "RectangleNode" cannot have width and height... have to adjust the logic...
  // either make "RectangleNode & Size" or "RectangleNode & Rectangle" or something else?
  // or change the logic?

  throw 4444;

  // return {
  //   width: node.width,
  //   height: node.height,
  // };
}
