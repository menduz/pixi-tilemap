import { Heading } from "../Enums";
import { IGraphic, OffsetCapable, WorldPositionCapable } from "./Graphic";

export class WearableGraphic extends PIXI.Container implements OffsetCapable, WorldPositionCapable {
  private _heading: Heading = Heading.South;
  private _animating: boolean = false;
  private lastSprite: IGraphic = null;
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
    this.lastSprite && this.lastSprite.setPosition(x, y);
  }

  setOffset(x: number, y: number): void {
    this._offsetX = x;
    this._offsetY = y;
    this.lastSprite && this.lastSprite.setOffset(this.offsetX, this.offsetY);
  }

  constructor(public sprites: IGraphic[]) {
    super();
    if (sprites.length != 4)
      throw new Error("Invalid graphic length");

    this.setGraphic();
  }

  private setGraphic() {
    if (this.sprites[this._heading] == this.lastSprite) return;

    if (this.lastSprite) this.removeChild(this.lastSprite);
    this.lastSprite = null;

    if (this.sprites[this._heading]) {
      this.lastSprite = this.sprites[this._heading];
      this.lastSprite.centered = true;
      this.lastSprite.setOffset(this.offsetX, this.offsetY);
      this.lastSprite.animate(this._animating);

      this.addChild(this.lastSprite);
    }
  }

  get heading() {
    return this._heading;
  }

  set heading(value: Heading) {
    this._heading = value % 4;
    this.setGraphic();
  }

  get animating() {
    return this._animating;
  }

  set animating(value: boolean) {
    this._animating = !!value;

    if (this.lastSprite) {
      this.lastSprite.animate(this._animating);
    }
  }
}