import { HasLayoutTrait } from '@figpot/src/clients/figma';
import { ShapeAttributes } from '@figpot/src/features/penpot';
import { translateConstraintH, translateConstraintV } from '@figpot/src/features/translators/translateConstraints';

export function transformConstraints(node: HasLayoutTrait): Pick<ShapeAttributes, 'constraintsH' | 'constraintsV'> {
  return {
    constraintsH: node.constraints ? translateConstraintH(node.constraints.horizontal) : undefined,
    constraintsV: node.constraints ? translateConstraintV(node.constraints.vertical) : undefined,
  };
}
