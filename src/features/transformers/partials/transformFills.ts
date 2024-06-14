import { translateFills } from '@plugin/translators/fills';
import { ShapeAttributes } from '@ui/lib/types/shapes/shape';

export async function transformFills(node: MinimalFillsMixin & DimensionAndPositionMixin): Pick<ShapeAttributes, 'fills'> {
  return {
    fills: translateFills(node.fills),
  };
}
