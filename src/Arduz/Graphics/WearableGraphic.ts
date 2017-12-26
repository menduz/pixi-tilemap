import { Heading } from "../Enums";
import { IGraphic } from "./Graphic";

export class WearableGraphic extends PIXI.Container {
  private _heading: Heading = Heading.South;
  private _animating: boolean = false;
  private lastSprite: IGraphic = null;

  constructor(public sprites: IGraphic[]) {
    super();
    if (sprites.length != 4)
      throw new Error("Invalid graphic length");

    this.setGraphic();
  }

  private setGraphic() {
    if (this.lastSprite) this.removeChild(this.lastSprite);
    this.lastSprite = null;

    if (this.sprites[this._heading]) {
      this.lastSprite = this.sprites[this._heading];

      if (this._animating)
        this.lastSprite.start();
      else
        this.lastSprite.stop();

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
      if (this._animating)
        this.lastSprite.start();
      else
        this.lastSprite.stop();
    }
  }
}