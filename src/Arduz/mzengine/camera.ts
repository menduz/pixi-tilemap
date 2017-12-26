import { Heading } from '../Enums';
import { EventDispatcher } from '../../Core/EventDispatcher';
import { currentMap } from './GameLoop';

let x = 0, y = 0;

let width = 0, height = 0, ctx = null;

let _moviendo = false, AddX = 0, AddY = 0, _continuar = false;
let UltimoHeading = -1;

export let pos = { x: 0, y: 0 };
export let velCamara = 192 / 1000;

let _check_camera: () => void = null;

export function bindFn(cb: () => void) {
  _check_camera = cb || null;
}

export function setSpeed(freq: number) {
  velCamara = freq || 192 / 1000;
}

export function update(elapsedTime: number) {
  if (_moviendo) {
    if (AddX > 0) {
      AddX -= elapsedTime * velCamara;
      if (AddX <= 0) {
        _moviendo = false;
      }
    }
    if (AddX < 0) {
      AddX += elapsedTime * velCamara;
      if (AddX >= 0) {
        _moviendo = false;
      }
    }
    if (AddY > 0) {
      AddY -= elapsedTime * velCamara;
      if (AddY <= 0) {
        _moviendo = false;
      }
    }
    if (AddY < 0) {
      AddY += elapsedTime * velCamara;
      if (AddY >= 0) {
        _moviendo = false;
      }
    }

    if (!_moviendo) {
      _check_camera && _check_camera();
      if (!_moviendo) {
        AddY = 0;
        AddX = 0;
      }
    }
  } else _check_camera && _check_camera();

  pos.x = (x * 32 - AddX) | 0;
  pos.y = (y * 32 - AddY) | 0;

  // engine.translate(-pos.x - 16 + 400 | 0, -pos.y - 16 + 300);
  currentMap.origin.set(-pos.x - 16 + 400 | 0, -pos.y - 16 + 300);
}

export function unstranslate() {
  // engine.translate(pos.x + 16 - 400 | 0, pos.y + 16 - 300);
  currentMap.origin.set(pos.x + 16 - 400 | 0, pos.y + 16 - 300);
}

export function Mover(heading: Heading) {
  if (!_moviendo) {
    switch (heading) {
      case Heading.South:
        AddY += 32;
        AddX = 0;
        y++;
        break;
      case Heading.East:
        AddX += 32;
        AddY = 0;
        x++;
        break;
      case Heading.North:
        AddY -= 32;
        AddX = 0;
        y--;
        break;
      case Heading.West:
        AddX -= 32;
        AddY = 0;
        x--;
        break;
    }
    observable.trigger('moveByHead', heading, x, y);
    observable.trigger('position', x, y, pos);
  }
  _moviendo = true;
}
export function setPos(_x: number, _y: number) {
  x = _x | 0;
  y = _y | 0;
  AddY = AddX = 0;
  _moviendo = false;
  pos.x = (x * 32 - AddX) | 0;
  pos.y = (y * 32 - AddY) | 0;
}
export function isMoving() { return _moviendo; }
export function getPos() {
  return {
    x: pos.x,
    y: pos.y
  };
}

export let observable = new EventDispatcher();