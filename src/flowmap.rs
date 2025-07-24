// A landscape with water flowing over it
// Algorithm works in two modes, flowing and standing water
// Every cell has a constant land level and a variable statnding water level
// Every cell can also have water flowing over it if it does not have standing
// water
// On each tick
// - If a cell
//   - does not have water flowing
//   AND
//   - is lower than a neighbour which
//     - EITHER has water flowing
//     - OR has standing water > 0
//   ...it now has water flowing
// - If a cell
//   - has water flowing
//   AND
//   - is the lowest of its neighbours
//   ... it does not have water flowing
//   ... its standing water value increases by 1 (for now)
//

use rand::{prelude::*, rng};
use std::fmt;
use wasm_bindgen::prelude::*;
use web_sys::{CanvasRenderingContext2d, HtmlCanvasElement, ImageData};

pub fn set_panic_hook() {
    #[cfg(feature = "console_error_panic_hook")]
    console_error_panic_hook::set_once();
}

extern crate web_sys;

// A macro to provide `println!(..)`-style syntax for `console.log` logging.
macro_rules! log {
    ( $( $t:tt )* ) => {
        web_sys::console::log_1(&format!( $( $t )* ).into());
    }
}

type Level = u8;

#[derive(Clone, Copy, Debug)]
pub struct LandCell {
    pub land_level: Level,
    pub water_level: Level,
    has_water_flowing: bool,
}

impl LandCell {
    fn is_wet(&self) -> bool {
        self.water_level > 0
    }
    fn total_level(&self) -> Level {
        self.water_level + self.land_level
    }
}

impl fmt::Display for LandCell {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        writeln!(f, "land_level: {0}", self.land_level)?;
        writeln!(f, "water_level: {0}", self.water_level)?;
        Ok(())
    }
}

struct Landscape {
    width: u32,
    height: u32,
    cells: Vec<LandCell>,
    total_water: usize,
    total_flowing: usize,
}

impl Landscape {
    fn get_index(&self, row: u32, column: u32) -> usize {
        ((row * self.width) + column) as usize
    }

    fn get_neigbours(&self, row: u32, column: u32) -> Vec<&LandCell> {
        if [0, self.width - 1].contains(&column) || [0, self.height - 1].contains(&row) {
            panic!("Should not be checking boundary cells for neighbours")
        };

        let mut out: Vec<&LandCell> = vec![];

        for delta_row in [row - 1, row, row + 1] {
            for delta_col in [column - 1, column, column + 1] {
                if delta_row == row && delta_col == column {
                    continue;
                }
                let idx = self.get_index(delta_row, delta_col);

                out.push(&self.cells[idx]);
            }
        }
        out
    }

    pub fn is_lowest(target: &LandCell, neighbours: &Vec<&LandCell>) -> bool {
        neighbours
            .iter()
            .all(|cell| cell.total_level() >= target.total_level())
    }

    fn is_about_to_be_wet(target: &LandCell, neighbours: &Vec<&LandCell>) -> bool {
        neighbours.iter().any(|cell| {
            (cell.has_water_flowing || cell.water_level > 0)
                && cell.total_level() > target.total_level()
        })
    }

    pub fn tick(&mut self) {
        log!("Tick...");
        let mut rng = rand::rng();
        let mut next = self.cells.clone();

        // Skips the boundaries
        for row in 1..(self.height - 1) {
            for column in 1..(self.width - 1) {
                let idx = self.get_index(row, column);
                let cell = self.cells[idx];
                let mut next_cell = next[idx];
                let neighbours = self.get_neigbours(row, column);
                if Self::is_about_to_be_wet(&cell, &neighbours) {
                    next_cell.has_water_flowing = true;
                }
                if Self::is_lowest(&cell, &neighbours)
                    && Self::is_about_to_be_wet(&cell, &neighbours)
                {
                    next_cell.water_level += [0, 1, 1].choose(&mut rng).unwrap();
                    next_cell.has_water_flowing = false;
                }
                next[idx] = next_cell;
            }
        }

        self.cells = next;
        self.total_water = self.cells.iter().filter(|c| c.water_level > 0).count();
        self.total_flowing = self.cells.iter().filter(|c| c.has_water_flowing).count();
        log!(
            "{} cells now wet, {} cells now flowing",
            self.total_water,
            self.total_flowing
        );
    }

    pub fn reset(&mut self) {
        log!("Resetting water levels");
        let mut next = self.cells.clone();
        // Skips the boundaries
        for row in 1..(self.height - 1) {
            for column in 1..(self.width - 1) {
                let idx = self.get_index(row, column);
                let cell = self.cells[idx];
                let mut next_cell = next[idx];
                next_cell.water_level = 0;
                next[idx] = next_cell;
            }
        }
        self.cells = next;
    }

    pub fn new_bowl() -> Landscape {
        set_panic_hook();

        let width = 64;
        let height = 64;

        let mut cells: Vec<LandCell> = vec![];
        let mut land_level;

        // We'll just do a simple gradient for now
        // LESSON LEARNED: rust ranges are a <= x < b
        for row in 0..height {
            for column in 0..width {
                if [0, height - 1].contains(&row) || [0, width - 1].contains(&column) {
                    land_level = 255;
                } else {
                    land_level = 200 - (row + column);
                }
                cells.push(LandCell {
                    land_level,
                    water_level: 0,
                    has_water_flowing: false,
                })
            }
        }

        Landscape {
            height: height as u32,
            width: width as u32,
            cells,
            total_water: 0,
            total_flowing: 0,
        }
    }

    pub fn new_from_dem(dem: Vec<Level>, height: u32, width: u32) -> Landscape {
        if dem.len() as u32 != (height * width) {
            panic!("dem does not cast into heigh*width")
        }

        let mut cells: Vec<LandCell> = vec![];
        let mut land_level: Level;

        for row in 0..height {
            for column in 0..width {
                if [0, height - 1].contains(&row) || [0, width - 1].contains(&column) {
                    land_level = 255;
                } else {
                    let idx = ((row * width) + column) as usize;
                    land_level = dem[idx];
                }
                cells.push(LandCell {
                    land_level,
                    water_level: 0,
                    has_water_flowing: false,
                })
            }
        }

        Landscape {
            height,
            width,
            cells,
            total_water: 0,
            total_flowing: 0,
        }
    }

    pub fn width(&self) -> u32 {
        self.width
    }

    pub fn height(&self) -> u32 {
        self.height
    }

    pub fn cells(&self) -> *const LandCell {
        self.cells.as_ptr()
    }

    pub fn set_water(&mut self, row: u32, column: u32, water_level: Level) {
        let idx = self.get_index(row, column);
        let mut cell = self.cells[idx].clone();
        cell.water_level = water_level;
        self.cells[idx] = cell;
    }
    pub fn make_stream(&mut self, row: u32, column: u32) {
        let idx = self.get_index(row, column);
        let mut cell = self.cells[idx].clone();
        cell.has_water_flowing = true;
        self.cells[idx] = cell;
    }
}

#[wasm_bindgen]
pub struct LandscapeArtist {
    landscape: Landscape,
    width: u32,
    height: u32,
    cell_size: u32,
}

#[wasm_bindgen]
impl LandscapeArtist {
    #[wasm_bindgen(constructor)]
    pub fn run(
        canvas_width_cells: u32,
        canvas_height_cells: u32,
        cell_size_pixels: u32,
        dem: Vec<Level>,
    ) -> LandscapeArtist {
        set_panic_hook();

        let dem_len = dem.len();

        log!("Beginning construction of canvas");
        log!("Width: {canvas_width_cells} cells");
        log!("Height: {canvas_height_cells} cells");
        log!("Cell size: {cell_size_pixels} pixels");
        log!("Dem: {dem_len} cells");

        // if (canvas_width_cells % cell_size_pixels != 0)
        //     || (canvas_height_cells % cell_size_pixels != 0)
        // {
        //     panic!("Cells must divide cleanly into canvas size");
        // }

        log!("Creating landscape from dem");
        let landscape = Landscape::new_from_dem(dem, canvas_height_cells, canvas_width_cells);

        log!("Creating canvas handler");
        let canvas = LandscapeArtist {
            landscape: landscape,
            width: canvas_width_cells,
            height: canvas_height_cells,
            cell_size: cell_size_pixels,
        };
        return canvas;
    }

    pub fn pixel_height(&self) -> u32 {
        return self.height * self.cell_size;
    }

    pub fn pixel_width(&self) -> u32 {
        return self.width * self.cell_size;
    }

    pub fn tick(&mut self) {
        self.landscape.tick();
    }
    pub fn reset(&mut self) {
        self.landscape.reset();
    }
    pub fn set_water(&mut self, row: u32, column: u32, water_level: u8) {
        self.landscape.set_water(row, column, water_level);
    }
    pub fn make_stream(&mut self, row: u32, column: u32) {
        self.landscape.make_stream(row, column);
    }
    pub fn get_total_water(&self) -> usize {
        return self.landscape.total_water;
    }

    pub fn get_total_flowing(&self) -> usize {
        return self.landscape.total_flowing;
    }
    pub fn draw(&self, context: &CanvasRenderingContext2d) {
        for x in 0..self.landscape.width {
            for y in 0..self.landscape.height {
                let idx = self.landscape.get_index(y, x);
                let cell = self.landscape.cells[idx];
                let color = LandscapeArtist::pick_cell_color(&cell);
                context.set_fill_style_str(&color);
                context.fill_rect(
                    (x * self.cell_size) as f64,
                    (y * self.cell_size) as f64,
                    self.cell_size as f64,
                    self.cell_size as f64,
                );
            }
        }
    }

    fn pick_cell_color(cell: &LandCell) -> String {
        // This could be done with a match, once I understand matches.
        if cell.is_wet() {
            let mut blue_shade = 230 - cell.water_level;
            if cell.has_water_flowing {
                blue_shade += 20;
            }
            return format!("rgb(00 00 {blue_shade})");
        } else if cell.has_water_flowing {
            return format!("rgb(00 00 240)");
        } else {
            return format!("rgb(00 {0} 00)", cell.land_level);
        }
    }
}
