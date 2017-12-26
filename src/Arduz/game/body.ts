import * as heads from './Head';
import { Heading } from '../Enums';
// import { renderTextCentered } from './Texts';
import { getGraphicInstance } from '../Graphics/Graphic';
import { WearableGraphic } from '../Graphics/WearableGraphic';

declare let $: any;

let cuerpos: any = {};

export class Body extends PIXI.Container {
  private _heading: Heading = Heading.South;

  get heading(): Heading {
    return this._heading;
  }

  set heading(value: Heading) {
    this.aura && (this.aura.heading = value);
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

  private _isMoving = false;

  get isMoving() {
    return this._isMoving;
  }

  set isMoving(value: boolean) {
    this._isMoving = !!value;

    this.head && (this.head.animating = value);
    this.helmet && (this.helmet.animating = value);
    this.body && (this.body.animating = value);
    this.rightHand && (this.rightHand.animating = value);
    this.leftHand && (this.leftHand.animating = value);
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
      this.body.heading = this.heading;
      this.body.animating = this.isMoving;
      this.addChild(this.body);
    }
  }

  fixPositions() {
    if (this.head) {
      this.head.setTransform(this.headOffsetX, this.headOffsetY);
    }
    if (this.helmet) {
      this.head.setTransform(this.headOffsetX, this.headOffsetY);
    }
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
      url: url || 'cdn/indexes/cuerpos.txt',
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