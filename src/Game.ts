import { start } from "./Arduz/mzengine/GameLoop";
import { initRenderer } from "./TileEngine/TileRenderer";
import { loadGraphics } from "./Arduz/game/grh";
import { loadBodies } from "./Arduz/game/body";
import { loadHeads, loadHelmets } from "./Arduz/game/head";
import { initializeCharInput } from "./Arduz/game/Input";

try {
  initRenderer();

  const element: HTMLCanvasElement = document.querySelector('#backCanvas');

  loadGraphics('cdn/indexes/graficos.txt', () => {
    console.log('Graphics loaded.');
  });

  loadBodies('cdn/indexes/cuerpos.txt', () => {
    console.log('Bodies loaded.');
  });

  loadHeads('cdn/indexes/cabezas.txt', () => {
    console.log('Heads loaded.');
  });

  loadHelmets('cdn/indexes/cascos.txt', () => {
    console.log('Helmets loaded.');
  });

  // var myChara = BodyFactory(1, 5, 45);
  // char.chars.push(myChara);

  // setInterval(function () {
  //   myChara.moveByHead(((Math.random() * 700) % 4) | 0)
  // }, 192)

  // var mainChar = char.BodyFactory(1, 4, 45);

  // mainChar.body.name = "menduz"

  // char.chars.push(mainChar);

  // char.mainChar = mainChar;

  initializeCharInput();
  start(element);
} catch (e) {
  console.error('Error during game initialization');
  console.error(e);
  throw e;
}