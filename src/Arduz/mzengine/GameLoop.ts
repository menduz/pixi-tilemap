import { setTileset } from "../../TileEngine/Tile";
import { Map } from "../../TileEngine/Map";
import { update as updateCamera, pos as cameraPos } from './Camera';

export const now = performance ? () => performance.now() : () => Date.now();

export let tick = now();
let last = 0;

export let _renderer: PIXI.WebGLRenderer;
export let stage: PIXI.Container = null;
export let currentMap: Map = null;
export let engineElapsedTime: number = 0;
export const engineBaseSpeed = 0.16;

let scale = +(getOptionValue('scale') || 1);
let resolution = +(getOptionValue('resolution') || window.devicePixelRatio);
let ratio = window.devicePixelRatio / resolution;

function resizeTilemap() {
  if (!currentMap) return;
  currentMap.width = (_renderer.width + 2 * currentMap._margin) * scale;
  currentMap.height = (_renderer.height + 2 * currentMap._margin) * scale;
  stage.scale.x = 1.0 / scale;
  stage.scale.y = 1.0 / scale;
  stage.filterArea = new PIXI.Rectangle(0, 0, _renderer.width * scale, _renderer.height * scale);
}

function resize() {
  let r = ratio;
  _renderer.resize(window.innerWidth * r | 0, window.innerHeight * r | 0);
  resizeTilemap();
}

function getOptionValue(name: string) {
  let params = location.search.slice(1).split('&');
  for (let i = 0; i < params.length; i++) {
    if (params[i].substring(0, name.length) === name && params[i][name.length] === "=") {
      return params[i].substring(name.length + 1);
    }
  }
  return null;
}

// function isOptionValid(name: string) {
//   return location.search.slice(1).split('&').indexOf(name) >= 0;
// }

function setupView(element: HTMLCanvasElement) {
  _renderer = PIXI.autoDetectRenderer(element.width, element.height, { view: element, resolution: resolution, antialias: true, autoResize: true }) as PIXI.WebGLRenderer;
  resize();
  window.addEventListener('resize', resize);
}



function update() {
  tick = now();
  let dt = Math.min(1000, tick - last);
  dt *= engineBaseSpeed;
  engineElapsedTime = dt;
  last = tick;

  if (stage) {
    updateCamera(engineElapsedTime);

    currentMap.update();

    currentMap.origin.set(cameraPos.x + 16, cameraPos.y + 16);

    _renderer.render(stage);
    _renderer.gl.flush();
  }
  requestAnimationFrame(update);
}

function loadMap(map: string) {
  const loader = new PIXI.loaders.Loader();
  const width = 2500;
  const height = 2500;
  const data = generateEmptyMap(width, height);

  const tilesets = ['0.1'];

  tilesets.forEach($ => {
    const name = `tileset/${$}`;
    loader.add(name, 'cdn/grh/tilesets/' + $ + ".png");
  });

  loader.load(function (loader, resources) {
    tilesets.forEach($ => {
      const name = `tileset/${$}`;
      console.log(name, resources[name]);
      const tex = resources[name] && resources[name].texture;
      currentMap.bitmaps.push(tex);
      if (tex) tex.baseTexture.mipmap = true;
    });

    while (currentMap.bitmaps.length > 0 && !currentMap.bitmaps[currentMap.bitmaps.length - 1]) {
      currentMap.bitmaps.pop();
    }

    currentMap.setData(width, height, data);
    currentMap.refresh();

    update();
  });

}

function tileNumber(x: number, y: number, tileset: number) {
  return setTileset(x * 16 + y, tileset);
}


function generateEmptyMap(width: number, height: number) {
  let data: number[] = Array(width * height).map(() => 0);
  const z = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      data[(z * height + y) * width + x] = tileNumber(x % 4, y % 4, 0);
    }
  }
  return data;
}


export function start(element: HTMLCanvasElement) {
  setupView(element);

  currentMap = new Map();
  stage = new PIXI.Container();
  stage.addChild(currentMap);
  resizeTilemap();

  loadMap('Home');

  // rpgMakerLoader.load('Map001', function (err, map) {
  //   if (err) return;
  //   tilemap = map;
  //   tilemap.roundPixels = (scale == 1);
  //   stage = new PIXI.Container();
  //   stage.addChild(tilemap);
  //   resizeTilemap();
  // });
}