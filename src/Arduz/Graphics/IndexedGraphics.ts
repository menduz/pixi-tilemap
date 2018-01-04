import { getBaseTexture } from "./TextureManager";

export type GraphicDBEntry = {
  /** index */
  i: number;
  /** Texture number */
  g: number;
  /** src X */
  x: number;
  /** src Y */
  y: number;
  /** width */
  w: number;
  /** height */
  h: number;
  l: null;
  t: null;
};

export type GrapicDBAnimationEntry = {
  /** index */
  i: number;
  /** List of graphics in the animation */
  l: number[]; // Lista de frames
  /** Animation time */
  t: number;
  g: null;
  x: null;
  y: null;
  w: null;
  h: null;
};

export type IndexedGraphic = GraphicDBEntry | GrapicDBAnimationEntry;

export let graphicsDB: Dictionary<IndexedGraphic> = {};

export function getTextureFromIndex(index: number): PIXI.Texture {
  if (index in graphicsDB) {
    let g = graphicsDB[index];

    if (g.g) {
      const tex = getBaseTexture('cdn/grh/png/' + g.g + '.png');

      return new PIXI.Texture(tex, new PIXI.Rectangle(g.x, g.y, g.w, g.h)); // textures.Grh('cdn/grh/png/' + g.g + '.png', g.w, g.h, g.x, g.y);
    } else if (g.l) {
      throw "No se puede usar una animacion como frame de una animacion. frame=" + index;
    }
  } else console.error("Graphic not found:  " + index);
  return null;
}

export function indexarFrame(index: number, grafico: any, srcX: number, srcY: number, w: number, h: number) {
  graphicsDB[index] = {
    g: grafico,
    l: null, // Lista de frames
    t: null, // Tiempo de la animación
    x: parseInt(srcX as any),
    y: parseInt(srcY as any),
    w: parseInt(w as any),
    h: parseInt(h as any),
    i: index
  };
}

export function indexarAnimacion(index: number, frames: number[], animationTime: number) {
  graphicsDB[index] = {
    g: null,
    l: frames, // Lista de frames
    t: parseInt(animationTime as any || 200), // Tiempo de la animación
    x: null,
    y: null,
    w: null,
    h: null,
    i: index
  };
}

declare var $: any;

export function loadGraphics(url: string) {
  let grhHeader = /^Grh(\d+)=1-(\d+)-(\d+)-(\d+)-(\d+)-(\d+)/;
  let animHeader = /^Grh(\d+)=(\d+)-(.*)-(.+)$/;
  loaded = false;

  return new Promise((ok, err) => {
    $.ajax({
      url: url,
      method: 'GET',
      success: function (e: any) {
        let datos = e.split(/(\n)/g);

        for (let i in datos) {
          let t: any = null, d = datos[i].trim();
          if (d && d.length) {
            if (t = grhHeader.exec(d)) {
              indexarFrame(t[1], t[2], t[3], t[4], t[5], t[6]);
            } else {
              if (t = animHeader.exec(d)) {
                indexarAnimacion(t[1], t[3].split(/-/g), parseInt(t[4]));
              }
            }
          }
        }
        loaded = true;
        ok();
      },
      error: (e: any) => err(e)
    });
  });
}
export let loaded: boolean | null = null;
