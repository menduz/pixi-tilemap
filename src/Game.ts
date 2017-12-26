

namespace Arduz {
  let _renderer: PIXI.WebGLRenderer;
  let stage: PIXI.Container = null;
  let tilemap: TileEngine.Map = null;

  let scale = +(getOptionValue('scale') || 1);
  let resolution = +(getOptionValue('resolution') || window.devicePixelRatio);
  let ratio = window.devicePixelRatio / resolution;

  function resizeTilemap() {
    if (!tilemap) return;
    tilemap.width = (_renderer.width + 2 * tilemap._margin) * scale;
    tilemap.height = (_renderer.height + 2 * tilemap._margin) * scale;
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

  function isOptionValid(name: string) {
    return location.search.slice(1).split('&').indexOf(name) >= 0;
  }

  function setupView() {
    let backCanvas: HTMLCanvasElement = document.querySelector('#backCanvas');
    _renderer = PIXI.autoDetectRenderer(backCanvas.width, backCanvas.height, { view: backCanvas, resolution: resolution, antialias: true, autoResize: true }) as PIXI.WebGLRenderer;
    resize();
    window.addEventListener('resize', resize);
  }

  let dt = 0, last = 0, animTime = 0;

  function update() {
    let now = Date.now();
    let dt = Math.min(1000, now - last);
    dt /= 1000;
    last = now;

    if (stage) {
      tilemap.update();

      let dt2 = dt * 0.5;
      let w1 = tilemap._tileWidth * tilemap._mapWidth;
      let h1 = tilemap._tileHeight * tilemap._mapHeight;
      let x1 = tilemap.origin.x, y1 = tilemap.origin.y;
      let x2 = 0, y2 = 0;
      for (let i = 0; i < 30; i++) {
        let at2 = animTime + dt2;
        x2 = Math.max(0, w1 - _renderer.width * scale / resolution) * (Math.cos(at2 * 0.5) + 1) / 2;
        y2 = Math.max(0, h1 - _renderer.height * scale / resolution) * (Math.sin(at2 * 0.4) + 1) / 2;
        let d = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
        if (d > 5 * scale / resolution) {
          dt2 = dt2 / (d / 5 / scale / ratio);
        } else break;
      }
      animTime += dt2;
      tilemap.origin.x = x2;
      tilemap.origin.y = y2;
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
        tilemap.bitmaps.push(tex);
        if (tex) tex.baseTexture.mipmap = true;
      });

      while (tilemap.bitmaps.length > 0 && !tilemap.bitmaps[tilemap.bitmaps.length - 1]) {
        tilemap.bitmaps.pop();
      }

      tilemap.setData(width, height, data);
      tilemap.refresh();

      update();
    });

  }

  function tileNumber(x: number, y: number, tileset: number) {
    return TileEngine.setTileset(x * 16 + y, tileset);
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


  export function start() {
    setupView();

    tilemap = new TileEngine.Map();
    stage = new PIXI.Container();
    stage.addChild(tilemap);
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
}