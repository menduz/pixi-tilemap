import { Heading } from '../Enums';
import { EventDispatcher } from '../../Core/EventDispatcher';

let x = 0, y = 0;

export let isMoving = false;

let AddX = 0, AddY = 0;

export let pos = { x: 0, y: 0 };
export let velCamara = 1; // 192 / 1000;

let _check_camera: () => void = null;

export function bindFn(cb: () => void) {
  _check_camera = cb || null;
}

export function setSpeed(freq: number) {
  velCamara = freq || 192 / 1000;
}

export function update(elapsedTime: number) {
  if (isMoving) {
    if (AddX > 0) {
      AddX -= elapsedTime * velCamara;
      if (AddX <= 0) {
        isMoving = false;
      }
    }
    if (AddX < 0) {
      AddX += elapsedTime * velCamara;
      if (AddX >= 0) {
        isMoving = false;
      }
    }
    if (AddY > 0) {
      AddY -= elapsedTime * velCamara;
      if (AddY <= 0) {
        isMoving = false;
      }
    }
    if (AddY < 0) {
      AddY += elapsedTime * velCamara;
      if (AddY >= 0) {
        isMoving = false;
      }
    }

    if (!isMoving) {
      if (_check_camera) {
        _check_camera();
      }
      if (!isMoving) {
        AddY = 0;
        AddX = 0;
      }
    }
  } else if (_check_camera) {
    _check_camera();
  }

  pos.x = (x * 32 - AddX) | 0;
  pos.y = (y * 32 - AddY) | 0;
}

export function moveCamera(heading: Heading) {
  if (!isMoving) {
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
  isMoving = true;
}

export function setPos(_x: number, _y: number) {
  x = _x | 0;
  y = _y | 0;
  AddY = AddX = 0;
  isMoving = false;
  pos.x = x * 32;
  pos.y = y * 32;
}

export function getPos() {
  return {
    x,
    y
  };
}

export let observable = new EventDispatcher();