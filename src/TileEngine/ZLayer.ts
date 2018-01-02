import { CompositeRectTileLayer } from "./CompositeRectTileLayer";
import { ArduzPlugins } from "./TileRenderer";

export class ZLayer extends PIXI.Container {
  constructor(tilemap: PIXI.Container, zIndex: number) {
    super();
    this.tilemap = tilemap;
    this.z = zIndex;
  }

  tilemap: any;
  z: number;
  zIndex: number;
  _previousLayers: number;
  canvasBuffer: HTMLCanvasElement;
  _tempRender: PIXI.CanvasRenderer;
  _lastAnimationFrame: number = -1;
  layerTransform: PIXI.Matrix;

  clear() {
    let layers = this.children as Array<CompositeRectTileLayer>;
    for (let i = 0; i < layers.length; i++)
      layers[i].clear();
    this._previousLayers = 0;
  }

  cacheIfDirty() {
    let tilemap: any = this.tilemap;
    let layers = this.children as Array<CompositeRectTileLayer>;
    let modified = this._previousLayers != layers.length;
    this._previousLayers = layers.length;
    let buf = this.canvasBuffer;
    let tempRender = this._tempRender;
    if (!buf) {
      buf = this.canvasBuffer = document.createElement('canvas');
      tempRender = this._tempRender = new PIXI.CanvasRenderer(100, 100, { view: buf });
      tempRender.context = tempRender.rootContext;
      (tempRender.plugins as ArduzPlugins).tilemap.dontUseTransform = true;
    }
    if (buf.width != tilemap._layerWidth || buf.height != tilemap._layerHeight) {
      buf.width = tilemap._layerWidth;
      buf.height = tilemap._layerHeight;
      modified = true;
    }
    let i: number;
    if (!modified) {
      for (i = 0; i < layers.length; i++) {
        if (layers[i].isModified(this._lastAnimationFrame != tilemap.animationFrame)) {
          modified = true;
          break;
        }
      }
    }
    this._lastAnimationFrame = tilemap.animationFrame;
    if (modified) {
      if (tilemap._hackRenderer) {
        tilemap._hackRenderer(tempRender);
      }
      tempRender.context.clearRect(0, 0, buf.width, buf.height);
      for (i = 0; i < layers.length; i++) {
        layers[i].clearModify();
        layers[i].renderCanvas(tempRender);
      }
    }
    this.layerTransform = this.worldTransform;
    for (i = 0; i < layers.length; i++) {
      this.layerTransform = layers[i].worldTransform;
      break;
    }
  }

  renderCanvas(renderer: PIXI.CanvasRenderer) {
    this.cacheIfDirty();
    let wt = this.layerTransform;
    renderer.context.setTransform(
      wt.a,
      wt.b,
      wt.c,
      wt.d,
      wt.tx * renderer.resolution,
      wt.ty * renderer.resolution
    );
    // let tilemap = this.tilemap;
    renderer.context.drawImage(this.canvasBuffer, 0, 0);
  }
}