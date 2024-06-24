import { v7 as uuidv7 } from 'uuid';

import { MappingType } from '@figpot/src/features/document';

export const rootFrameId = '00000000-0000-0000-0000-000000000000';

export function translateId(figmaNodeId: string, mapping: MappingType): string {
  const penpotMappedNodeId = mapping.nodes.get(figmaNodeId);
  if (penpotMappedNodeId) {
    return penpotMappedNodeId;
  }

  // Otherwise we create a new one, adding it to the mapping object
  // Note: we use UUID v7 because Penpot seems to have one with timestamp at the beginning (even if they call if "v8", but this is to be free-form apparently)
  const penpotNodeId = uuidv7();
  mapping.nodes.set(figmaNodeId, penpotNodeId);

  return penpotNodeId;
}

export function translateUuidAsObjectKey(uuid: string): string {
  return uuid.replaceAll('-', '_');
}
