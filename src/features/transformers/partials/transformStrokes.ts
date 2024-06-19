import { translateStrokeCap, translateStrokes } from '@plugin/translators';
import { Command } from 'svg-path-parser';

import { ShapeAttributes } from '@figpot/src/models/entities/penpot/shape';
import { Stroke } from '@figpot/src/models/entities/penpot/traits/stroke';

function isVectorLike(node: GeometryMixin | VectorLikeMixin): node is VectorLikeMixin {
  return 'vectorNetwork' in node;
}

function hasFillGeometry(node: GeometryMixin): boolean {
  return node.fillGeometry.length > 0;
}

export async function transformStrokes(node: GeometryMixin | (GeometryMixin & IndividualStrokesMixin)): Pick<ShapeAttributes, 'strokes'> {
  const vectorNetwork = isVectorLike(node) ? node.vectorNetwork : undefined;

  function strokeCaps(stroke: Stroke) {
    if (!hasFillGeometry(node) && vectorNetwork && vectorNetwork.vertices.length > 0) {
      stroke.strokeCapStart = translateStrokeCap(vectorNetwork.vertices[0]);
      stroke.strokeCapEnd = translateStrokeCap(vectorNetwork.vertices[vectorNetwork.vertices.length - 1]);
    }

    return stroke;
  }

  return {
    strokes: translateStrokes(node, strokeCaps),
  };
}

export async function transformStrokesFromVector(
  node: VectorNode,
  vector: Command[],
  vectorRegion: VectorRegion | undefined
): Pick<ShapeAttributes, 'strokes'> {
  function strokeCaps(stroke: Stroke) {
    if (vectorRegion !== undefined) return stroke;

    const startVertex = findVertex(node.vectorNetwork.vertices, vector[0]);
    const endVertex = findVertex(node.vectorNetwork.vertices, vector[vector.length - 1]);

    if (!startVertex || !endVertex) return stroke;

    stroke.strokeCapStart = translateStrokeCap(startVertex);
    stroke.strokeCapEnd = translateStrokeCap(endVertex);

    return stroke;
  }

  return {
    strokes: translateStrokes(node, strokeCaps),
  };
}

function findVertex(vertexs: readonly VectorVertex[], command: Command): VectorVertex | undefined {
  if (command.command !== 'moveto' && command.command !== 'lineto' && command.command !== 'curveto') return;

  return vertexs.find((vertex) => vertex.x === command.x && vertex.y === command.y);
}
