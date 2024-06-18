import { GetFileResponse } from '@figpot/src/clients/figma';
import { transformPageNode } from '@figpot/src/features/transformers/transformPageNode';
import { PenpotDocument } from '@figpot/src/models/entities/penpot/document';

export async function transformDocumentNode(figmaNode: GetFileResponse): Promise<PenpotDocument> {
  // We use `GetFileResponse` instead of the type `DocumentNode` to have the "document" title
  return {
    name: figmaNode.name,
    data: {
      pagesIndex: Object.fromEntries(
        figmaNode.document.children.map((child) => {
          // TODO: placeholder ID
          return [child.id, transformPageNode(child)];
        })
      ),
    },
  };
}
