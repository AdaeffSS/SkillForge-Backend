// @pc/pickers.ts
export async function ListPicker(list: any[]): Promise<string> {
  if (!list || list.length === 0) return '-'
  const idx = Math.floor(Math.random() * list.length);
  return list[idx];
}
