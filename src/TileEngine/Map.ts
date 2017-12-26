import { ZLayer } from "./ZLayer";
import { CompositeRectTileLayer } from "./CompositeRectTileLayer";
import { RectTileLayer } from "./RectTileLayer";
import { getTile, getTileset } from "./Tile";


// -----------------------------------------------------------------------------
let Graphics = { width: 400, height: 400 };
let PluginManager = {
  parameters: function (a?: any) {
    return {
      "squareShader": 0
    };
  }
};



/**
 * Vanilla rpgmaker tilemap from rpg_core.js v1.0.1
 *
 * @class Tilemap
 * @constructor
 */
export class Map extends PIXI.Container {
  constructor() {
    super();
    this.initialize.apply(this, arguments);
  }

  _needsRepaint = false;

  roundPixels = true;
  lowerZLayer: ZLayer;
  upperZLayer: ZLayer;
  _margin = 20;
  _width = Graphics.width + this._margin * 2;
  _height = Graphics.height + this._margin * 2;
  _tileWidth = 32;
  _tileHeight = 32;
  _mapWidth = 0;
  _mapHeight = 0;
  _mapData: number[] = null;
  _layerWidth = 0;
  _layerHeight = 0;
  _lastTiles: any[] = [];
  animationFrame: number;
  _lastStartX: number;
  _lastStartY: number;

  lowerLayer: CompositeRectTileLayer;
  upperLayer: CompositeRectTileLayer;
  _lastBitmapLength: number;

  /**
   * The bitmaps used as a tileset.
   *
   * @property bitmaps
   * @type Array
   */
  bitmaps: any[] = [];

  /**
   * The origin point of the tilemap for scrolling.
   *
   * @property origin
   * @type Point
   */
  origin = new PIXI.Point();

  /**
   * The tileset flags.
   *
   * @property flags
   * @type Array
   */
  flags: number[] = [];

  /**
   * The animation count for autotiles.
   *
   * @property animationCount
   * @type Number
   */
  animationCount = 0;

  /**
   * Whether the tilemap loops horizontal.
   *
   * @property horizontalWrap
   * @type Boolean
   */
  horizontalWrap = false;

  /**
   * Whether the tilemap loops vertical.
   *
   * @property verticalWrap
   * @type Boolean
   */
  verticalWrap = false;

  initialize() {
    this._createLayers();
    this.refresh();
  }

  /**
   * The width of the screen in pixels.
   *
   * @property width
   * @type Number
   */
  get width() {
    return this._width;
  }
  set width(value) {
    if (this._width !== value) {
      this._width = value;
      this._createLayers();
    }
  }

  /**
   * The height of the screen in pixels.
   *
   * @property height
   * @type Number
   */

  get height() {
    return this._height;
  }
  set height(value) {
    if (this._height !== value) {
      this._height = value;
      this._createLayers();
    }
  }


  /**
   * The width of a tile in pixels.
   *
   * @property tileWidth
   * @type Number
   */

  get tileWidth() {
    return this._tileWidth;
  }
  set tileWidth(value) {
    if (this._tileWidth !== value) {
      this._tileWidth = value;
      this._createLayers();
    }
  }

  /**
   * The height of a tile in pixels.
   *
   * @property tileHeight
   * @type Number
   */

  get tileHeight() {
    return this._tileHeight;
  }
  set tileHeight(value) {
    if (this._tileHeight !== value) {
      this._tileHeight = value;
      this._createLayers();
    }
  }

  /**
   * Sets the tilemap data.
   *
   * @method setData
   * @param {Number} width The width of the map in number of tiles
   * @param {Number} height The height of the map in number of tiles
   * @param {Array} data The one dimensional array for the map data
   */
  setData(width: number, height: number, data: number[]) {
    this._mapWidth = width;
    this._mapHeight = height;
    this._mapData = data;
  }

  /**
   * Checks whether the tileset is ready to render.
   *
   * @method isReady
   * @type Boolean
   * @return {Boolean} True if the tilemap is ready
   */
  isReady() {
    for (let i = 0; i < this.bitmaps.length; i++) {
      if (this.bitmaps[i] && !this.bitmaps[i].isReady()) {
        return false;
      }
    }
    return true;
  }

  /**
   * Updates the tilemap for each frame.
   *
   * @method update
   */
  update() {
    this.animationCount++;
    this.animationFrame = Math.floor(this.animationCount / 30);
    this.children.forEach(function (child: any) {
      if (child.update) {
        child.update();
      }
    });
  }

  /**
   * @method _readLastTiles
   * @param {Number} i
   * @param {Number} x
   * @param {Number} y
   * @private
   */
  _readLastTiles(i: number, x: number, y: number) {
    let array1 = this._lastTiles[i];
    if (array1) {
      let array2 = array1[y];
      if (array2) {
        let tiles = array2[x];
        if (tiles) {
          return tiles;
        }
      }
    }
    return [];
  }

  /**
   * @method _writeLastTiles
   * @param {Number} i
   * @param {Number} x
   * @param {Number} y
   * @param {Array} tiles
   * @private
   */
  _writeLastTiles(i: number, x: number, y: number, tiles: any[]) {
    let array1 = this._lastTiles[i];
    if (!array1) {
      array1 = this._lastTiles[i] = [];
    }
    let array2 = array1[y];
    if (!array2) {
      array2 = array1[y] = [];
    }
    let array3 = array2[x];
    if (!array3) {
      array3 = array2[x] = [];
    }
    while (array3.length > 0) array3.pop();
    for (let i = 0, n = tiles.length; i < n; i++)
      array3.push(tiles[i]);
  }

  /**
   * @method _readMapData
   * @param {Number} x
   * @param {Number} y
   * @param {Number} z
   * @return {Number}
   * @private
   */
  _readMapData(x: number, y: number, z: number): number {
    if (this._mapData) {
      let width = this._mapWidth;
      let height = this._mapHeight;
      if (this.horizontalWrap) {
        x = x % width;
      }
      if (this.verticalWrap) {
        y = y % height;
      }
      if (x >= 0 && x < width && y >= 0 && y < height) {
        return this._mapData[(z * height + y) * width + x] || 0;
      } else {
        return 0;
      }
    } else {
      return 0;
    }
  }


  /**
   * @method _sortChildren
   * @private
   */
  _sortChildren() {
    this.children.sort(this._compareChildOrder.bind(this));
  }

  /**
   * @method _compareChildOrder
   * @param {Object} a
   * @param {Object} b
   * @private
   */
  _compareChildOrder(a: any, b: any) {
    if (a.z !== b.z) {
      return a.z - b.z;
    } else if (a.y !== b.y) {
      return a.y - b.y;
    } else {
      return a.spriteId - b.spriteId;
    }
  }

  /**
   * Uploads animation state in renderer
   *
   * @method _hackRenderer
   * @private
   */
  _hackRenderer(renderer: PIXI.WebGLRenderer) {
    let af = this.animationFrame % 4;
    if (af == 3) af = 1;
    renderer.plugins.tilemap.tileAnim[0] = af * this._tileWidth;
    renderer.plugins.tilemap.tileAnim[1] = (this.animationFrame % 3) * this._tileHeight;
    return renderer;
  }

  /**
   * PIXI render method
   *
   * @method renderCanvas
   * @param {Object} pixi renderer
   */
  renderCanvas(renderer: PIXI.CanvasRenderer) {
    this._hackRenderer(renderer as any);
    super.renderCanvas(renderer);
  }


  /**
   * PIXI render method
   *
   * @method renderWebGL
   * @param {Object} pixi renderer
   */
  renderWebGL(renderer: PIXI.WebGLRenderer) {
    this._hackRenderer(renderer);
    super.renderWebGL(renderer);
  }

  /**
   * Forces to repaint the entire tilemap AND update bitmaps list if needed
   *
   * @method refresh
   */
  refresh() {
    if (this._lastBitmapLength != this.bitmaps.length) {
      this._lastBitmapLength = this.bitmaps.length;
      this._updateBitmaps();
    }
    this._needsRepaint = true;
  }

  /**
   * Updates bitmaps list
   *
   * @method refresh
   * @private
   */
  _updateBitmaps() {
    let bitmaps = this.bitmaps.map(function (x) { return x._baseTexture ? new PIXI.Texture(x._baseTexture) : x; });
    this.lowerLayer.setBitmaps(bitmaps);
    this.upperLayer.setBitmaps(bitmaps);
  }

  /**
   * @method updateTransform
   * @private
   */
  updateTransform() {
    let ox: number, oy: number;

    if (this.roundPixels) {
      ox = Math.floor(this.origin.x);
      oy = Math.floor(this.origin.y);
    } else {
      ox = this.origin.x;
      oy = this.origin.y;
    }
    let startX = Math.floor((ox - this._margin) / this._tileWidth);
    let startY = Math.floor((oy - this._margin) / this._tileHeight);
    this._updateLayerPositions(startX, startY);
    if (this._needsRepaint || this._lastStartX !== startX || this._lastStartY !== startY) {
      this._lastStartX = startX;
      this._lastStartY = startY;
      this._paintAllTiles(startX, startY);
      this._needsRepaint = false;
    }
    this._sortChildren();
    super.updateTransform();
  }

  /**
   * @method _createLayers
   * @private
   */
  _createLayers() {
    let width = this._width;
    let height = this._height;
    let margin = this._margin;
    let tileCols = Math.ceil(width / this._tileWidth) + 1;
    let tileRows = Math.ceil(height / this._tileHeight) + 1;
    let layerWidth = this._layerWidth = tileCols * this._tileWidth;
    let layerHeight = this._layerHeight = tileRows * this._tileHeight;
    this._needsRepaint = true;

    if (!this.lowerZLayer) {
      // @hackerham: create layers only in initialization. Doesn't depend on width/height
      this.addChild(this.lowerZLayer = new ZLayer(this, 0));
      this.addChild(this.upperZLayer = new ZLayer(this, 4));

      let parameters = PluginManager.parameters('ShaderTilemap');
      let useSquareShader = Number(parameters.hasOwnProperty('squareShader') ? parameters['squareShader'] : 1);

      this.lowerZLayer.addChild(this.lowerLayer = new CompositeRectTileLayer(0, [], useSquareShader));
      this.lowerLayer.shadowColor = new Float32Array([0.0, 0.0, 0.0, 0.5]);
      this.upperZLayer.addChild(this.upperLayer = new CompositeRectTileLayer(4, [], useSquareShader));
    }
  }

  /**
   * @method _updateLayerPositions
   * @param {Number} startX
   * @param {Number} startY
   * @private
   */
  _updateLayerPositions(startX: number, startY: number) {
    let ox: number, oy: number;
    if (this.roundPixels) {
      ox = Math.floor(this.origin.x);
      oy = Math.floor(this.origin.y);
    } else {
      ox = this.origin.x;
      oy = this.origin.y;
    }
    this.lowerZLayer.position.x = startX * this._tileWidth - ox;
    this.lowerZLayer.position.y = startY * this._tileHeight - oy;
    this.upperZLayer.position.x = startX * this._tileWidth - ox;
    this.upperZLayer.position.y = startY * this._tileHeight - oy;
  }

  /**
   * @method _paintAllTiles
   * @param {Number} startX
   * @param {Number} startY
   * @private
   */
  _paintAllTiles(startX: number, startY: number) {
    this.lowerZLayer.clear();
    this.upperZLayer.clear();
    let tileCols = Math.ceil(this._width / this._tileWidth) + 1;
    let tileRows = Math.ceil(this._height / this._tileHeight) + 1;
    for (let y = 0; y < tileRows; y++) {
      for (let x = 0; x < tileCols; x++) {
        this._paintTiles(startX, startY, x, y);
      }
    }
  }

  /**
   * @method _paintTiles
   * @param {Number} startX
   * @param {Number} startY
   * @param {Number} x
   * @param {Number} y
   * @private
   */
  _paintTiles(startX: number, startY: number, x: number, y: number) {
    let mx = startX + x;
    let my = startY + y;
    let dx = x * this._tileWidth, dy = y * this._tileHeight;
    let tileId0 = this._readMapData(mx, my, 0);
    let tileId1 = this._readMapData(mx, my, 1);
    let tileId2 = this._readMapData(mx, my, 2);
    let tileId3 = this._readMapData(mx, my, 3);
    let shadowBits = this._readMapData(mx, my, 4);
    let upperTileId1 = this._readMapData(mx, my - 1, 1);
    let lowerLayer = this.lowerLayer.children[0];
    let upperLayer = this.upperLayer.children[0];

    // if (this._isHigherTile(tileId0)) {
    this._drawTile(upperLayer, tileId0, dx, dy);
    // } else {
    //   this._drawTile(lowerLayer, tileId0, dx, dy);
    // }
    // if (this._isHigherTile(tileId1)) {
    //   this._drawTile(upperLayer, tileId1, dx, dy);
    // } else {
    //   this._drawTile(lowerLayer, tileId1, dx, dy);
    // }

    // this._drawShadow(lowerLayer, shadowBits, dx, dy);
    // // if (this._isTableTile(upperTileId1) && !this._isTableTile(tileId1)) {
    // //   if (!Tilemap.isShadowingTile(tileId0)) {
    // //     this._drawTableEdge(lowerLayer, upperTileId1, dx, dy);
    // //   }
    // // }

    // if (this._isOverpassPosition(mx, my)) {
    //   this._drawTile(upperLayer, tileId2, dx, dy);
    //   this._drawTile(upperLayer, tileId3, dx, dy);
    // } else {
    //   if (this._isHigherTile(tileId2)) {
    //     this._drawTile(upperLayer, tileId2, dx, dy);
    //   } else {
    //     this._drawTile(lowerLayer, tileId2, dx, dy);
    //   }
    //   if (this._isHigherTile(tileId3)) {
    //     this._drawTile(upperLayer, tileId3, dx, dy);
    //   } else {
    //     this._drawTile(lowerLayer, tileId3, dx, dy);
    //   }
    // }
  }

  /**
   * @method _drawTile
   * @param {Array} layer
   * @param {Number} tileId
   * @param {Number} dx
   * @param {Number} dy
   * @private
   */
  _drawTile(layer: RectTileLayer, tileId: number, dx: number, dy: number) {
    if (tileId != 0) {
      this._drawNormalTile(layer, tileId, dx, dy);
    }
  }

  /**
   * @method _drawNormalTile
   * @param {Array} layers
   * @param {Number} tileId
   * @param {Number} dx
   * @param {Number} dy
   * @private
   */
  _drawNormalTile(layer: RectTileLayer, tileId: number, dx: number, dy: number) {
    const setNumber = getTileset(tileId);
    const tile = getTile(tileId);

    let w = this._tileWidth;
    let h = this._tileHeight;

    let sx = Math.floor(tile / 16) * w;
    let sy = Math.floor(tile % 16) * h;

    layer.addRect(setNumber, sx, sy, dx, dy, w, h);
  }

  /**
   * @method _drawShadow
   * @param {Number} shadowBits
   * @param {Number} dx
   * @param {Number} dy
   * @private
   */
  _drawShadow(layer: RectTileLayer, shadowBits: number, dx: number, dy: number) {
    if (shadowBits & 0x0f) {
      let w1 = this._tileWidth / 2;
      let h1 = this._tileHeight / 2;
      for (let i = 0; i < 4; i++) {
        if (shadowBits & (1 << i)) {
          let dx1 = dx + (i % 2) * w1;
          let dy1 = dy + Math.floor(i / 2) * h1;
          layer.addRect(-1, 0, 0, dx1, dy1, w1, h1);
        }
      }
    }
  }
}