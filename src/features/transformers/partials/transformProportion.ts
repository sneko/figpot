import { ShapeAttributes } from '@ui/lib/types/shapes/shape';

export async function transformProportion(node: LayoutMixin): Pick<ShapeAttributes, 'proportionLock'> {
  return {
    proportionLock: node.constrainProportions,
  };
}
