/// <reference types="pixi.js" />
import { RectTileLayer } from "./RectTileLayer";

export class CompositeRectTileLayer extends PIXI.Container {
  children: RectTileLayer[];

  constructor(zIndex?: number, bitmaps?: Array<PIXI.Texture>, texPerChild?: number) {
    super();
    this.initialize.apply(this, arguments);
  }

  updateTransform() {
    super.displayObjectUpdateTransform();
  }

  z: number;
  zIndex: number;
  shadowColor = new Float32Array([0.0, 0.0, 0.0, 0.5]);
  texPerChild: number;
  modificationMarker = 0;
  _globalMat: PIXI.Matrix = null;
  _tempScale: Array<number> = null;

  initialize(zIndex?: number, bitmaps?: Array<PIXI.Texture>, texPerChild?: number) {
    this.z = this.zIndex = zIndex;
    this.texPerChild = texPerChild || 16;
    if (bitmaps) {
      this.setBitmaps(bitmaps);
    }
  }

  setBitmaps(bitmaps: Array<PIXI.Texture>) {
    let texPerChild = this.texPerChild;
    let len1 = this.children.length;
    let len2 = Math.ceil(bitmaps.length / texPerChild);
    let i: number;
    for (i = 0; i < len1; i++) {
      (this.children[i] as RectTileLayer).textures = bitmaps.slice(i * texPerChild, (i + 1) * texPerChild);
    }
    for (i = len1; i < len2; i++) {
      this.addChild(new RectTileLayer(this.zIndex, bitmaps.slice(i * texPerChild, (i + 1) * texPerChild)));
    }
  }

  clear() {
    for (let i = 0; i < this.children.length; i++)
      (this.children[i] as RectTileLayer).clear();
    this.modificationMarker = 0;
  }

  addRect(num: number, u: number, v: number, x: number, y: number, tileWidth: number, tileHeight: number) {
    if (this.children[num] && (this.children[num] as RectTileLayer).textures)
      (this.children[num] as RectTileLayer).addRect(0, u, v, x, y, tileWidth, tileHeight);
  }

  addFrame(texture_: PIXI.Texture | String | number, x: number, y: number, animX: number, animY: number) {
    let texture: PIXI.Texture;
    let layer: RectTileLayer = null, ind = 0;
    let children = this.children;

    if (typeof texture_ === "number") {
      let childIndex = texture_ / this.texPerChild >> 0;
      layer = children[childIndex] as RectTileLayer;

      if (!layer) {
        layer = children[0] as RectTileLayer;
        if (!layer) {
          return false;
        }
        ind = 0;
      } else {
        ind = texture_ % this.texPerChild;
      }

      texture = layer.textures[ind];
    } else {
      if (typeof texture_ === "string") {
        texture = PIXI.Texture.fromImage(texture_);
      } else {
        texture = texture_ as PIXI.Texture;
      }

      for (let i = 0; i < children.length; i++) {
        let child = children[i] as RectTileLayer;
        let tex = child.textures;
        for (let j = 0; j < tex.length; j++) {
          if (tex[j].baseTexture === texture.baseTexture) {
            layer = child;
            ind = j;
            break;
          }
        }
        if (layer) {
          break;
        }
      }

      if (!layer) {
        for (let i = 0; i < children.length; i++) {
          let child = children[i] as RectTileLayer;
          if (child.textures.length < this.texPerChild) {
            layer = child;
            ind = child.textures.length;
            child.textures.push(texture);
            break;
          }
        }
        if (!layer) {
          children.push(layer = new RectTileLayer(this.zIndex, texture));
          ind = 0;
        }
      }
    }

    layer.addRect(ind, texture.frame.x, texture.frame.y, x, y, texture.frame.width, texture.frame.height, animX, animY);
    return true;
  }

  renderCanvas(renderer: PIXI.CanvasRenderer) {
    if (!renderer.plugins.tilemap.dontUseTransform) {
      let wt = this.worldTransform;
      renderer.context.setTransform(
        wt.a,
        wt.b,
        wt.c,
        wt.d,
        wt.tx * renderer.resolution,
        wt.ty * renderer.resolution
      );
    }
    let layers = this.children;
    for (let i = 0; i < layers.length; i++)
      layers[i].renderCanvas(renderer);
  }

  renderWebGL(renderer: PIXI.WebGLRenderer) {
    // let gl = renderer.gl;
    let shader = renderer.plugins.tilemap.getShader();
    renderer.setObjectRenderer(renderer.plugins.tilemap);
    renderer.bindShader(shader);
    // TODO: dont create new array, please
    this._globalMat = this._globalMat || new PIXI.Matrix();
    renderer._activeRenderTarget.projectionMatrix.copy(this._globalMat).append(this.worldTransform);
    shader.uniforms.projectionMatrix = this._globalMat.toArray(true);
    shader.uniforms.shadowColor = this.shadowColor;
    shader.uniforms.animationFrame = renderer.plugins.tilemap.tileAnim;
    // shader.syncUniform(shader.uniforms.animationFrame);
    let layers = this.children;
    for (let i = 0; i < layers.length; i++)
      (layers[i] as RectTileLayer).renderWebGL(renderer);
  }

  isModified(anim: boolean) {
    let layers = this.children;
    if (this.modificationMarker != layers.length) {
      return true;
    }
    for (let i = 0; i < layers.length; i++) {
      const layer = layers[i] as RectTileLayer;
      if (layer.modificationMarker != layer.pointsBuf.length ||
        anim && layer.hasAnim) {
        return true;
      }
    }
    return false;
  }

  clearModify() {
    let layers = this.children;
    this.modificationMarker = layers.length;
    for (let i = 0; i < layers.length; i++) {
      const layer = layers[i] as RectTileLayer;
      layer.modificationMarker = layer.pointsBuf.length;
    }
  }

}
