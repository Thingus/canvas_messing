import { LandscapeCanvas as LandscapeArtist } from "./pkg";
import fromUrl from "geotiff";
// import GeoTIFF {
//   fromUrl,
//   fromUrls,
//   fromArrayBuffer,
//   fromBlob,
// } from "https://cdn.jsdelivr.net/npm/geotiff";

const CELL_SIZE = 10;
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
  return new LandscapeArtist(width, height, CELL_SIZE, binned_data);
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
    landscape.draw(ctx);
    animationId = null;
  }
};

const restart = async (landscape) => {
  landscape.reset();
  pause();
  landscape.draw(ctx);
  animationId = null;
};

const setupLocalCanvas = (landscape) => {
  landscape_canvas.height = (CELL_SIZE + 1) * landscape.height() + 1;
  landscape_canvas.width = (CELL_SIZE + 1) * landscape.width() + 1;
  return landscape_canvas.getContext("2d");
};

async function run() {
  let landscape = await loadDem("./output_hh.tif");

  const renderLoop = () => {
    landscape.tick();
    landscape.draw(ctx);
    animationId = requestAnimationFrame(renderLoop);
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

  let ctx = setupLocalCanvas(landscape);
  setWater(landscape);
  landscape.draw(ctx);
  pause();
}
run();
