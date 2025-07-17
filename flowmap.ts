import { LandscapeArtist } from "./pkg";
import PeakDEM from "./output_hh.tif";
import { fromUrl } from "geotiff";

const CELL_SIZE = 2;
let animationId = null;

const landscape_canvas = document.getElementById("landscape-canvas") as HTMLCanvasElement;
const playPauseButton = document.getElementById("play-pause") as HTMLButtonElement;
const stepButton = document.getElementById("step") as HTMLButtonElement;
const restartButton = document.getElementById("restart") as HTMLButtonElement;

const loadDem = async (dem_path: string, cell_size: number, width: number, height: number) => {
  const image = await fromUrl(dem_path);
  const left = 50;
  const top = 10;
  const right = left + width;
  const bottom = top + height;
  const data = await image.readRasters({ window: [left, top, right, bottom] });
  // Don't like the typehack here, but lets not get bogged down in totally accurate typing
  const binned_data = binDem(data[0] as unknown as Array<number>);
  return new LandscapeArtist(width, height, cell_size, binned_data);
};

const binDem = (dem_data: number[]) => {
  const dem_round = dem_data.map((a) => Math.round(a));
  const min = Math.min(...dem_round);
  return new Uint8Array(dem_round.map((a) => a - min));
};

export default async function init_landscape(landscape_canvas: HTMLCanvasElement, cell_size: number, width: number, height: number): Promise<Array<Function>> {

  let landscape = await loadDem(PeakDEM, cell_size, width, height);
  let animationId: number | null = null
  var total_water: number

  const setWater = () => {
    //landscape.make_stream(30, 67);
    landscape.make_stream(39, 45);
  };

  landscape_canvas.height = landscape.pixel_height();
  landscape_canvas.width = landscape.pixel_width();
  console.log(landscape.pixel_height());
  console.log(landscape.pixel_width());
  const ctx = landscape_canvas.getContext("2d")!;

  const play = () => {
    renderLoop();
  };

  const isPaused = () => {
    return animationId === null;
  };

  const pause = () => {
    cancelAnimationFrame(animationId);
    animationId = null;
  };

  const step = () => {
    if (isPaused()) {
      landscape.tick();
      landscape.draw(ctx);
      animationId = null;
    }
  };

  const restart = () => {
    landscape.reset();
    pause();
    landscape.draw(ctx);
    animationId = null;
  };


  const renderLoop = () => {
    landscape.tick();
    landscape.draw(ctx);
    let new_total_water = landscape.get_total_water()
    // There's alway one spring-the highest spring may never get covered
    if (landscape.get_total_flowing() === 1
      && new_total_water === total_water
    ) {
      console.log("Flowmap is static, stopping.")
      pause();
      return
    }
    total_water = new_total_water
    animationId = requestAnimationFrame(renderLoop);
  };

  setWater();
  landscape.draw(ctx);
  pause();

  return [play, pause, step, restart, isPaused];
}

async function runrun() {
  let play, pause, step, restart, isPaused, getState;
  [play, pause, step, restart, isPaused, getState] =
    // await init_landscape(landscape_canvas!, 10, 200, 100);
    await init_landscape(landscape_canvas!, 20, 100, 500);

  playPauseButton.addEventListener("click", () => {
    if (isPaused()) {
      play();
    } else {
      pause();
    }
  });

  stepButton.addEventListener("click", () => {
    step();
  });

  restartButton.addEventListener("click", () => {
    restart();
  });
}
runrun();

// NOTE: canvas{
//   filter: blur(10px) sepia(80%)
//   }
