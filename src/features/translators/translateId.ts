export function translateUuidAsObjectKey(uuid: string): string {
  return uuid.replaceAll('-', '_');
}
