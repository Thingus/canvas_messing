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

use wasm_bindgen::prelude::*;

type Level = u8;

#[wasm_bindgen]
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

#[wasm_bindgen]
pub struct Landscape {
    width: u32,
    height: u32,
    cells: Vec<LandCell>,
}

impl Landscape {
    fn get_index(&self, row: u32, column: u32) -> usize {
        (row * self.width + column) as usize
    }

    fn get_neigbours(&self, row: u32, column: u32) -> Vec<&LandCell> {
        if [0, self.width].contains(&column) || [0, self.height].contains(&row) {
            panic!("Should not be checking boundary cells for neighbours")
        };

        let mut out: Vec<&LandCell> = vec![];

        for delta_row in [row - 1, row, row + 1] {
            for delta_col in [column - 1, column, column + 1] {
                if delta_row == 0 && delta_col == 0 {
                    continue;
                }
                let idx = self.get_index(delta_row, delta_col);
                out.push(&self.cells[idx])
            }
        }
        out
    }

    fn is_lowest(target: &LandCell, neighbours: Vec<&LandCell>) -> bool {
        neighbours
            .iter()
            .all(|cell| cell.total_level() > target.total_level())
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
        let next = self.cells.clone();

        for row in 1..self.height - 1 {
            for column in 1..self.width - 1 {
                let idx = self.get_index(row, column);
                let cell = self.cells[idx];
                let mut next_cell = next[idx];
                let neighbours = self.get_neigbours(row, column);
                if Self::is_lowest(&cell, neighbours) {
                    next_cell.water_level += 1
                }
            }
        }

        self.cells = next;
    }

    pub fn new_bowl() -> Landscape {
        let width = 64;
        let height = 64;

        let mut cells: Vec<LandCell> = vec![];

        // We'll just do a simple gradient for now
        for row in 0..height - 1 {
            for column in 0..width - 1 {
                cells.push(LandCell {
                    land_level: 255 - (row + column),
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
