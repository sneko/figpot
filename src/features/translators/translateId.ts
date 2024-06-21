import { v7 as uuidv7 } from 'uuid';

export function translateId(figmaNodeId: string): string {
  // We use UUID v7 because Penpot seems to have one with timestamp at the beginning (even if they call if "v8", but this is to be free-form apparently)
}

export function translateUuidAsObjectKey(uuid: string): string {
  return uuid.replaceAll('-', '_');
}
