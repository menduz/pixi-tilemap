namespace RPGMap {
  // -----------------------------------------------------------------------------
  let Graphics = { width: 400, height: 400 };
  let PluginManager = {
    parameters: function (a?: any) {
      return {
        "squareShader": 0
      };
    }
  };

  export enum TileFlags {
    TILE_ID_B = 0,
    TILE_ID_C = 256,
    TILE_ID_D = 512,
    TILE_ID_E = 768,
    TILE_ID_A5 = 1536,
    TILE_ID_A1 = 2048,
    TILE_ID_A2 = 2816,
    TILE_ID_A3 = 4352,
    TILE_ID_A4 = 5888,
    TILE_ID_MAX = 8192
  }

  /**
   * Vanilla rpgmaker tilemap from rpg_core.js v1.0.1
   *
   * @class Tilemap
   * @constructor
   */
  export class Tilemap extends PIXI.Container {
    constructor() {
      super();
      this.initialize.apply(this, arguments);
    }

    _needsRepaint = false;

    roundPixels = true;
    lowerZLayer: PIXI.tilemap.ZLayer;
    upperZLayer: PIXI.tilemap.ZLayer;
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

    lowerLayer: PIXI.tilemap.CompositeRectTileLayer;
    upperLayer: PIXI.tilemap.CompositeRectTileLayer;
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
     * @method _isHigherTile
     * @param {Number} tileId
     * @return {Boolean}
     * @private
     */
    _isHigherTile(tileId: number): boolean {
      return !!(this.flags[tileId] & 0x10);
    }

    /**
     * @method _isTableTile
     * @param {Number} tileId
     * @return {Boolean}
     * @private
     */
    _isTableTile(tileId: number): boolean {
      return !!(Tilemap.isTileA2(tileId) && (this.flags[tileId] & 0x80));
    }

    /**
     * @method _isOverpassPosition
     * @param {Number} mx
     * @param {Number} my
     * @return {Boolean}
     * @private
     */
    _isOverpassPosition(mx: number, my: number) {
      return false;
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

    // Tile type checkers


    static isVisibleTile(tileId: number) {
      return tileId > 0 && tileId < TileFlags.TILE_ID_MAX;
    }

    static isAutotile(tileId: number) {
      return tileId >= TileFlags.TILE_ID_A1;
    }

    static getAutotileKind(tileId: number) {
      return Math.floor((tileId - TileFlags.TILE_ID_A1) / 48);
    }

    static getAutotileShape(tileId: number) {
      return (tileId - TileFlags.TILE_ID_A1) % 48;
    }

    static makeAutotileId(kind: number, shape: number) {
      return TileFlags.TILE_ID_A1 + kind * 48 + shape;
    }

    static isSameKindTile(tileID1: number, tileID2: number) {
      if (Tilemap.isAutotile(tileID1) && Tilemap.isAutotile(tileID2)) {
        return Tilemap.getAutotileKind(tileID1) === Tilemap.getAutotileKind(tileID2);
      } else {
        return tileID1 === tileID2;
      }
    }

    static isTileA1(tileId: number) {
      return tileId >= TileFlags.TILE_ID_A1 && tileId < TileFlags.TILE_ID_A2;
    }

    static isTileA2(tileId: number) {
      return tileId >= TileFlags.TILE_ID_A2 && tileId < TileFlags.TILE_ID_A3;
    }

    static isTileA3(tileId: number) {
      return tileId >= TileFlags.TILE_ID_A3 && tileId < TileFlags.TILE_ID_A4;
    }

    static isTileA4(tileId: number) {
      return tileId >= TileFlags.TILE_ID_A4 && tileId < TileFlags.TILE_ID_MAX;
    }

    static isTileA5(tileId: number) {
      return tileId >= TileFlags.TILE_ID_A5 && tileId < TileFlags.TILE_ID_A1;
    }

    static isWaterTile(tileId: number) {
      if (Tilemap.isTileA1(tileId)) {
        return !(tileId >= TileFlags.TILE_ID_A1 + 96 && tileId < TileFlags.TILE_ID_A1 + 192);
      } else {
        return false;
      }
    }

    static isWaterfallTile(tileId: number) {
      if (tileId >= TileFlags.TILE_ID_A1 + 192 && tileId < TileFlags.TILE_ID_A2) {
        return Tilemap.getAutotileKind(tileId) % 2 === 1;
      } else {
        return false;
      }
    }

    static isGroundTile(tileId: number) {
      return Tilemap.isTileA1(tileId) || Tilemap.isTileA2(tileId) || Tilemap.isTileA5(tileId);
    }

    static isShadowingTile(tileId: number) {
      return Tilemap.isTileA3(tileId) || Tilemap.isTileA4(tileId);
    }

    static isRoofTile(tileId: number) {
      return Tilemap.isTileA3(tileId) && Tilemap.getAutotileKind(tileId) % 16 < 8;
    }

    static isWallTopTile(tileId: number) {
      return Tilemap.isTileA4(tileId) && Tilemap.getAutotileKind(tileId) % 16 < 8;
    }

    static isWallSideTile(tileId: number) {
      return (Tilemap.isTileA3(tileId) || Tilemap.isTileA4(tileId)) &&
        Tilemap.getAutotileKind(tileId) % 16 >= 8;
    }

    static isWallTile(tileId: number) {
      return Tilemap.isWallTopTile(tileId) || Tilemap.isWallSideTile(tileId);
    }

    static isFloorTypeAutotile(tileId: number) {
      return (Tilemap.isTileA1(tileId) && !Tilemap.isWaterfallTile(tileId)) ||
        Tilemap.isTileA2(tileId) || Tilemap.isWallTopTile(tileId);
    }

    static isWallTypeAutotile(tileId: number) {
      return Tilemap.isRoofTile(tileId) || Tilemap.isWallSideTile(tileId);
    }

    static isWaterfallTypeAutotile(tileId: number) {
      return Tilemap.isWaterfallTile(tileId);
    }

    // Autotile shape number to coordinates of tileset images

    static FLOOR_AUTOTILE_TABLE = [
      [[2, 4], [1, 4], [2, 3], [1, 3]], [[2, 0], [1, 4], [2, 3], [1, 3]],
      [[2, 4], [3, 0], [2, 3], [1, 3]], [[2, 0], [3, 0], [2, 3], [1, 3]],
      [[2, 4], [1, 4], [2, 3], [3, 1]], [[2, 0], [1, 4], [2, 3], [3, 1]],
      [[2, 4], [3, 0], [2, 3], [3, 1]], [[2, 0], [3, 0], [2, 3], [3, 1]],
      [[2, 4], [1, 4], [2, 1], [1, 3]], [[2, 0], [1, 4], [2, 1], [1, 3]],
      [[2, 4], [3, 0], [2, 1], [1, 3]], [[2, 0], [3, 0], [2, 1], [1, 3]],
      [[2, 4], [1, 4], [2, 1], [3, 1]], [[2, 0], [1, 4], [2, 1], [3, 1]],
      [[2, 4], [3, 0], [2, 1], [3, 1]], [[2, 0], [3, 0], [2, 1], [3, 1]],
      [[0, 4], [1, 4], [0, 3], [1, 3]], [[0, 4], [3, 0], [0, 3], [1, 3]],
      [[0, 4], [1, 4], [0, 3], [3, 1]], [[0, 4], [3, 0], [0, 3], [3, 1]],
      [[2, 2], [1, 2], [2, 3], [1, 3]], [[2, 2], [1, 2], [2, 3], [3, 1]],
      [[2, 2], [1, 2], [2, 1], [1, 3]], [[2, 2], [1, 2], [2, 1], [3, 1]],
      [[2, 4], [3, 4], [2, 3], [3, 3]], [[2, 4], [3, 4], [2, 1], [3, 3]],
      [[2, 0], [3, 4], [2, 3], [3, 3]], [[2, 0], [3, 4], [2, 1], [3, 3]],
      [[2, 4], [1, 4], [2, 5], [1, 5]], [[2, 0], [1, 4], [2, 5], [1, 5]],
      [[2, 4], [3, 0], [2, 5], [1, 5]], [[2, 0], [3, 0], [2, 5], [1, 5]],
      [[0, 4], [3, 4], [0, 3], [3, 3]], [[2, 2], [1, 2], [2, 5], [1, 5]],
      [[0, 2], [1, 2], [0, 3], [1, 3]], [[0, 2], [1, 2], [0, 3], [3, 1]],
      [[2, 2], [3, 2], [2, 3], [3, 3]], [[2, 2], [3, 2], [2, 1], [3, 3]],
      [[2, 4], [3, 4], [2, 5], [3, 5]], [[2, 0], [3, 4], [2, 5], [3, 5]],
      [[0, 4], [1, 4], [0, 5], [1, 5]], [[0, 4], [3, 0], [0, 5], [1, 5]],
      [[0, 2], [3, 2], [0, 3], [3, 3]], [[0, 2], [1, 2], [0, 5], [1, 5]],
      [[0, 4], [3, 4], [0, 5], [3, 5]], [[2, 2], [3, 2], [2, 5], [3, 5]],
      [[0, 2], [3, 2], [0, 5], [3, 5]], [[0, 0], [1, 0], [0, 1], [1, 1]]
    ];

    static WALL_AUTOTILE_TABLE = [
      [[2, 2], [1, 2], [2, 1], [1, 1]], [[0, 2], [1, 2], [0, 1], [1, 1]],
      [[2, 0], [1, 0], [2, 1], [1, 1]], [[0, 0], [1, 0], [0, 1], [1, 1]],
      [[2, 2], [3, 2], [2, 1], [3, 1]], [[0, 2], [3, 2], [0, 1], [3, 1]],
      [[2, 0], [3, 0], [2, 1], [3, 1]], [[0, 0], [3, 0], [0, 1], [3, 1]],
      [[2, 2], [1, 2], [2, 3], [1, 3]], [[0, 2], [1, 2], [0, 3], [1, 3]],
      [[2, 0], [1, 0], [2, 3], [1, 3]], [[0, 0], [1, 0], [0, 3], [1, 3]],
      [[2, 2], [3, 2], [2, 3], [3, 3]], [[0, 2], [3, 2], [0, 3], [3, 3]],
      [[2, 0], [3, 0], [2, 3], [3, 3]], [[0, 0], [3, 0], [0, 3], [3, 3]]
    ];

    static WATERFALL_AUTOTILE_TABLE = [
      [[2, 0], [1, 0], [2, 1], [1, 1]], [[0, 0], [1, 0], [0, 1], [1, 1]],
      [[2, 0], [3, 0], [2, 1], [3, 1]], [[0, 0], [3, 0], [0, 1], [3, 1]]
    ];



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
        this.addChild(this.lowerZLayer = new PIXI.tilemap.ZLayer(this, 0));
        this.addChild(this.upperZLayer = new PIXI.tilemap.ZLayer(this, 4));

        let parameters = PluginManager.parameters('ShaderTilemap');
        let useSquareShader = Number(parameters.hasOwnProperty('squareShader') ? parameters['squareShader'] : 1);

        this.lowerZLayer.addChild(this.lowerLayer = new PIXI.tilemap.CompositeRectTileLayer(0, [], useSquareShader));
        this.lowerLayer.shadowColor = new Float32Array([0.0, 0.0, 0.0, 0.5]);
        this.upperZLayer.addChild(this.upperLayer = new PIXI.tilemap.CompositeRectTileLayer(4, [], useSquareShader));
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

      if (this._isHigherTile(tileId0)) {
        this._drawTile(upperLayer, tileId0, dx, dy);
      } else {
        this._drawTile(lowerLayer, tileId0, dx, dy);
      }
      if (this._isHigherTile(tileId1)) {
        this._drawTile(upperLayer, tileId1, dx, dy);
      } else {
        this._drawTile(lowerLayer, tileId1, dx, dy);
      }

      this._drawShadow(lowerLayer, shadowBits, dx, dy);
      if (this._isTableTile(upperTileId1) && !this._isTableTile(tileId1)) {
        if (!Tilemap.isShadowingTile(tileId0)) {
          this._drawTableEdge(lowerLayer, upperTileId1, dx, dy);
        }
      }

      if (this._isOverpassPosition(mx, my)) {
        this._drawTile(upperLayer, tileId2, dx, dy);
        this._drawTile(upperLayer, tileId3, dx, dy);
      } else {
        if (this._isHigherTile(tileId2)) {
          this._drawTile(upperLayer, tileId2, dx, dy);
        } else {
          this._drawTile(lowerLayer, tileId2, dx, dy);
        }
        if (this._isHigherTile(tileId3)) {
          this._drawTile(upperLayer, tileId3, dx, dy);
        } else {
          this._drawTile(lowerLayer, tileId3, dx, dy);
        }
      }
    }

    /**
     * @method _drawTile
     * @param {Array} layer
     * @param {Number} tileId
     * @param {Number} dx
     * @param {Number} dy
     * @private
     */
    _drawTile(layer: PIXI.tilemap.RectTileLayer, tileId: number, dx: number, dy: number) {
      if (Tilemap.isVisibleTile(tileId)) {
        // if (Tilemap.isAutotile(tileId)) {
        //   this._drawAutotile(layer, tileId, dx, dy);
        // } else {
        this._drawNormalTile(layer, tileId, dx, dy);
        // }
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
    _drawNormalTile(layer: PIXI.tilemap.RectTileLayer, tileId: number, dx: number, dy: number) {
      let setNumber = Math.floor((tileId & 0xFFFF0000) / 0x10000);

      let w = this._tileWidth;
      let h = this._tileHeight;

      let sx = Math.floor(tileId / 16) * w;
      let sy = Math.floor(tileId % 16) * h;

      layer.addRect(setNumber, sx, sy, dx, dy, w, h);
    }

    /**
     * @method _drawAutotile
     * @param {Array} layers
     * @param {Number} tileId
     * @param {Number} dx
     * @param {Number} dy
     * @private
     */
    _drawAutotile(layer: PIXI.tilemap.RectTileLayer, tileId: number, dx: number, dy: number) {
      let autotileTable = Tilemap.FLOOR_AUTOTILE_TABLE;
      let kind = Tilemap.getAutotileKind(tileId);
      let shape = Tilemap.getAutotileShape(tileId);
      let tx = kind % 8;
      let ty = Math.floor(kind / 8);
      let bx = 0;
      let by = 0;
      let setNumber = 0;
      let isTable = false;
      let animX = 0, animY = 0;

      if (Tilemap.isTileA1(tileId)) {
        setNumber = 0;
        if (kind === 0) {
          animX = 2;
          by = 0;
        } else if (kind === 1) {
          animX = 2;
          by = 3;
        } else if (kind === 2) {
          bx = 6;
          by = 0;
        } else if (kind === 3) {
          bx = 6;
          by = 3;
        } else {
          bx = Math.floor(tx / 4) * 8;
          by = ty * 6 + Math.floor(tx / 2) % 2 * 3;
          if (kind % 2 === 0) {
            animX = 2;
          }
          else {
            bx += 6;
            autotileTable = Tilemap.WATERFALL_AUTOTILE_TABLE;
            animY = 1;
          }
        }
      } else if (Tilemap.isTileA2(tileId)) {
        setNumber = 1;
        bx = tx * 2;
        by = (ty - 2) * 3;
        isTable = this._isTableTile(tileId);
      } else if (Tilemap.isTileA3(tileId)) {
        setNumber = 2;
        bx = tx * 2;
        by = (ty - 6) * 2;
        autotileTable = Tilemap.WALL_AUTOTILE_TABLE;
      } else if (Tilemap.isTileA4(tileId)) {
        setNumber = 3;
        bx = tx * 2;
        by = Math.floor((ty - 10) * 2.5 + (ty % 2 === 1 ? 0.5 : 0));
        if (ty % 2 === 1) {
          autotileTable = Tilemap.WALL_AUTOTILE_TABLE;
        }
      }

      let table = autotileTable[shape];
      let w1 = this._tileWidth / 2;
      let h1 = this._tileHeight / 2;
      for (let i = 0; i < 4; i++) {
        let qsx = table[i][0];
        let qsy = table[i][1];
        let sx1 = (bx * 2 + qsx) * w1;
        let sy1 = (by * 2 + qsy) * h1;
        let dx1 = dx + (i % 2) * w1;
        let dy1 = dy + Math.floor(i / 2) * h1;
        if (isTable && (qsy === 1 || qsy === 5)) {
          let qsx2 = qsx;
          let qsy2 = 3;
          if (qsy === 1) {
            // qsx2 = [0, 3, 2, 1][qsx];
            qsx2 = (4 - qsx) % 4;
          }
          let sx2 = (bx * 2 + qsx2) * w1;
          let sy2 = (by * 2 + qsy2) * h1;
          layer.addRect(setNumber, sx2, sy2, dx1, dy1, w1, h1, animX, animY);
          layer.addRect(setNumber, sx1, sy1, dx1, dy1 + h1 / 2, w1, h1 / 2, animX, animY);
        } else {
          layer.addRect(setNumber, sx1, sy1, dx1, dy1, w1, h1, animX, animY);
        }
      }
    }

    /**
     * @method _drawTableEdge
     * @param {Array} layers
     * @param {Number} tileId
     * @param {Number} dx
     * @param {Number} dy
     * @private
     */
    _drawTableEdge(layer: PIXI.tilemap.RectTileLayer, tileId: number, dx: number, dy: number) {
      if (Tilemap.isTileA2(tileId)) {
        let autotileTable = Tilemap.FLOOR_AUTOTILE_TABLE;
        let kind = Tilemap.getAutotileKind(tileId);
        let shape = Tilemap.getAutotileShape(tileId);
        let tx = kind % 8;
        let ty = Math.floor(kind / 8);
        let setNumber = 1;
        let bx = tx * 2;
        let by = (ty - 2) * 3;
        let table = autotileTable[shape];
        let w1 = this._tileWidth / 2;
        let h1 = this._tileHeight / 2;
        for (let i = 0; i < 2; i++) {
          let qsx = table[2 + i][0];
          let qsy = table[2 + i][1];
          let sx1 = (bx * 2 + qsx) * w1;
          let sy1 = (by * 2 + qsy) * h1 + h1 / 2;
          let dx1 = dx + (i % 2) * w1;
          let dy1 = dy + Math.floor(i / 2) * h1;
          layer.addRect(setNumber, sx1, sy1, dx1, dy1, w1, h1 / 2);
        }
      }
    }

    /**
     * @method _drawShadow
     * @param {Number} shadowBits
     * @param {Number} dx
     * @param {Number} dy
     * @private
     */
    _drawShadow(layer: PIXI.tilemap.RectTileLayer, shadowBits: number, dx: number, dy: number) {
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
}