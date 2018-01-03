import { Heading } from '../Enums';
import { WorldPositionCapable, OffsetCapable } from '../Graphics/Graphic';

export let worldTransform = PIXI.Matrix.IDENTITY;

export const position = {
  x: 0,
  y: 0
};

export const pixelPosition = {
  x: 0,
  y: 0
};

export const cameraOffset = {
  x: 0,
  y: 0
};

export let isMoving = false;

let AddX = 0, AddY = 0;

export let velCamara = 1; // 192 / 1000;

let _check_camera: () => void = null;

export function bindFn(cb: () => void) {
  _check_camera = cb || null;
}

export function setSpeed(freq: number) {
  velCamara = freq || 1;
}

export function setCameraPosition(pos: WorldPositionCapable & OffsetCapable) {
  pixelPosition.x = Math.floor(pos.worldX * 32 + pos.offsetX);
  pixelPosition.y = Math.floor(pos.worldY * 32 + pos.offsetY);
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

  pixelPosition.x = (position.x * 32 - AddX) | 0;
  pixelPosition.y = (position.y * 32 - AddY) | 0;
}

export function moveCamera(heading: Heading) {
  if (!isMoving) {
    switch (heading) {
      case Heading.South:
        AddY += 32;
        AddX = 0;
        position.y++;
        break;
      case Heading.East:
        AddX += 32;
        AddY = 0;
        position.x++;
        break;
      case Heading.North:
        AddY -= 32;
        AddX = 0;
        position.y--;
        break;
      case Heading.West:
        AddX -= 32;
        AddY = 0;
        position.x--;
        break;
    }
  }
  isMoving = true;
}

export function setPos(_x: number, _y: number) {
  position.x = _x | 0;
  position.y = _y | 0;
  AddY = AddX = 0;
  isMoving = false;
  pixelPosition.x = position.x * 32;
  pixelPosition.y = position.y * 32;
}
