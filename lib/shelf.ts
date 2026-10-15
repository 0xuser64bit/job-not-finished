// Shared by the server page and the client filter form. Constants can't be
// imported from a "use client" module on the server: they arrive as references.
export const SHELF_SORTS = {
  pushed: "Recently pushed",
  neglected: "Most neglected",
  stars: "Most stars",
  name: "Name",
} as const;

export type ShelfSort = keyof typeof SHELF_SORTS;

export const isShelfSort = (value: string | undefined): value is ShelfSort =>
  value !== undefined && Object.hasOwn(SHELF_SORTS, value);
