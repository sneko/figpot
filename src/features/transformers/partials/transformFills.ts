import { translateFills } from '@plugin/translators/fills';

import { HasLayoutTrait, MinimalFillsTrait } from '@figpot/src/clients/figma';
import { ShapeAttributes } from '@figpot/src/models/entities/penpot/shape';

export function transformFills(node: MinimalFillsTrait & HasLayoutTrait): Pick<ShapeAttributes, 'fills'> {
  return {
    fills: translateFills(node.fills),
  };
}
