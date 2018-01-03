
import { KeyStates } from '../mzengine/Input';
import { Heading } from '../Enums';

export let activeHeading: Heading = null;
let ultimoHeading: Heading = null;

let Teclas = ['40', '39', '38', '37'];


export function initInput() {
  // let HeadingHist = [0, 1, 2, 3];


  KeyStates.on('37', function () {
    if (ultimoHeading != activeHeading) {
      ultimoHeading = activeHeading;
    }
    activeHeading = Heading.West;
  });

  KeyStates.on('38', function () {
    if (ultimoHeading != activeHeading) {
      ultimoHeading = activeHeading;
    }
    activeHeading = Heading.North;
  });

  KeyStates.on('39', function () {
    if (ultimoHeading != activeHeading) {
      ultimoHeading = activeHeading;
    }
    activeHeading = Heading.East;
  });

  KeyStates.on('40', function () {
    if (ultimoHeading != activeHeading) {
      ultimoHeading = activeHeading;
    }
    activeHeading = Heading.South;
  });
}

export function getHeadingTo() {
  if (!KeyStates.check(Teclas[activeHeading])) {
    if (KeyStates.check(Teclas[ultimoHeading])) {
      let t = ultimoHeading;
      if (ultimoHeading != activeHeading) {
        ultimoHeading = activeHeading;
      }
      activeHeading = t;
    } else if (KeyStates.check(Teclas[0])) {
      if (ultimoHeading != activeHeading) {
        ultimoHeading = activeHeading;
      }
      activeHeading = Heading.South;
    } else if (KeyStates.check(Teclas[1])) {
      if (ultimoHeading != activeHeading) {
        ultimoHeading = activeHeading;
      }
      activeHeading = Heading.East;
    } else if (KeyStates.check(Teclas[2])) {
      if (ultimoHeading != activeHeading) {
        ultimoHeading = activeHeading;
      }
      activeHeading = Heading.North;
    } else if (KeyStates.check(Teclas[3])) {
      if (ultimoHeading != activeHeading) {
        ultimoHeading = activeHeading;
      }
      activeHeading = Heading.West;
    } else {
      activeHeading = null;
    }
  }
  return activeHeading;
}