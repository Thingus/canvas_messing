import { memory } from "canvas_exploration/canvas_exploration_bg.wasm";
import { Landscape, Landcell } from "canvas_exploration";
import GeoTIFF, { fromUrl, fromUrls, fromArrayBuffer, fromBlob } from "geotiff";

const CELL_SIZE = 10; // px

const data_stride = 3;
let animationId = null;
const landscape_canvas = document.getElementById("landscape-canvas");

const getLandIndex = (row, col) => {
  return row * landscape.width() * data_stride + col * data_stride;
};
const getWaterIndex = (row, col) => {
  return row * landscape.width() * data_stride + col * data_stride + 1;
};

const loadDem = async (dem_path) => {
  const image = await fromUrl(dem_path);
  const left = 50;
  const top = 10;
  const right = 150;
  const bottom = 60;
  const height = bottom - top;
  const width = right - left;
  const data = await image.readRasters({ window: [left, top, right, bottom] });
  const binned_data = binDem(data[0]);
  return Landscape.new_from_dem(binned_data, height, width);
};

const binDem = (dem_data) => {
  const dem_round = dem_data.map((a) => Math.round(a));
  const min = Math.min(...dem_round);
  return new Uint8Array(dem_round.map((a) => a - min));
};

const drawCells = (ctx, landscape) => {
  const cellsPtr = landscape.cells();
  const cells = new Uint8Array(
    memory.buffer,
    cellsPtr,
    landscape.width() * landscape.height() * data_stride,
  );

  ctx.beginPath();

  for (let row = 0; row < landscape.height(); row++) {
    for (let col = 0; col < landscape.width(); col++) {
      const idx = getLandIndex(row, col);
      let land_cell = cells[idx];
      ctx.fillStyle = `rgb(${land_cell * 2} 0 0)`;

      let water_cell = cells[idx + 1];

      if (water_cell > 0) {
        ctx.fillStyle = `rgb(0 0 255)`;
      }

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

const renderLoop = () => {
  landscape.tick();
  drawCells(ctx, landscape);
  animationId = requestAnimationFrame(renderLoop);
};

const setupCanvas = (landscape) => {
  landscape_canvas.height = (CELL_SIZE + 1) * landscape.height() + 1;
  landscape_canvas.width = (CELL_SIZE + 1) * landscape.width() + 1;
  return landscape_canvas.getContext("2d");
};

let landscape = await loadDem("./output_hh.tif");
let ctx = setupCanvas(landscape);
renderLoop();
