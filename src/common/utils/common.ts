export class CommonUtils {
  static findDuplicateStrings(strings: string[]): Array<string> {
    return Array.from(new Set(strings.filter((item, index) => strings.indexOf(item) !== index)));
  }
}
