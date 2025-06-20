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

use std::fmt;
use wasm_bindgen::prelude::*;

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

#[wasm_bindgen]
#[repr(C)]
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

#[repr(C)]
#[wasm_bindgen]
pub struct Landscape {
    width: u32,
    height: u32,
    cells: Vec<LandCell>,
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

    pub fn is_lowest(target: &LandCell, neighbours: Vec<&LandCell>) -> bool {
        neighbours
            .iter()
            .all(|cell| cell.total_level() >= target.total_level())
    }

    fn is_about_to_be_wet(target: &LandCell, neighbours: Vec<&LandCell>) -> bool {
        neighbours
            .iter()
            .any(|cell| cell.has_water_flowing && cell.total_level() >= target.total_level())
    }
}

#[wasm_bindgen]
impl Landscape {
    pub fn tick(&mut self) {
        log!("Tick...");
        let mut next = self.cells.clone();

        // Skips the boundaries
        for row in 1..(self.height - 1) {
            for column in 1..(self.width - 1) {
                let idx = self.get_index(row, column);
                let cell = self.cells[idx];
                let mut next_cell = next[idx];
                let neighbours = self.get_neigbours(row, column);
                //log!("Cell: {cell}");
                if Self::is_lowest(&cell, neighbours) {
                    log!("Increasing water level at {row} {column}");
                    next_cell.water_level += 1;
                }
                next[idx] = next_cell;
            }
        }

        self.cells = next;
        let water_cells = self.cells.iter().filter(|c| c.water_level > 0).count();
        log!("{water_cells} cells now wet");
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
}
