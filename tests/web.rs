//! Test suite for the Web and headless browsers.

#![cfg(target_arch = "wasm32")]

extern crate canvas_exploration;
extern crate wasm_bindgen_test;
use canvas_exploration::flowmap::LandCell;
use canvas_exploration::flowmap::Landscape;
use canvas_exploration::universe::Universe;
use wasm_bindgen_test::*;

wasm_bindgen_test_configure!(run_in_browser);

#[wasm_bindgen_test]
fn pass() {
    assert_eq!(1 + 1, 2);
}

#[cfg(test)]
pub fn input_spaceship() -> Universe {
    let mut universe = Universe::new();
    universe.set_width(6);
    universe.set_height(6);
    universe.set_cells(&[(1, 2), (2, 3), (3, 1), (3, 2), (3, 3)]);
    universe
}

#[cfg(test)]
pub fn expected_spaceship() -> Universe {
    let mut universe = Universe::new();
    universe.set_width(6);
    universe.set_height(6);
    universe.set_cells(&[(2, 1), (2, 3), (3, 2), (3, 3), (4, 2)]);
    universe
}

#[wasm_bindgen_test]
pub fn test_tick() {
    let mut input_universe = input_spaceship();
    let expected_universe = expected_spaceship();
    input_universe.tick();
    assert_eq!(&input_universe.get_cells(), &expected_universe.get_cells());
}

#[cfg(test)]
pub fn landscapes() -> Vec<LandCell> {
    vec![
        LandCell(200, 0, false),
        LandCell(200, 0, false),
        LandCell(200, 0, false),
    ]
}
#[cfg(test)]
pub fn test_is_lowest() {
    let test = LandCell(100, 0, 0);
    let neighbours = landscapes();
    assert!(Landscape::is_lowest(test, neighbours))
}
