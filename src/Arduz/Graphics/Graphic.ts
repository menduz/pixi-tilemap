import { graphicsDB, getTextureFromIndex } from "./IndexedGraphics";
import { pixelPosition, cameraOffset } from '../mzengine/Camera';

export interface IGraphic extends PIXI.Sprite {
  worldX: number;
  worldY: number;
  centerX: number;
  centerY: number;
  vertical: boolean;
  start(): void;
  stop(): void;
}

export class StaticGraphic extends PIXI.Sprite implements IGraphic {
  centerX = 0;
  centerY = 0;

  worldX = 0;
  worldY = 0;

  private _isVertical = false;

  get vertical(): boolean {
    return this._isVertical;
  }

  set vertical(value: boolean) {
    this._isVertical = value;
  }

  start() { }

  stop() { }

  constructor(base: PIXI.Texture) {
    super(base);

    this.centerX = (this.width / 2 - 16) | 0;
    this.centerY = (this.height / 2 - 16) | 0;
  }

  renderWebGL(renderer: PIXI.WebGLRenderer) {
    this.x = Math.floor(this.worldX * 32 - pixelPosition.x - cameraOffset.x);
    this.y = Math.floor(this.worldY * 32 - pixelPosition.y - cameraOffset.y);

    super.displayObjectUpdateTransform();
    super.renderWebGL(renderer);
  }
}

export class AnimatedGraphic extends PIXI.extras.AnimatedSprite implements IGraphic {
  centerX = 0;
  centerY = 0;

  worldX = 0;
  worldY = 0;

  private _isVertical = false;

  get vertical(): boolean {
    return this._isVertical;
  }

  set vertical(value: boolean) {
    this._isVertical = value;
  }

  start() {
    if (!this.playing)
      super.gotoAndPlay(0);
  }
  stop() {
    if (this.playing)
      super.gotoAndStop(0);
  }

  constructor(bases: PIXI.Texture[], speed: number = 0.5) {
    super(bases, true);

    this.gotoAndStop(0);

    this.animationSpeed = speed;

    this.centerX = (this.width / 2 - 16) | 0;
    this.centerY = (this.height / 2 - 16) | 0;
  }


  renderWebGL(renderer: PIXI.WebGLRenderer) {
    this.x = Math.floor(this.worldX * 32 - pixelPosition.x - cameraOffset.x);
    this.y = Math.floor(this.worldY * 32 - pixelPosition.y - cameraOffset.y);

    super.displayObjectUpdateTransform();
    super.renderWebGL(renderer);
  }
}

export function getGraphicInstance(index: number): IGraphic {
  if (!(index in graphicsDB))
    throw "Graphic not found: " + index;

  const graphic = graphicsDB[index];
  let ret: IGraphic;

  if (graphic.l && graphic.l.length) {
    ret = new AnimatedGraphic(graphic.l.map(getTextureFromIndex), graphic.t / 1600);
  } else {
    ret = new StaticGraphic(getTextureFromIndex(index));
    ret.width = graphic.w;
    ret.height = graphic.h;
  }

  return ret;
}