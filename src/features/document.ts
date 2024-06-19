import { confirm } from '@inquirer/prompts';
import assert from 'assert';
import { camelCase } from 'change-case/keys';
import fsSync from 'fs';
import fs from 'fs/promises';
import path from 'path';
import { z } from 'zod';

import { GetFileResponse } from '@figpot/src/clients/figma';
import { PostCommandGetFileResponse, postCommandGetFile } from '@figpot/src/clients/penpot';
import { retrieveDocument } from '@figpot/src/features/figma';
import { transformDocumentNode } from '@figpot/src/features/transformers/transformDocumentNode';
import { PenpotDocument } from '@figpot/src/models/entities/penpot/document';
import { gracefulExit } from '@figpot/src/utils/system';

import { cleanHostedDocument } from './penpot';

const __root_dirname = process.cwd();

export const documentsFolderPath = path.resolve(__root_dirname, './data/documents/');
export const fontsFolderPath = path.resolve(__root_dirname, './data/fonts/');
export const mediasFolderPath = path.resolve(__root_dirname, './data/medias/');

export const FigmaToPenpotMapping = z.record(z.string(), z.string());
export type FigmaToPenpotMappingType = z.infer<typeof FigmaToPenpotMapping>;

export const Mapping = z.object({
  lastExport: z.date(),
  fonts: FigmaToPenpotMapping,
  assets: FigmaToPenpotMapping,
  nodes: FigmaToPenpotMapping,
  documents: FigmaToPenpotMapping,
});
export type MappingType = z.infer<typeof Mapping>;

export const Metadata = z.object({
  lastRetrieve: z.date(),
  // fonts: z.array(z.string()),
  // assets: ?,
  documentDependencies: z.array(z.string()),
});
export type MetadataType = z.infer<typeof Metadata>;

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

export function getFigmaDocumentTreePath(documentId: string) {
  return path.resolve(getFigmaDocumentPath(documentId), 'tree.json');
}

export function getPenpotDocumentPath(figmaDocumentId: string, penpotDocumentId: string) {
  return path.resolve(getFigmaDocumentPath(figmaDocumentId), 'export', `penpot_${penpotDocumentId}`);
}

export function getPenpotHostedDocumentTreePath(figmaDocumentId: string, penpotDocumentId: string) {
  return path.resolve(getPenpotDocumentPath(figmaDocumentId, penpotDocumentId), 'hosted-tree.json');
}

export function getFigmaToPenpotMappingPath(figmaDocumentId: string, penpotDocumentId: string) {
  return path.resolve(getPenpotDocumentPath(figmaDocumentId, penpotDocumentId), 'mapping.json');
}

export function getFigmaToPenpotDiffPath(figmaDocumentId: string, penpotDocumentId: string) {
  return path.resolve(getPenpotDocumentPath(figmaDocumentId, penpotDocumentId), 'diff.json');
}

export function getTransformedFigmaTreePath(documentId: string) {
  return path.resolve(getFigmaDocumentPath(documentId), 'transformed-tree.json');
}

// export function getTransformedFigmaTreePath(figmaDocumentId: string, penpotDocumentId: string) {
//   return path.resolve(getPenpotDocumentPath(figmaDocumentId, penpotDocumentId), 'transformed-tree.json');
// }

export async function readFigmaTreeFile(documentId: string): Promise<GetFileResponse> {
  const figmaTreePath = getFigmaDocumentTreePath(documentId);

  if (!fsSync.existsSync(figmaTreePath)) {
    throw new Error(`make sure to run the "retrieve" command on the Figma document "${documentId}" before using any other command`);
  }

  const figmaTreeString = await fs.readFile(figmaTreePath, 'utf-8');

  return JSON.parse(figmaTreeString) as GetFileResponse; // We did not implement a zod schema, hoping they keep the structure stable enough
}

export async function readTransformedFigmaTreeFile(documentId: string): Promise<PenpotDocument> {
  const transformedFigmaTreePath = getTransformedFigmaTreePath(documentId);

  if (!fsSync.existsSync(transformedFigmaTreePath)) {
    throw new Error(`make sure to run the "retrieve" command on the Figma document "${documentId}" before using any other command`);
  }

  const figmaTreeString = await fs.readFile(transformedFigmaTreePath, 'utf-8');

  return JSON.parse(figmaTreeString) as PenpotDocument; // We did not implement a zod schema, hoping they keep the structure stable enough
}

export async function readFigmaToPenpotDiffFile(figmaDocumentId: string, penpotDocumentId: string): Promise<unknown[]> {
  const diffPath = getFigmaToPenpotDiffPath(figmaDocumentId, penpotDocumentId);

  if (!fsSync.existsSync(diffPath)) {
    throw new Error(`make sure to run the "retrieve" command on the Figma document "${figmaDocumentId}" before using any other command`);
  }

  const diffString = await fs.readFile(diffPath, 'utf-8');

  return JSON.parse(diffString) as unknown[]; // We did not implement a zod schema, hoping they keep the structure stable enough
}

export async function retrieve(options: RetrieveOptionsType) {
  for (const document of options.documents) {
    // Save the document tree locally
    const documentTree = await retrieveDocument(document.figmaDocument);

    const documentFolderPath = getFigmaDocumentPath(document.figmaDocument);
    await fs.mkdir(documentFolderPath, { recursive: true });

    const treePath = path.resolve(documentFolderPath, 'tree.json');
    await fs.writeFile(treePath, JSON.stringify(documentTree, null, 2));
  }
}

export async function sortDocuments(documents: DocumentOptionsType[]): Promise<DocumentOptionsType[]> {
  // TODO: for now we test we only 1 document no having dependencies
  // but here we should take all meta.json file with dependencies of each and start by the one at the bottom with no children
  // then remove it, and take the one at the bottom with children, etc...
  assert(documents.length === 1);

  return documents;
}

export function transformDocument(documentTree: GetFileResponse, mapping: MappingType | null) {
  // Go from the Figma format to the Penpot one
  const penpotTree = transformDocumentNode(documentTree, mapping);

  return penpotTree;
}

export const TransformOptions = z.object({
  documents: z.array(DocumentOptions),
});
export type TransformOptionsType = z.infer<typeof TransformOptions>;

export async function transform(options: TransformOptionsType) {
  const orderedDocuments = sortDocuments(options.documents);

  // Go from the Figma format to the Penpot one
  for (const document of options.documents) {
    const figmaTree = await readFigmaTreeFile(document.figmaDocument);

    let mapping: MappingType | null = null;
    if (document.penpotDocument) {
      const mappingPath = getFigmaToPenpotMappingPath(document.figmaDocument, document.penpotDocument);

      if (!fsSync.existsSync(mappingPath)) {
        const answer = await confirm({
          message: `You target the Penpot document "${document.penpotDocument}" without having locally the mapping from previous synchronization. Are you sure to continue by overriding the target document?`,
        });

        if (!answer) {
          console.warn('the transformation operation has been aborted');

          return gracefulExit();
        }

        const mappingString = await fs.readFile(mappingPath, 'utf-8');
        mapping = Mapping.parse(JSON.parse(mappingString));
      }
    }

    const penpotTree = transformDocument(figmaTree, mapping);

    // TODO: if mapping here, put the file into Penport, but have to create
    // await fs.writeFile(getTransformedFigmaTreePath(document.figmaDocument, document.penpotDocument), JSON.stringify(penpotTree, null, 2));
    await fs.writeFile(getTransformedFigmaTreePath(document.figmaDocument), JSON.stringify(penpotTree, null, 2));
  }
}

export function getDifferences(currentTree: PenpotDocument, newTree: PenpotDocument): unknown[] {
  throw 'TO IMPLEMENT';
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

    await fs.writeFile(getPenpotHostedDocumentTreePath(document.figmaDocument, document.penpotDocument), JSON.stringify(hostedDocument, null, 2));

    const transformedDocument = await readTransformedFigmaTreeFile(document.figmaDocument);

    const hostedCoreDocument = cleanHostedDocument(hostedDocument);
    const diff = getDifferences(hostedCoreDocument, transformedDocument);

    await fs.writeFile(getFigmaToPenpotDiffPath(document.figmaDocument, document.penpotDocument), JSON.stringify(diff, null, 2));
  }
}

export async function processOperations(operations: any[]) {
  // Adjust local mapping with deleted/modified/created nodes
  // TODO: ...
}

export const SetOptions = z.object({
  documents: z.array(DocumentOptions),
});
export type SetOptionsType = z.infer<typeof SetOptions>;

export async function set(options: SetOptionsType) {
  // Execute operations onto Penpot instance to match the Figma documents
  // and adjust local mapping with deleted/modified/created nodes
  for (const document of options.documents) {
    assert(document.penpotDocument);

    const diff = readFigmaToPenpotDiffFile(document.figmaDocument, document.penpotDocument);

    // TODO:
    // await fs.writeFile(getFigmaToPenpotDiffPath(document.figmaDocument, document.penpotDocument), JSON.stringify(diff, null, 2));
  }
}

export const SynchronizeOptions = z.object({
  documents: z.array(DocumentOptions),
});
export type SynchronizeOptionsType = z.infer<typeof SynchronizeOptions>;

export async function synchronize(options: SynchronizeOptionsType) {
  // TODO: compute the entire node tree
  await retrieve(options);

  // TODO: then
  await transform(options);
  await compare(options);
  await set(options);
}
