import assert from 'assert';

import { HasLayoutTrait } from '@figpot/src/clients/figma';
import { ShapeGeomAttributes } from '@figpot/src/models/entities/penpot/shape';

export function transformDimension(node: HasLayoutTrait): Pick<ShapeGeomAttributes, 'width' | 'height'> {
  assert(node.size);

  return {
    width: node.size.x,
    height: node.size.y,
  };
}
