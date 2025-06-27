import init, { memory } from "../pkg/canvas_exploration.js";
import { Landscape, Landcell } from "../pkg/canvas_exploration.js";
const GeoTIFF = require("geotiff");
const { fromUrl, fromUrls, fromArrayBuffer, fromBlob } = GeoTIFF;

const CELL_SIZE = 10; // px

const data_stride = 3;
let animationId = null;

const landscape_canvas = document.getElementById("landscape-canvas");
const playPauseButton = document.getElementById("play-pause");
const stepButton = document.getElementById("step");
const restartButton = document.getElementById("restart");

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

const setWater = (landscape) => {
  //landscape.make_stream(30, 67);
  landscape.make_stream(39, 45);
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
      ctx.fillStyle = `rgb(0 ${land_cell * 2} 0)`;

      let water_cell = cells[idx + 1];
      let is_stream = cells[idx + 2];

      if (water_cell > 0) {
        ctx.fillStyle = `rgb(0 0 ${2 * (255 - water_cell)})`;
      } else if (is_stream) {
        ctx.fillStyle = `rgb(0 250 242)`;
      }

      ctx.fillRect(col * CELL_SIZE, row * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    }
  }

  ctx.stroke();
};

// At this point, I realise why MVC is a good idea
const play = () => {
  playPauseButton.textContent = "⏸";
  renderLoop();
};

const isPaused = () => {
  return animationId === null;
};

const pause = () => {
  playPauseButton.textContent = "▶";
  cancelAnimationFrame(animationId);
  animationId = null;
};

const step = (landscape) => {
  if (isPaused()) {
    landscape.tick();
    drawCells(ctx, landscape);
    animationId = null;
  }
};

const restart = async (landscape) => {
  landscape.reset();
  pause();
  drawCells(ctx, landscape);
  animationId = null;
};

const setupCanvas = (landscape) => {
  landscape_canvas.height = (CELL_SIZE + 1) * landscape.height() + 1;
  landscape_canvas.width = (CELL_SIZE + 1) * landscape.width() + 1;
  return landscape_canvas.getContext("2d");
};

async function run() {
  debugger;
  await init();
  let landscape = await loadDem("./output_hh.tif");

  const renderLoop = () => {
    landscape.tick();
    drawCells(ctx, landscape);
    animationId = requestAnimationFrame(renderLoop);
  };

  const getLandIndex = (row, col) => {
    return row * landscape.width() * data_stride + col * data_stride;
  };

  playPauseButton.addEventListener("click", () => {
    if (isPaused()) {
      play();
    } else {
      pause();
    }
  });

  stepButton.addEventListener("click", () => {
    step(landscape);
  });

  restartButton.addEventListener("click", () => {
    restart(landscape);
  });

  let ctx = setupCanvas(landscape);
  setWater(landscape);
  drawCells(ctx, landscape);
  pause();
}
run();
