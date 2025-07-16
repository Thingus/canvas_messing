import { LandscapeCanvas as LandscapeArtist } from "./pkg";
import PeakDEM from "./output_hh.tif";
import { fromUrl } from "geotiff";

const CELL_SIZE = 2;
let animationId = null;

const landscape_canvas = document.getElementById("landscape-canvas");
const playPauseButton = document.getElementById("play-pause");
const stepButton = document.getElementById("step");
const restartButton = document.getElementById("restart");

const loadDem = async (dem_path) => {
  const image = await fromUrl(dem_path);
  const left = 50;
  const top = 10;
  const right = 250;
  const bottom = 140;
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

function run(landscape) {
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
      debugger;
      landscape.draw(ctx);
      animationId = null;
    }
  };

  const restart = (landscape) => {
    landscape.reset();
    pause();
    landscape.draw(ctx);
    animationId = null;
  };

  const setupLocalCanvas = (landscape) => {
    landscape_canvas.height = landscape.pixel_height();
    landscape_canvas.width = landscape.pixel_width();
    console.log(landscape.pixel_height());
    console.log(landscape.pixel_width());
    return landscape_canvas.getContext("2d");
  };

  const ctx = setupLocalCanvas(landscape);

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

  setWater(landscape);
  landscape.draw(ctx);
  pause();
  play();
}

async function runrun() {
  let landscape = await loadDem(PeakDEM);
  run(landscape);
}
runrun();

// NOTE: canvas{
//   filter: blur(10px) sepia(80%)
//   }
