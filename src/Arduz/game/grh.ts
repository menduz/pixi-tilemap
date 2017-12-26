import { tick } from "../mzengine/GameLoop";


let indexaciones: any = {};
let realizados: any = {};

export let loaded: boolean | null = null;

export class Graphic {
  frames: any[] = null;
  framesCount: number = null;
  time: number = null;
  startTime: number = null;

  width = 0;
  height = 0;
  centerX = 0;
  centerY = 0;

  constructor(base: any) {
    this.frames = [];

    if (base.l && base.l.length > 0) {
      for (let i in base.l) {
        this.frames.push(obtenerGrafico(base.l[i]));
      }
    } else if (base.i) {
      this.frames.push(obtenerGrafico(base.i));
    }

    this.width = this.frames[0].width;
    this.height = this.frames[0].height;

    this.centerX = (this.width / 2 - 16) | 0;
    this.centerY = (this.height / 2 - 16) | 0;

    this.framesCount = this.frames.length;

    this.time = base.t;
  }



  quiet(x: number, y: number) {
    // Renders the first frame of the graphic
    this.framesCount && this.frames[0](x, y);
  }

  animated(x: number, y: number) {
    // Renders the graphic animated if it has more tha one frame.
    if (this.framesCount == 1)
      return this.quiet(x, y);

    return this.frames[(((tick % (this.time || 200)) / (this.time || 200)) * this.framesCount | 0)](x, y);
  }

  quietVertical(x: number, y: number) {
    // Renders the first frame of the graphic
    this.framesCount && this.frames[0].vertical(x, y);
  }

  animatedVertical(x: number, y: number) {
    // Renders the graphic animated if it has more tha one frame.
    if (this.framesCount == 1)
      return this.quietVertical(x, y);

    let frame = Math.round(((tick % (this.time || 200)) / (this.time || 200)) * this.framesCount) % this.framesCount;

    return this.frames[frame] && this.frames[frame].vertical(x, y);
  }

  quietCentered(x: number, y: number) {
    // Renders the first frame of the graphic
    this.framesCount && this.frames[0].centrado(x, y);
  }

  animatedCentered(x: number, y: number) {
    // Renders the graphic animated if it has more tha one frame.
    if (this.framesCount == 1)
      return this.quietCentered(x, y);

    let frame = Math.round(((tick % (this.time || 200)) / (this.time || 200)) * this.framesCount) % this.framesCount;

    return this.frames[frame] && this.frames[frame].centrado(x, y);
  }
}

function obtenerGrafico(index: number): null {
  if (index in indexaciones) {
    let g = indexaciones[index];

    if (g.g) {
      return null; // textures.Grh('cdn/grh/png/' + g.g + '.png', g.w, g.h, g.x, g.y);
    } else if (g.l) {
      throw "No se puede usar una animacion como frame de una animacion. frame=" + index;
    }
  } else console.error("Grafico no indexado: " + index);
  return null;
}

export function get(index: number): Graphic {
  if (!(index in indexaciones))
    throw "Grafico " + index + " no indexado";
  return realizados[index] || (realizados[index] = new Graphic(indexaciones[index]));
}

export function indexarFrame(index: number, grafico: any, srcX: number, srcY: number, w: number, h: number) {
  indexaciones[index] = {
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

export function indexarAnimacion(index: number, frames: number[], tiempo: number) {
  indexaciones[index] = {
    g: null,
    l: frames, // Lista de frames
    t: parseInt(tiempo as any || 200), // Tiempo de la animación
    x: null,
    y: null,
    w: null,
    h: null,
    i: index
  };
}

declare var $: any;

export let cargarGraficosRaw = function (url: string, cb: () => any) {
  let grhHeader = /^Grh(\d+)=1-(\d+)-(\d+)-(\d+)-(\d+)-(\d+)/;
  let animHeader = /^Grh(\d+)=(\d+)-(.*)-(.+)$/;
  loaded = false;
  $.ajax({
    url: url || 'cdn/indexes/graficos.txt',
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
      cb && cb();
    }
  });
};