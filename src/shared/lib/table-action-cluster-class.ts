/**
 * Row action clusters in tables: keep controls grouped at the end of the cell (same pattern as
 * Labs / Users). Avoid `justify-between` + full cell width — wide catalog tables stretch the
 * actions column and would push the two buttons to opposite edges.
 */
export function tableActionClusterClass(_actionCount: number): string {
  return "ml-auto flex w-fit max-w-full min-w-0 flex-wrap items-center justify-end gap-1";
}
