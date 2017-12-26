import * as engine from './mzengine';
import * as common from '../../../common'

let x = 0, y = 0;

let width = 0, height = 0, ctx = null;

let _moviendo = false, AddX = 0, AddY = 0, _continuar = false;
let UltimoHeading = -1;

let VelCamara = 192 / 1000;

export let boundingBox = {
  minX: 0,
  minY: 0,
  maxX: 0,
  maxY: 0
};

export let pos = { x: 0, y: 0 };

let _check_camera = null;


export let bindFn = function (cb) {
  _check_camera = cb || null;
};

export let setSpeed = function (freq) {
  velCamara = VelCamara = freq || 192 / 1000;
};

export let velCamara = VelCamara;

let map = require('./map');

export let update = function (elapsedTime) {
  if (!map) return;
  if (_moviendo) {
    if (AddX > 0) {
      AddX -= elapsedTime * VelCamara;
      if (AddX <= 0) {
        _moviendo = false;
      }
    }
    if (AddX < 0) {
      AddX += elapsedTime * VelCamara;
      if (AddX >= 0) {
        _moviendo = false;
      }
    }
    if (AddY > 0) {
      AddY -= elapsedTime * VelCamara;
      if (AddY <= 0) {
        _moviendo = false;
      }
    }
    if (AddY < 0) {
      AddY += elapsedTime * VelCamara;
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

  boundingBox.minX = Math.max(Math.round(x - 50 - 2), 0);
  boundingBox.minY = Math.max(Math.round(y - 38 - 2), 0);
  boundingBox.maxX = Math.min(Math.round(x + 50 + 2), map.mapSize);
  boundingBox.maxY = Math.min(Math.round(y + 38 + 2), map.mapSize);

  pos.x = (x * 32 - AddX) | 0;
  pos.y = (y * 32 - AddY) | 0;

  engine.translate(-pos.x - 16 + 400 | 0, -pos.y - 16 + 300);
};
export let unstranslate = function () {
  engine.translate(pos.x + 16 - 400 | 0, pos.y + 16 - 300);
};
export let Mover = function (heading: common.Enums.Heading) {
  if (!_moviendo) {
    switch (heading) {
      case common.Enums.Heading.South:
        AddY += 32;
        AddX = 0;
        y++;
        break;
      case common.Enums.Heading.East:
        AddX += 32;
        AddY = 0;
        x++;
        break;
      case common.Enums.Heading.North:
        AddY -= 32;
        AddX = 0;
        y--;
        break;
      case common.Enums.Heading.West:
        AddX -= 32;
        AddY = 0;
        x--;
        break;
    }
    observable.trigger('moveByHead', heading, x, y);
    observable.trigger('position', x, y, pos);
  }
  _moviendo = true;
};
export let setPos = function (_x, _y) {
  x = _x | 0;
  y = _y | 0;
  AddY = AddX = 0;
  _moviendo = false;
  pos.x = (x * 32 - AddX) | 0;
  pos.y = (y * 32 - AddY) | 0;
};
export let isMoving = function () { return _moviendo; };
export let getPos = function () {
  return {
    x: pos.x,
    y: pos.y
  };
};

export let observable = new mz.EventDispatcher();