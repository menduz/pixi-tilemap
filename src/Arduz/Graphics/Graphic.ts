import { graphicsDB, getTextureFromIndex } from "./IndexedGraphics";
import { pixelPosition, cameraOffset } from '../Engine/Camera';

export interface IGraphic extends PIXI.Sprite, WorldPositionCapable, OffsetCapable {
  centered: boolean;
  animate(flag: boolean): void;
}

export interface WorldPositionCapable {
  readonly worldX: number;
  readonly worldY: number;
  setPosition(x: number, y: number): void;
}

export interface OffsetCapable {
  readonly offsetX: number;
  readonly offsetY: number;
  setOffset(x: number, y: number): void;
}

export class StaticGraphic extends PIXI.Sprite implements IGraphic {
  centerX = 0;
  centerY = 0;
  worldX = 0;
  worldY = 0;
  private _offsetX = 0;
  private _offsetY = 0;

  get offsetX() {
    return this._offsetX;
  }

  get offsetY() {
    return this._offsetY;
  }

  setPosition(x: number, y: number) {
    this.worldX = x;
    this.worldY = y;
    this.zIndex = -y;
  }

  setOffset(x: number, y: number): void {
    this._offsetX = x;
    this._offsetY = y;
  }

  private _isCentered = false;

  get centered(): boolean {
    return this._isCentered;
  }

  set centered(value: boolean) {
    this._isCentered = value;
  }

  animate(a: boolean) { }

  renderWebGL(renderer: PIXI.WebGLRenderer) {
    this.centerX = -(this.texture.frame.width / 2 - 16) | 0;
    this.centerY = -(this.texture.frame.height - 16) | 0;

    this.x = Math.floor(this.worldX * 32 - pixelPosition.x - cameraOffset.x + this.offsetX);
    this.y = Math.floor(this.worldY * 32 - pixelPosition.y - cameraOffset.y + this.offsetY);

    if (this._isCentered) {
      this.x = Math.floor(this.x + this.centerX);
      this.y = Math.floor(this.y + this.centerY);
    }

    super.displayObjectUpdateTransform();
    super.renderWebGL(renderer);
  }
}

export class AnimatedGraphic extends PIXI.extras.AnimatedSprite implements IGraphic {
  centerX = 0;
  centerY = 0;
  worldX = 0;
  worldY = 0;

  private _offsetX = 0;
  private _offsetY = 0;

  get offsetX() {
    return this._offsetX;
  }

  get offsetY() {
    return this._offsetY;
  }


  setOffset(x: number, y: number): void {
    this._offsetX = x;
    this._offsetY = y;
  }

  setPosition(x: number, y: number) {
    this.worldX = x;
    this.worldY = y;
    this.zIndex = -y;
  }

  private _isCentered = false;

  get centered(): boolean {
    return this._isCentered;
  }

  set centered(value: boolean) {
    this._isCentered = value;
  }


  animate(animate: boolean) {
    if (animate && !this.playing)
      super.play();

    if (!animate && this.playing)
      super.stop();

    if (!animate && !this.playing)
      super.gotoAndStop(0);
  }

  constructor(bases: PIXI.Texture[], speed: number = 0.5) {
    super(bases);

    this.animationSpeed = speed;
  }

  renderWebGL(renderer: PIXI.WebGLRenderer) {
    this.centerX = Math.floor(-(this.texture.frame.width / 2 - 16));
    this.centerY = Math.floor(-(this.texture.frame.height - 16));

    this.x = Math.floor(this.worldX * 32 - pixelPosition.x - cameraOffset.x + this.offsetX);
    this.y = Math.floor(this.worldY * 32 - pixelPosition.y - cameraOffset.y + this.offsetY);

    if (this._isCentered) {
      this.x = Math.floor(this.x + this.centerX);
      this.y = Math.floor(this.y + this.centerY);
    }

    super.displayObjectUpdateTransform();
    super.renderWebGL(renderer);
  }
}

export function getGraphicInstance(index: number): IGraphic {
  if (!(index in graphicsDB)) {
    throw new Error("Graphic not found: " + index);
  }

  const graphic = graphicsDB[index];
  let ret: IGraphic;

  if (graphic.l && graphic.l.length) {
    ret = new AnimatedGraphic(graphic.l.map(getTextureFromIndex), graphic.t / 1600);
  } else {
    ret = new StaticGraphic(getTextureFromIndex(index));
  }

  return ret;
}