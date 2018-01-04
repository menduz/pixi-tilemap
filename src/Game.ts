import { start } from "./Arduz/Engine/GameLoop";
import { initRenderer } from "./TileEngine/TileRenderer";
import { loadBodies } from "./Arduz/Game/Body";
import { loadHeads, loadHelmets } from "./Arduz/Game/Head";
import { initInput } from "./Arduz/Game/Input";
import { loadGraphics } from "./Arduz/Graphics/IndexedGraphics";



async function startGame() {
  initRenderer();

  const element: HTMLCanvasElement = document.querySelector('#backCanvas');

  await Promise.all([
    loadGraphics('cdn/indexes/graficos.ini'),
    loadBodies('cdn/indexes/cuerpos.ini'),
    loadHeads('cdn/indexes/cabezas.ini'),
    loadHelmets('cdn/indexes/cascos.ini')
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