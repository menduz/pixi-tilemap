import * as grh from './grh';
import { Heading } from '../Enums';

declare let $: any;

let DB: { [key: string]: Head } = {};
let DBHelmets: { [key: string]: Head } = {};

let heads: { [key: string]: any } = {};
let helmets: { [key: string]: any } = {};

export class Head {
  grh: { [key: number]: grh.Graphic } = null;

  constructor(head: { g: any }) {
    this.grh = {
      0: grh.get(head.g[1]),
      1: grh.get(head.g[2]),
      2: grh.get(head.g[3]),
      3: grh.get(head.g[4])
    };
  }

  render(x: number, y: number, heading: Heading) {
    this.grh && this.grh[heading] && this.grh[heading].quiet(x - this.grh[heading].centerX, y);
  }

  renderBottomAligned(x: number, y: number, heading: Heading) {
    this.grh && this.grh[heading] && this.grh[heading].quiet(x - this.grh[heading].centerX, y - this.grh[heading].height);
  }
}

export function get(index: number): Head {
  return heads[index] && (DB[index] = DB[index] || new Head(heads[index])) || null;
}

export function getHelmet(index: number): Head {
  return helmets[index] && (DBHelmets[index] = DBHelmets[index] || new Head(helmets[index])) || null;
}

function parseInto(obj: any, e: string) {
  let headHeader = /\[HEAD(\d+)\]/;
  let grhHeader = /Head(1|2|3|4)=(\d+)/;

  let data = e.split(/(\n)/g);
  let actualHead: any = null;

  for (let i in data) {
    let d = data[i].trim();
    let t;
    if (t = headHeader.exec(d)) {
      actualHead = {
        g: { 1: 0, 2: 0, 3: 0, 4: 0 },
        i: t[1]
      };
      obj[t[1]] = actualHead;
    } else if (t = grhHeader.exec(d)) {
      actualHead && (actualHead.g[t[1]] = parseInt(t[2]));
    }
  }
}

export let loadHeads = function (url: string, cb: () => any) {
  $.ajax({
    url: url || 'cdn/indexes/cabezas.txt',
    method: 'GET',
    success: function (e: any) {
      parseInto(heads, e);
      cb && cb();
    }
  });
};

export let loadHelmets = function (url: string, cb: () => any) {
  $.ajax({
    url: url || 'cdn/indexes/cascos.txt',
    method: 'GET',
    success: function (e: any) {
      parseInto(helmets, e);
      cb && cb();
    }
  });
};
