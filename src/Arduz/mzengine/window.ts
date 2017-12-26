import { EventDispatcher } from "../../Core/EventDispatcher";

let ventanas: MzWindow[] = [];


function vPush(v: MzWindow) {
  let ind = -1;
  if ((ind = ventanas.indexOf(v)) != -1) {
    ventanas.push(ventanas.splice(ind, 1)[0]);
  } else {
    ventanas.push(v);
  }
}

function vPop(v: MzWindow) {
  let ind = -1;
  if ((ind = ventanas.indexOf(v)) != -1) {
    ventanas.splice(ind, 1);
  }
}

export abstract class MzWindow extends EventDispatcher {
  width = 0;
  height = 0;
  x = 0;
  y = 0;

  show() {
    vPush(this);
    this.trigger('show');
  }
  hide() {
    vPop(this);
    this.trigger('hide');
  }

  abstract render(x: number, y: number): void;

  setSize(w: number, h: number) {
    this.width = w | 0;
    this.height = h | 0;
    this.trigger('resize');
  }
  setPos(x: number, y: number) {
    this.x = x | 0;
    this.y = y | 0;
  }
  isVisible(): boolean {
    return ventanas.indexOf(this) != -1;
  }
}

export function render(x: number, y: number) {
  ventanas.forEach(function (e) { e.render(x, y); });
}

export function isVisible(window: MzWindow): boolean {
  return window && ventanas.indexOf(window) != -1;
}