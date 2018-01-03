import { start } from "./Arduz/mzengine/GameLoop";
import { initRenderer } from "./TileEngine/TileRenderer";
import { loadBodies } from "./Arduz/game/Body";
import { loadHeads, loadHelmets } from "./Arduz/game/Head";
import { initInput } from "./Arduz/game/Input";
import { loadGraphics } from "./Arduz/Graphics/IndexedGraphics";



async function startGame() {
  initRenderer();

  const element: HTMLCanvasElement = document.querySelector('#backCanvas');

  await Promise.all([
    loadGraphics('cdn/indexes/graficos.txt'),
    loadBodies('cdn/indexes/cuerpos.txt'),
    loadHeads('cdn/indexes/cabezas.txt'),
    loadHelmets('cdn/indexes/cascos.txt')
  ]);

  initInput();
  start(element);
}

startGame().then(
  () => {
    console.log('Game started');
  },
  (e) => {
    console.error('Error during game initialization');
    console.error(e);
    throw e;
  }
);