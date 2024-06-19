import { ShapeAttributes } from '@figpot/src/models/entities/penpot/shape';

export async function transformProportion(node: LayoutMixin): Pick<ShapeAttributes, 'proportionLock'> {
  return {
    proportionLock: node.constrainProportions,
  };
}
