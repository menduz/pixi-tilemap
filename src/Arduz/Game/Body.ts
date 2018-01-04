import * as heads from './Head';
import { Heading } from '../Enums';
import { getGraphicInstance, WorldPositionCapable, OffsetCapable } from '../Graphics/Graphic';
import { WearableGraphic } from '../Graphics/WearableGraphic';

declare let $: any;

let cuerpos: any = {};

export class Body extends PIXI.Container implements OffsetCapable, WorldPositionCapable {
  private _heading: Heading = Heading.South;

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
    this.fixPositions();
  }

  setPosition(x: number, y: number) {
    this.worldX = x;
    this.worldY = y;
    this.fixPositions();
  }

  get heading(): Heading {
    return this._heading;
  }

  set heading(value: Heading) {
    this.aura && (this.aura.heading = value);
    this.head && (this.head.heading = value);
    this.helmet && (this.helmet.heading = value);
    this.body && (this.body.heading = value);
    this.rightHand && (this.rightHand.heading = value);
    this.leftHand && (this.leftHand.heading = value);
  }

  rightHand: WearableGraphic;
  leftHand: WearableGraphic;
  head: WearableGraphic;
  helmet: WearableGraphic;
  aura: WearableGraphic;
  body: WearableGraphic;
  name: string;
  nameColor: string;
  headOffsetX = 0;
  headOffsetY = 0;

  speed: number = 1;

  private _isMoving = false;

  get isMoving() {
    return this._isMoving;
  }

  set isMoving(value: boolean) {
    this._isMoving = !!value;
  }

  setHead(headIndex: number) {
    if (this.head) this.removeChild(this.head);
    this.head = null;
    this.head = heads.getHead(headIndex);
    if (this.head) this.addChild(this.head);
    this.fixPositions();
  }

  setHelmet(helmetIndex: number) {
    if (this.helmet) this.removeChild(this.helmet);
    this.helmet = null;
    this.helmet = heads.getHelmet(helmetIndex);
    if (this.helmet) this.addChild(this.helmet);
    this.fixPositions();
  }

  setBody(bodyIndex: number) {
    if (this.body) this.removeChild(this.body);
    this.headOffsetX = 0;
    this.headOffsetY = 0;

    if (bodyIndex in cuerpos) {
      this.headOffsetX = cuerpos[bodyIndex].hX;
      this.headOffsetY = cuerpos[bodyIndex].hY;
      this.body = new WearableGraphic([
        getGraphicInstance(cuerpos[bodyIndex].g[1]),
        getGraphicInstance(cuerpos[bodyIndex].g[2]),
        getGraphicInstance(cuerpos[bodyIndex].g[3]),
        getGraphicInstance(cuerpos[bodyIndex].g[4])
      ]);
      this.addChild(this.body);
      this.fixPositions();
    }
  }

  fixPositions() {
    const oX = (this.offsetX | 0);
    const oY = (this.offsetY | 0);

    if (this.head) {
      this.head.setPosition(this.worldX, this.worldY);
      this.head.setOffset(oX + this.headOffsetX, oY + this.headOffsetY);
    }
    if (this.helmet) {
      this.helmet.setPosition(this.worldX, this.worldY);
      this.helmet.setOffset(oX + this.headOffsetX, oY + this.headOffsetY);
    }
    if (this.body) {
      this.body.setPosition(this.worldX, this.worldY);
      this.body.setOffset(oX, oY);
    }
    if (this.rightHand) {
      this.rightHand.setPosition(this.worldX, this.worldY);
      this.rightHand.setOffset(oX, oY);
    }
    if (this.leftHand) {
      this.leftHand.setPosition(this.worldX, this.worldY);
      this.leftHand.setOffset(oX, oY);
    }
  }

  update(elapsedTime: number) {
    let didSomethingChange = true;
    if (this._offsetX > 0) {
      this._offsetX = (this._offsetX - elapsedTime * this.speed) | 0;
      if (this._offsetX <= 0) {
        this.isMoving = false;
        this._offsetX = 0;
      }
    } else if (this._offsetX < 0) {
      this._offsetX = (this._offsetX + elapsedTime * this.speed) | 0;
      if (this._offsetX >= 0) {
        this.isMoving = false;
        this._offsetX = 0;
      }
    } else if (this._offsetY > 0) {
      this._offsetY = (this._offsetY - elapsedTime * this.speed) | 0;
      if (this._offsetY <= 0) {
        this.isMoving = false;
        this._offsetY = 0;
      }
    } else if (this._offsetY < 0) {
      this._offsetY = (this._offsetY + elapsedTime * this.speed) | 0;
      if (this._offsetY >= 0) {
        this.isMoving = false;
        this._offsetY = 0;
      }
    } else {
      didSomethingChange = false;
    }

    if (didSomethingChange) {
      this.fixPositions();
    }

    this.zIndex = -this.worldY;
  }

  idleCounter = 0;

  renderWebGL(renderer: PIXI.WebGLRenderer) {
    if (this.isMoving) {
      this.idleCounter = 0;
    } else {
      this.idleCounter++;
    }

    const animate = this.idleCounter < 8;

    this.head && (this.head.animating = animate);
    this.helmet && (this.helmet.animating = animate);
    this.body && (this.body.animating = animate);
    this.rightHand && (this.rightHand.animating = animate);
    this.leftHand && (this.leftHand.animating = animate);

    this.fixPositions();

    super.renderWebGL(renderer);
  }

  moveByHead(heading: Heading) {
    switch (heading) {
      case Heading.South:
        this._offsetY = -32;
        this._offsetX = 0;
        this.worldY++;
        break;
      case Heading.East:
        this._offsetX = -32;
        this._offsetY = 0;
        this.worldX++;
        break;
      case Heading.North:
        this._offsetY = 32;
        this._offsetX = 0;
        this.worldY--;
        break;
      case Heading.West:
        this._offsetX = 32;
        this._offsetY = 0;
        this.worldX--;
        break;
    }
    this.heading = heading;
    this.isMoving = true;
  }

  stopWalk() {
    this.isMoving = false;
    this._offsetX = 0;
    this._offsetY = 0;
  }

  setHeading(heading: Heading) {
    this.heading = heading;
  }
}

export function loadBodies(url: string) {
  let bodyHeader = /\[BODY(\d+)\]/;
  let grhHeader = /WALK(1|2|3|4)=(\d+)/;
  let headOffsetHeaderX = /HeadOffsetX=(.+)/;
  let headOffsetHeaderY = /HeadOffsetY=(.+)/;
  this.loaded = false;
  return new Promise((ok, err) => {
    $.ajax({
      url,
      method: 'GET',
      success: function (e: any) {


        let datos = e.split(/(\n)/g);
        let cuerpoActual: any = null;

        for (let i in datos) {
          let t;
          if (t = bodyHeader.exec(datos[i])) {
            cuerpoActual = {
              g: { 1: 0, 2: 0, 3: 0, 4: 0 },
              hX: 0,
              hY: 0,
              i: t[1]
            };
            cuerpos[t[1]] = cuerpoActual;
          } else if (t = grhHeader.exec(datos[i])) {
            cuerpoActual && (cuerpoActual.g[t[1]] = parseInt(t[2]));
          } else if (t = headOffsetHeaderX.exec(datos[i])) {
            cuerpoActual && (cuerpoActual.hX = parseInt(t[1]));
          } else if (t = headOffsetHeaderY.exec(datos[i])) {
            cuerpoActual && (cuerpoActual.hY = parseInt(t[1]));
          }
        }

        // console.log(cuerpos)

        loaded = true;

        ok();
      },
      error: err
    });
  });
}

export let loaded = false;