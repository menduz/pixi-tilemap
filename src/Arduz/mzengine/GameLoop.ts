import { setTileset } from "../../TileEngine/Tile";
import { Map } from "../../TileEngine/Map";
import { update as updateCamera, pixelPosition, cameraOffset, setCameraPosition } from './Camera';
import { getGraphicInstance } from "../Graphics/Graphic";
import { Body } from "../game/Body";
import { getHeadingTo } from "../game/Input";

export const now = performance ? () => performance.now() : () => Date.now();

export let tick = now();
let last = 0;

export let _renderer: PIXI.WebGLRenderer;
export let stage: PIXI.Container = null;
export let currentMap: Map = null;
export let engineElapsedTime: number = 0;
export const engineBaseSpeed = 0.16;

export let currentChar: Body = null;

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
    const headingTo = getHeadingTo();

    if (headingTo != null && currentChar && !currentChar.isMoving) {
      currentChar.moveByHead(headingTo);
    }

    cameraOffset.x = (-stage.filterArea.width / 2) | 0;
    cameraOffset.y = (-stage.filterArea.height / 2) | 0;

    if (currentChar) {
      setCameraPosition(currentChar);
    } else {
      updateCamera(engineElapsedTime);
    }

    currentMap.update(engineElapsedTime);

    currentMap.origin.set(pixelPosition.x + cameraOffset.x, pixelPosition.y + cameraOffset.y);

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

  loader.load(function (loader: PIXI.loaders.Loader, resources: any) {
    tilesets.forEach($ => {
      const name = `tileset/${$}`;
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

function tileNumber(x: number, y: number) {
  return x * 16 + y;
}


function generateEmptyMap(width: number, height: number) {
  let data: number[] = Array(width * height).map(() => 0);
  const z = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      data[(z * height + y) * width + x] = setTileset(tileNumber(x % 4, y % 4), 0);
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

  let arbol = getGraphicInstance(3);

  currentMap.addChild(arbol);

  arbol.setPosition(10, 10);

  let bandera = getGraphicInstance(3877);

  currentMap.addChild(bandera);

  bandera.setPosition(1, 5);


  currentChar = new Body();

  currentChar.setBody(1);
  currentChar.setHead(1);

  currentChar.setPosition(0, 0);

  console.log(currentChar);





  currentMap.addChild(currentChar);

  const char2 = new Body();

  char2.setBody(2);
  char2.setHead(4);
  char2.setHelmet(6);

  char2.setPosition(0, 0);

  console.log(char2);

  currentMap.addChild(char2);

  setInterval(() => char2.moveByHead(Math.floor(Math.random() * 10) % 4), 500);

  //  arbol.setParent(currentMap);
}