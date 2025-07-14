/* tslint:disable */
/* eslint-disable */
export enum Cell {
  Dead = 0,
  Alive = 1,
}
export class LandCell {
  private constructor();
  free(): void;
  land_level: number;
  water_level: number;
}
export class Landscape {
  private constructor();
  free(): void;
  tick(): void;
  reset(): void;
  static new_bowl(): Landscape;
  static new_from_dem(dem: Uint8Array, height: number, width: number): Landscape;
  width(): number;
  height(): number;
  cells(): number;
  set_water(row: number, column: number, water_level: number): void;
  make_stream(row: number, column: number): void;
}
export class Universe {
  private constructor();
  free(): void;
  static new(): Universe;
  static new_mod7(): Universe;
  static new_random(): Universe;
  tick(): void;
  render(): string;
  width(): number;
  height(): number;
  cells(): number;
  set_width(width: number): void;
  set_height(height: number): void;
  toggle_cell(row: number, column: number): void;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly __wbg_landcell_free: (a: number, b: number) => void;
  readonly __wbg_get_landcell_land_level: (a: number) => number;
  readonly __wbg_set_landcell_land_level: (a: number, b: number) => void;
  readonly __wbg_get_landcell_water_level: (a: number) => number;
  readonly __wbg_set_landcell_water_level: (a: number, b: number) => void;
  readonly __wbg_landscape_free: (a: number, b: number) => void;
  readonly landscape_tick: (a: number) => void;
  readonly landscape_reset: (a: number) => void;
  readonly landscape_new_bowl: () => number;
  readonly landscape_new_from_dem: (a: number, b: number, c: number, d: number) => number;
  readonly landscape_width: (a: number) => number;
  readonly landscape_height: (a: number) => number;
  readonly landscape_cells: (a: number) => number;
  readonly landscape_set_water: (a: number, b: number, c: number, d: number) => void;
  readonly landscape_make_stream: (a: number, b: number, c: number) => void;
  readonly __wbg_universe_free: (a: number, b: number) => void;
  readonly universe_new: () => number;
  readonly universe_new_mod7: () => number;
  readonly universe_new_random: () => number;
  readonly universe_tick: (a: number) => void;
  readonly universe_render: (a: number) => [number, number];
  readonly universe_width: (a: number) => number;
  readonly universe_height: (a: number) => number;
  readonly universe_cells: (a: number) => number;
  readonly universe_set_width: (a: number, b: number) => void;
  readonly universe_set_height: (a: number, b: number) => void;
  readonly universe_toggle_cell: (a: number, b: number, c: number) => void;
  readonly __wbindgen_free: (a: number, b: number, c: number) => void;
  readonly __wbindgen_exn_store: (a: number) => void;
  readonly __externref_table_alloc: () => number;
  readonly __wbindgen_export_3: WebAssembly.Table;
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
  readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
*
* @returns {InitOutput}
*/
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
