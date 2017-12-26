
let DEFAULT_POWER_OF_TWO = 5;

function makeKeysFn(shift: number) {
  return function (obj: Rect) {
    let sx = obj.worldX >> shift,
      sy = obj.worldY >> shift,
      ex = (obj.worldX + (obj.width || 1)) >> shift,
      ey = (obj.worldY + (obj.height || 1)) >> shift,
      x, y, keys = [];
    for (y = sy; y <= ey; y++) {
      for (x = sx; x <= ex; x++) {
        keys.push("" + x + ":" + y);
      }
    }
    return keys;
  };
}

export type Rect = {
  worldX: number;
  worldY: number;
  width?: number;
  height?: number;
};

/**
* @param {number} power_of_two - how many times the rects should be shifted
*                                when hashing
*/
export class SpatialHash<T extends Rect = Rect> {

  getKeys: (obj: Rect) => string[];
  hash: Dictionary<T[]> = {};
  list: T[] = [];
  _lastTotalCleared = 0;

  constructor(powerOfTwo: number = DEFAULT_POWER_OF_TWO) {
    this.getKeys = makeKeysFn(powerOfTwo);
    this.hash = {};
    this.list = [];
    this._lastTotalCleared = 0;
  }

  clear() {
    let key;
    for (key in this.hash) {
      if (this.hash[key].length === 0) {
        delete this.hash[key];
      } else {
        this.hash[key].length = 0;
      }
    }
    this.list.length = 0;
  }

  getNumBuckets() {
    let key, count = 0;
    for (key in this.hash) {
      if (this.hash.hasOwnProperty(key)) {
        if (this.hash[key].length > 0) {
          count++;
        }
      }
    }
    return count;
  }

  insert(obj: T, rect?: Rect) {
    let keys = this.getKeys(rect || obj), key, i;
    this.list.push(obj);
    for (i = 0; i < keys.length; i++) {
      key = keys[i];
      if (this.hash[key]) {
        this.hash[key].push(obj);
      } else {
        this.hash[key] = [obj];
      }
    }
  }

  remove(obj: T) {
    const theList = this.list.splice(0);
    this.clear();
    theList.forEach($ => {
      if ($ != obj) {
        this.insert($);
      }
    });
  }

  retrieve(obj: T, rect?: Rect): T[] {
    let ret: T[] = [], keys, i, key;
    if (!obj && !rect) {
      return this.list;
    }
    keys = this.getKeys(rect || obj);
    for (i = 0; i < keys.length; i++) {
      key = keys[i];
      if (this.hash[key]) {
        ret = ret.concat(this.hash[key]);
      }
    }
    return ret;
  }
}