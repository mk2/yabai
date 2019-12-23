import blessed from 'blessed';

export function calcUnicodeStrWidth(str: string): number {
  return blessed.unicode.strWidth(str);
}

export function shrinkStrWidth(str: string, maxWidth: number): string {
  const strWidth = calcUnicodeStrWidth(str);
  if (strWidth < maxWidth) return str;
  let shrinkStr = str.substr(0, Math.floor(strWidth * (strWidth / maxWidth)));
  while (maxWidth < calcUnicodeStrWidth(shrinkStr)) {
    shrinkStr = shrinkStr.substr(0, shrinkStr.length - 1);
  }
  return shrinkStr;
}
