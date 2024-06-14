import fsSync from 'fs';
import fs from 'fs/promises';
import path from 'path';
import { z } from 'zod';

import { GetFileResponse, getFile } from '@figpot/src/clients/figma';
import { transformPageNode } from '@figpot/src/features/transformers/transformPageNode';

const __root_dirname = process.cwd();

export const documentsFolderPath = path.resolve(__root_dirname, './data/documents/');
export const fontsFolderPath = path.resolve(__root_dirname, './data/fonts/');
export const mediasFolderPath = path.resolve(__root_dirname, './data/medias/');

export const RetrieveOptions = z.object({
  figmaDocuments: z.array(z.string()),
});
export type RetrieveOptionsType = z.infer<typeof RetrieveOptions>;

export async function retrieve(options: RetrieveOptionsType) {
  const documents = options.figmaDocuments;

  for (const documentId of documents) {
    // Save the document tree locally
    const document = await getFile({
      fileKey: documentId,
      geometry: 'paths',
    });

    const documentFolderPath = path.resolve(documentsFolderPath, `figma_${documentId}`);
    await fs.mkdir(documentFolderPath, { recursive: true });

    const treePath = path.resolve(documentFolderPath, 'tree.json');
    await fs.writeFile(treePath, JSON.stringify(document, null, 2));

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
  figmaDocuments: z.array(z.string()),
  penpotDocuments: z.array(z.string()).optional(),
});
export type TransformOptionsType = z.infer<typeof TransformOptions>;

export async function transform(options: TransformOptionsType) {
  const documents = options.figmaDocuments;

  // Go from the Figma format to the Penpot one
  for (const documentId of documents) {
    const documentFolderPath = path.resolve(documentsFolderPath, `figma_${documentId}`);
    const treePath = path.resolve(documentFolderPath, 'tree.json');

    const treeString = await fs.readFile(treePath, 'utf-8');
    const tree = JSON.parse(treeString) as GetFileResponse; // We did not implement a zod schema, hoping they keep the structure stable enough

    for (const pageNode of tree.document.children) {
      const penpotPageNode = await transformPageNode(pageNode);

      console.log(penpotPageNode);
    }
  }
}

export const CompareOptions = z.object({
  figmaDocuments: z.array(z.string()),
  penpotDocuments: z.array(z.string()).optional(),
});
export type CompareOptionsType = z.infer<typeof CompareOptions>;

export async function compare(options: CompareOptionsType) {
  // Take the Penpot one that has Figma node IDs and use the one from the mappings
  // Get documents from Penpot if already synchronized in the past
  // Calculate operations needed on the current hosted tree to match the Figma documents state
}

export const SetOptions = z.object({
  figmaDocuments: z.array(z.string()),
  penpotDocuments: z.array(z.string()).optional(),
});
export type SetOptionsType = z.infer<typeof SetOptions>;

export async function set(options: SetOptionsType) {
  // Execute operations onto Penpot instance to match the Figma documents
}

export const SynchronizeOptions = z.object({
  figmaDocuments: z.array(z.string()),
  penpotDocuments: z.array(z.string()).optional(),
});
export type SynchronizeOptionsType = z.infer<typeof SynchronizeOptions>;

export async function synchronize(options: SynchronizeOptionsType) {
  await retrieve(options);
  await transform(options);
  await compare(options);
  await set(options);
}
