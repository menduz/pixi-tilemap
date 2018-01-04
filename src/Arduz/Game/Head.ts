import { WearableGraphic } from '../Graphics/WearableGraphic';
import { getGraphicInstance } from '../Graphics/Graphic';

declare let $: any;

export type HeadDBEntry = {
  i: number;
  g: Dictionary<number>;
};

let heads: Dictionary<HeadDBEntry> = {};
let helmets: Dictionary<HeadDBEntry> = {};

export function getHead(index: number): WearableGraphic {
  return heads[index] && fromDB(heads[index]) || null;
}

export function getHelmet(index: number): WearableGraphic {
  return helmets[index] && fromDB(helmets[index]) || null;
}

function fromDB(item: HeadDBEntry) {
  return new WearableGraphic([
    getGraphicInstance(item.g[1]),
    getGraphicInstance(item.g[2]),
    getGraphicInstance(item.g[3]),
    getGraphicInstance(item.g[4])
  ]);
}

function parseInto(obj: any, e: string) {
  let headHeader = /\[HEAD(\d+)\]/;
  let grhHeader = /Head(1|2|3|4)=(\d+)/;

  let data = e.split(/(\n)/g);
  let actualHead: HeadDBEntry = null;

  for (let i in data) {
    let d = data[i].trim();
    let t;
    if (t = headHeader.exec(d)) {
      actualHead = {
        g: { 1: 0, 2: 0, 3: 0, 4: 0 },
        i: parseInt(t[1])
      };
      obj[t[1]] = actualHead;
    } else if (t = grhHeader.exec(d)) {
      actualHead && (actualHead.g[t[1]] = parseInt(t[2]));
    }
  }
}

export function loadHeads(url: string) {
  return new Promise((ok, err) => {
    $.ajax({
      url,
      method: 'GET',
      success: function (e: any) {
        parseInto(heads, e);
        ok();
      },
      error: err
    });
  });
}

export function loadHelmets(url: string) {
  return new Promise((ok, err) => {
    $.ajax({
      url,
      method: 'GET',
      success: function (e: any) {
        parseInto(helmets, e);
        ok();
      },
      error: err
    });
  });
}
