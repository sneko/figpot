import { checkbox, input, select } from '@inquirer/prompts';
import { JSONParser } from '@streamparser/json-node';
import assert from 'assert';
import bfj from 'bfj';
import fsSync from 'fs';
import { Readable } from 'node:stream';
import { pipeline } from 'stream/promises';
import { ReadableStream } from 'stream/web';

import {
  ErrorResponsePayloadWithErrorBoolean,
  GetFileNodesResponse,
  GetFileResponse,
  LocalVariable,
  Paint,
  RGBA,
  TypeStyle,
  VariableAlias,
  getFile,
  getFileNodes,
  getLocalVariables,
  getProjectFiles,
  getTeamProjects,
} from '@figpot/src/clients/figma';
import { DocumentOptionsType } from '@figpot/src/features/document';

export type FigmaDefinedTypography = {
  id: LocalVariable['id'];
  key: LocalVariable['key'];
  name: LocalVariable['name'];
  description: LocalVariable['description'];
  value: TypeStyle;
};

export type FigmaDefinedColor = {
  id: LocalVariable['id'];
  key: LocalVariable['key'];
  name: LocalVariable['name'];
  description: LocalVariable['description'];
  value?: Paint;
};

export function isColor(value: string | number | boolean | RGBA | VariableAlias): value is RGBA {
  return typeof value === 'object' && 'r' in value;
}

export function processDocumentsParametersFromInput(parameters: string[]): DocumentOptionsType[] {
  return parameters.map((parameter) => {
    const parts = parameter.split(':');

    return {
      figmaDocument: parts[0],
      penpotDocument: parts[1], // May be undefined if the user wants a new Penpot document
    };
  });
}

export async function retrieveStylesNodes(documentId: string, stylesIds: string[]): Promise<GetFileNodesResponse['nodes']> {
  if (!stylesIds.length) {
    return {};
  }

  const nodes: GetFileNodesResponse['nodes'] = {};

  // Figma gateway has URL length limit that is reached when having too many styles
  // So we need to chunk according to this limit to minize calls (have to do it step by step because each entry has a different length)
  // Ref: https://stackoverflow.com/a/40250849/3608410
  // Note: styles types `GRID` and `EFFECT` are most of the time a few, so no removing them for retrieval for future use
  const urlLengthLimitBytes = 8_192;
  const remainingBytesPerRequest = urlLengthLimitBytes - `https://api.figma.com/v1/files/${documentId}/nodes?depth=1&ids=`.length - 10; // We add a safe marging of 10 in case of specific default adding

  // [IMPORTANT] The generated Figma client is encoding all query parameters so we need to take this into account for `:` and `,`
  const delimiterLength = encodeURIComponent(',').length;

  const chunks: string[][] = [[]];
  let currentChunkIndex = 0;
  let currentChunkCount = 0;
  for (const styleId of stylesIds) {
    const encodedStyleIdLength = encodeURIComponent(styleId).length;

    // Take into account the `,` delimiter
    if (currentChunkCount + Math.max(chunks[currentChunkIndex].length - 1, 0) * delimiterLength + encodedStyleIdLength > remainingBytesPerRequest) {
      chunks.push([]);
      currentChunkIndex++;
      currentChunkCount = 0;
    }

    chunks[currentChunkIndex].push(styleId);
    currentChunkCount += encodedStyleIdLength;
  }

  for (const stylesIds of chunks) {
    const response = await getFileNodes({
      fileKey: documentId,
      ids: stylesIds.join(','),
      depth: 1, // Should only return styles but just in case...
    });

    // Merge nodes objects
    Object.assign(nodes, response.nodes);
  }

  return nodes;
}

export async function retrieveColors(documentId: string): Promise<FigmaDefinedColor[]> {
  const colors: FigmaDefinedColor[] = [];

  try {
    const localVariablesResult = await getLocalVariables({ fileKey: documentId });
    for (const localVariable of Object.values(localVariablesResult.meta.variables)) {
      if (localVariable.resolvedType === 'COLOR') {
        // TODO: variables can be nested, it should be taken into account to also make sure what happens if the nested variable is into another file
        // We rely on a value if provided by using the default Figma mode, and when it's not available The easier for us is to set the value from the hardcoded values of nodes (may be a problem in some cases if multiple mode applied, but it's unlikely)
        // Ref: https://forum.figma.com/t/how-to-access-variable-alias-value-from-another-collection/53203/4
        const collection = localVariablesResult.meta.variableCollections[localVariable.variableCollectionId];

        colors.push({
          id: localVariable.id,
          key: localVariable.key,
          name: localVariable.name,
          description: localVariable.description,
          value:
            !!collection &&
            localVariable.valuesByMode[collection.defaultModeId] !== undefined &&
            isColor(localVariable.valuesByMode[collection.defaultModeId])
              ? {
                  // Color variables can only manage a simple color so emulating to the appropriate Paint one
                  type: 'SOLID',
                  color: localVariable.valuesByMode[collection.defaultModeId] as RGBA,
                  blendMode: 'NORMAL',
                }
              : undefined,
        });
      }
    }
  } catch (error) {
    const body = (error as unknown as any).body as ErrorResponsePayloadWithErrorBoolean;

    if (body.status === 403 && body.message.includes('files:read')) {
      console.warn(
        `exact color variables names won't be transferred since Figma requires the most expensive plan just to get variables you defined (Enterprise plan you seem to not have)...`
      );
    } else {
      throw error;
    }
  }

  return colors;
}

export function mergeStylesColors(colors: FigmaDefinedColor[], documentTree: GetFileResponse, stylesNodes: GetFileNodesResponse['nodes']) {
  for (const [, styleNode] of Object.entries(stylesNodes)) {
    if (documentTree.styles[styleNode.document.id]?.styleType === 'FILL' && styleNode.document.type === 'RECTANGLE') {
      // A Figma style can contains multiple colors so we have to split them to fit with the Penpot logic of "1 style = 1 color"
      for (let i = 0; i < styleNode.document.fills.length; i++) {
        colors.push({
          id: styleNode.document.fills.length > 1 ? `${styleNode.document.id}_${i}` : styleNode.document.id, // Add a suffix to differentiate them if needed
          key: documentTree.styles[styleNode.document.id].key,
          name:
            styleNode.document.fills.length > 1
              ? `${documentTree.styles[styleNode.document.id].name} ${i + 1}`
              : documentTree.styles[styleNode.document.id].name,
          description: documentTree.styles[styleNode.document.id].description,
          value: styleNode.document.fills[i],
        });
      }
    }
  }
}

export function extractStylesTypographies(documentTree: GetFileResponse, stylesNodes: GetFileNodesResponse['nodes']): FigmaDefinedTypography[] {
  const typographies: FigmaDefinedTypography[] = [];

  for (const [, styleNode] of Object.entries(stylesNodes)) {
    if (documentTree.styles[styleNode.document.id]?.styleType === 'TEXT' && styleNode.document.type === 'TEXT') {
      typographies.push({
        id: styleNode.document.id,
        key: documentTree.styles[styleNode.document.id].key,
        name: documentTree.styles[styleNode.document.id].name,
        description: documentTree.styles[styleNode.document.id].description,
        value: styleNode.document.style,
      });
    }
  }

  return typographies;
}

export async function retrieveDocument(documentId: string) {
  // const documentTreeStream = (await getFile({
  //   fileKey: documentId,
  //   geometry: 'paths', // Needed to have all properties into nodes
  //   // geometry: undefined, // Needed to have all properties into nodes
  // })) as unknown as ReadableStream;

  // const parser = new JSONParser();

  // // const response = await fetch('http://example.com/');

  // const reader = documentTreeStream.pipeTo(parser);
  // reader.on('data', value => /* process element */);

  // throw 7777;

  // -----------------

  // bfj.

  // //
  // // needs to modify the autogenerated to return the response.body (ReadableStream)
  // //

  // const documentTreeStream = (await getFile({
  //   fileKey: documentId,
  //   geometry: 'paths', // Needed to have all properties into nodes
  //   // geometry: undefined, // Needed to have all properties into nodes
  // })) as unknown as ReadableStream;

  // // await pipeline(documentTreeStream, fsSync.createWriteStream('/Users/sneko/Documents/beta.gouv.fr/repos/figpot/test.json'));

  // // console.log()

  // // throw 7777;

  // console.log(typeof documentTreeStream);
  // // console.log(documentTreeStream.name);
  // console.log(11111);
  // console.log(documentTreeStream.constructor.name);

  // // documentTreeStream

  // // const aaa = documentTreeStream.getReader();
  // // aaa.on

  // // Readable.from(documentTreeStream)

  // const compatibleReadable = Readable.from(documentTreeStream);
  // // const compatibleReadable = new Readable().wrap(documentTreeStream as any);

  // // compatibleReadable.on

  console.log(444444);

  const documentTree: GetFileResponse = await new Promise<any>((resolve, reject) => {
    bfj
      .parse(fsSync.createReadStream('/Users/sneko/Documents/beta.gouv.fr/repos/figpot/test.json'))
      // .parse(compatibleReadable)
      .then((parsedObject: any) => {
        resolve(parsedObject);
      })
      .catch(reject);
  });

  console.log('parsing ended');
  console.log(22222);

  // Error: Cannot create a string longer than 0x1fffffe8 characters
  //   at TextDecoder.decode (node:internal/encoding:449:16)
  //   at utf8DecodeBytes (node:internal/deps/undici/undici:2973:34)
  //   at parseJSONFromBytes (node:internal/deps/undici/undici:4306:25)
  //   at successSteps (node:internal/deps/undici/undici:4288:27)
  //   at fullyReadBody (node:internal/deps/undici/undici:2724:9)
  //   at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
  //   at async consumeBody (node:internal/deps/undici/undici:4297:7)
  //   at getResponseBody (/Users/sneko/Documents/beta.gouv.fr/repos/figpot/src/clients/figma/core/request.ts:217:13)
  //   at <anonymous> (/Users/sneko/Documents/beta.gouv.fr/repos/figpot/src/clients/figma/core/request.ts:322:26) {
  // code: 'ERR_STRING_TOO_LONG'

  // - either use a stream if possible? but more complicated since it's not just an array (see etabli work)
  // - or do not include "paths" but they must be retrieved just after with another endpoint (maybe nodes?ids=...) and we should patch the original answer... seems complicated since that's not a server issue
  // -- if doing so, browse the document, if paths arrays are empty, add the object to a waitinglist
  // -- once all listed, nodes?ids=xxxx for all, and since having direct objects instances, patch them with paths
  // -- but it will not solve the issue of a string too wide? si... car c'est la string de réponse HTTP qui est trop longue... après individuellement c'est sûrement pas grave (quitte à tenter de tout nodes?ids=xxx et chunker si y'a des erreurs retournées)

  // Revoir : https://stackoverflow.com/questions/68230031/cannot-create-a-string-longer-than-0x1fffffe8-characters-in-json-parse

  // marche pas même sans "geometry: paths" ... wtf

  // TODO: return the metadata

  // it returns normally whereas an error "ERR_STRING_TOO_LONG" has been returned... we should check documentTree ... and find a proper way to look at code (using custom client?)
  // TODO: s'entraîner d'abord sans "paths" vu que ça bug déjà ... gain de temps
  // TODO: par la suite... p-e simplifier les SVG pour pas flinguer la UI. Ou alors ne pas les mettre tout simplement quand leur taille dépasse une certaine longueur (vu que la conversion est approximative actuellement)

  // For
  assert(documentTree);

  console.log(typeof documentTree);
  console.log(documentTree.document.children.map((c) => c.id));
  // console.log(documentTree);

  //
  // https://forum.figma.com/t/get-a-less-verbose-format-from-api-than-raw-json/79176
  //

  console.log(11111);
  // console.log(documentTree);
  console.log('good');

  throw 77777;

  return documentTree;
}

export async function retrieveDocumentsFromInput(): Promise<string[]> {
  // Teams cannot be gotten so expecting the user to precise it
  const teamId = await input({ message: 'What is the team ID to list the documents from? (you can see it inside the URL once on Figma)' });
  const teamAndProjects = await getTeamProjects({ teamId: teamId });

  const projectId = await select({
    message: `Inside the team "${teamAndProjects.name}", select the project to list documents from`,
    choices: teamAndProjects.projects.map((project) => {
      return {
        name: project.name,
        value: project.id,
        description: `(${project.id})`,
      };
    }),
  });

  const project = teamAndProjects.projects.find((p) => p.id === projectId);
  assert(project);

  const projectAndFiles = await getProjectFiles({ projectId: projectId });

  const documentsKeys = await checkbox({
    message: `Inside the project "${project.name}", select the documents to synchronize into Penpot`,
    choices: projectAndFiles.files.map((file) => {
      return {
        name: file.name,
        value: file.key,
        description: `(${file.key})`,
      };
    }),
  });

  if (!documentsKeys.length) {
    throw new Error('you should have selected at least a document');
  }

  return documentsKeys;
}
