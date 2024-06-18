import { RectangleNode } from '@figpot/src/clients/figma';
import { transformBlend } from '@figpot/src/features/transformers/partials/transformBlend';
import { transformConstraints } from '@figpot/src/features/transformers/partials/transformConstraints';
// import { transformCornerRadius } from '@figpot/src/features/transformers/partials/transformCornerRadius';
import { transformDimension } from '@figpot/src/features/transformers/partials/transformDimensionAndPosition';
import { transformEffects } from '@figpot/src/features/transformers/partials/transformEffects';
import { transformFigmaIds } from '@figpot/src/features/transformers/partials/transformFigmaIds';
import { transformFills } from '@figpot/src/features/transformers/partials/transformFills';
import { transformProportion } from '@figpot/src/features/transformers/partials/transformProportion';
import { transformRotationAndPosition } from '@figpot/src/features/transformers/partials/transformRotationAndPosition';
import { transformSceneNode } from '@figpot/src/features/transformers/partials/transformSceneNode';
import { transformStrokes } from '@figpot/src/features/transformers/partials/transformStrokes';
import { RectShape } from '@figpot/src/models/entities/penpot/shapes/rect';

export function transformRectangleNode(node: RectangleNode, baseX: number, baseY: number): RectShape {
  return {
    type: 'rect',
    name: node.name,
    ...transformFigmaIds(node),
    ...transformFills(node),
    ...transformEffects(node),
    ...transformStrokes(node),
    ...transformDimension(node),
    ...transformRotationAndPosition(node, baseX, baseY),
    ...transformSceneNode(node),
    ...transformBlend(node),
    ...transformProportion(node),
    // TODO:
    // ...transformCornerRadius(node),
    ...transformConstraints(node),
  };
}
