export class CommonUtils {
  static findDuplicateStrings(strings: string[]): Array<string> {
    return Array.from(new Set(strings.filter((item, index) => strings.indexOf(item) !== index)));
  }

  static async readFile(path: string): Promise<string> {
    const readFile = await import('fs/promises').then((m) => m.readFile);
    return readFile(path, { encoding: 'utf-8' });
  }
}
