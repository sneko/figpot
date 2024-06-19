import { camelCase } from 'change-case/keys';
import fsSync from 'fs';
import fs from 'fs/promises';
import path from 'path';
import { z } from 'zod';

import { GetFileResponse, getFile } from '@figpot/src/clients/figma';
import { PostCommandGetFileResponse, postCommandGetFile } from '@figpot/src/clients/penpot';
import { transformDocumentNode } from '@figpot/src/features/transformers/transformDocumentNode';

const __root_dirname = process.cwd();

export const documentsFolderPath = path.resolve(__root_dirname, './data/documents/');
export const fontsFolderPath = path.resolve(__root_dirname, './data/fonts/');
export const mediasFolderPath = path.resolve(__root_dirname, './data/medias/');

export const DocumentOptions = z.object({
  figmaDocument: z.string(),
  penpotDocument: z.string().optional(), // If empty a new file will be created
});
export type DocumentOptionsType = z.infer<typeof DocumentOptions>;

export const RetrieveOptions = z.object({
  documents: z.array(DocumentOptions),
});
export type RetrieveOptionsType = z.infer<typeof RetrieveOptions>;

export function getFigmaDocumentPath(documentId: string) {
  return path.resolve(documentsFolderPath, `figma_${documentId}`);
}

export function getPenpotDocumentPath(figmaDocumentId: string, penpotDocumentId: string) {
  return path.resolve(getFigmaDocumentPath(figmaDocumentId), 'export', `penpot_${penpotDocumentId}`);
}

export async function retrieve(options: RetrieveOptionsType) {
  for (const document of options.documents) {
    // Save the document tree locally
    const documentTree = await getFile({
      fileKey: document.figmaDocument,
      geometry: 'paths',
    });

    const documentFolderPath = getFigmaDocumentPath(document.figmaDocument);
    await fs.mkdir(documentFolderPath, { recursive: true });

    const treePath = path.resolve(documentFolderPath, 'tree.json');
    await fs.writeFile(treePath, JSON.stringify(documentTree, null, 2));

    // Find all external references to get them too
    // aaa;

    // Get the entire tree for each with vectors paths
    // Save each with metadata

    // Retrieve associated assets (fonts and medias)
    // getImageFills???

    // list in meta.json all fonts and assets?
    // direct dependencies only

    // TODO: add third-party if needed
  }
}

export const TransformOptions = z.object({
  documents: z.array(DocumentOptions),
});
export type TransformOptionsType = z.infer<typeof TransformOptions>;

export async function transform(options: TransformOptionsType) {
  // Go from the Figma format to the Penpot one
  for (const document of options.documents) {
    const figmaDocumentFolderPath = path.resolve(documentsFolderPath, `figma_${document.figmaDocument}`);
    const figmaTreePath = path.resolve(figmaDocumentFolderPath, 'tree.json');

    const figmaTreeString = await fs.readFile(figmaTreePath, 'utf-8');
    const figmaTree = JSON.parse(figmaTreeString) as GetFileResponse; // We did not implement a zod schema, hoping they keep the structure stable enough

    const penpotTree = await transformDocumentNode(figmaTree);

    const penpotTreePath = path.resolve(figmaDocumentFolderPath, 'transformed-tree.json');
    await fs.writeFile(penpotTreePath, JSON.stringify(penpotTree, null, 2));
  }
}

export const CompareOptions = z.object({
  documents: z.array(DocumentOptions),
});
export type CompareOptionsType = z.infer<typeof CompareOptions>;

export async function compare(options: CompareOptionsType) {
  // Take the Penpot one that has Figma node IDs and use the one from the mappings
  // Get documents from Penpot if already synchronized in the past
  // Calculate operations needed on the current hosted tree to match the Figma documents state
  for (const document of options.documents) {
    const figmaDocumentFolderPath = getFigmaDocumentPath(document.figmaDocument);
    let figmaDocumentFolderExists = fsSync.existsSync(figmaDocumentFolderPath);

    if (!figmaDocumentFolderExists) {
      throw new Error('figma document not existing locally, make sure to trigger commands in the right order');
    } else if (!document.penpotDocument) {
      throw new Error(
        `TODO: should create a new document, and be sure it's passed to next function, or change the logic to return raw data, not just files`
      );
    }

    let hostedDocument = await postCommandGetFile({
      requestBody: {
        id: document.penpotDocument,
      },
    });

    // TODO: for now the response is kebab-case despite types, so forcing the conversion (ref: https://github.com/penpot/penpot/pull/4760#pullrequestreview-2125984653)
    hostedDocument = camelCase(hostedDocument, Number.MAX_SAFE_INTEGER) as PostCommandGetFileResponse;

    const penpotDocumentFolderPath = getPenpotDocumentPath(document.figmaDocument, document.penpotDocument);
    await fs.mkdir(penpotDocumentFolderPath, { recursive: true });

    const treePath = path.resolve(penpotDocumentFolderPath, 'hosted-tree.json');
    await fs.writeFile(treePath, JSON.stringify(hostedDocument, null, 2));

    // We remove fields not meaningful and specific to Penpot and those that are dynamic (so it can be compared to the conversion from Figma)
    const hostedCoreDocument = {
      name: hostedDocument.name,
      data: !!hostedDocument.data
        ? {
            pagesIndex: (hostedDocument.data as any).pagesIndex,
          }
        : undefined,
    };
  }
}

export const SetOptions = z.object({
  documents: z.array(DocumentOptions),
});
export type SetOptionsType = z.infer<typeof SetOptions>;

export async function set(options: SetOptionsType) {
  // Execute operations onto Penpot instance to match the Figma documents
}

export const SynchronizeOptions = z.object({
  documents: z.array(DocumentOptions),
});
export type SynchronizeOptionsType = z.infer<typeof SynchronizeOptions>;

export async function synchronize(options: SynchronizeOptionsType) {
  await retrieve(options);
  await transform(options);
  await compare(options);
  await set(options);
}
