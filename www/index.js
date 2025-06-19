import { memory } from "canvas_exploration/canvas_exploration_bg.wasm";
import { Landscape, Landcell } from "canvas_exploration";

const CELL_SIZE = 10; // px

let landscape = Landscape.new_bowl();
const width = landscape.width();
const height = landscape.height();
const data_stride = 3;
let animationId = null;
const landscape_canvas = document.getElementById("landscape-canvas");
landscape_canvas.height = (CELL_SIZE + 1) * height + 1;
landscape_canvas.width = (CELL_SIZE + 1) * width + 1;
const ctx = landscape_canvas.getContext("2d");

const getLandIndex = (row, col) => {
  return row * width * data_stride + col * data_stride + 1;
};

const drawCells = () => {
  const cellsPtr = landscape.cells();
  const cells = new Uint8Array(memory.buffer, cellsPtr, width * height * 3);

  ctx.beginPath();

  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      const idx = getLandIndex(row, col);
      let cell = cells[idx];
      console.log(cell);
      debugger;
      ctx.fillStyle = `rgb(${cell} 0 0)`;

      ctx.fillRect(
        col * (CELL_SIZE + 1) + 1,
        row * (CELL_SIZE + 1) + 1,
        CELL_SIZE,
        CELL_SIZE,
      );
    }
  }

  ctx.stroke();
};

drawCells();
