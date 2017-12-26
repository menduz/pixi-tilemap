export enum TileFlags {
  MASK_TILE_NUMBER = 0x000000FF,
  MASK_TILESET = 0x000000F00,
  MASK_LAYER = 0x00000F000
}

/**
 * 00000000 00000000 00000000 00000000
 *                   ^^^^               Layer           0x0000F000
 *                       ^^^^           Tileset         0x00000F00
 *                            ^^^^^^^^  Tile number     0x000000FF
 */



export function getTileset(tileId: number): number {
  return ((tileId >> 8) & 0xF - 1);
}

export function setTileset(tileId: number, tileSet: number): number {
  return ((tileSet + 1) & 0xF) << 8 | (tileId & 0xFFFFF0FF);
}

export function getLayer(tileId: number): number {
  return (tileId >> 12) & 0xF;
}

export function setLayer(tileId: number, layer: number): number {
  return (layer & 0xF) << 12 | (tileId & 0xFFFF0FFF);
}

export function getTile(tileId: number): number {
  return tileId & 0xFF;
}

export function setTile(tileId: number, tile: number): number {
  return (tile & 0xFF) | (tileId & 0xFFFFFF00);
}