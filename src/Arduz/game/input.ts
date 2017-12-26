
import { KeyStates } from '../mzengine/Input';
import * as Camera from '../mzengine/Camera';
import { Heading } from '../Enums';

export function initializeCharInput() {
  let heading: Heading = null;

  // let HeadingHist = [0, 1, 2, 3];

  let Teclas = ['40', '39', '38', '37'];

  let ultimoHeading: Heading = null;

  KeyStates.on('37', function () {
    if (ultimoHeading != heading) {
      ultimoHeading = heading;
    }
    heading = Heading.West;
  });

  KeyStates.on('38', function () {
    if (ultimoHeading != heading) {
      ultimoHeading = heading;
    }
    heading = Heading.North;
  });

  KeyStates.on('39', function () {
    if (ultimoHeading != heading) {
      ultimoHeading = heading;
    }
    heading = Heading.East;
  });

  KeyStates.on('40', function () {
    if (ultimoHeading != heading) {
      ultimoHeading = heading;
    }
    heading = Heading.South;
  });

  // KeyStates.on('key_down_13', () => chatPromptInstance.show());

  Camera.bindFn(function () {
    if (!Camera.isMoving) {
      if (!KeyStates.check(Teclas[heading])) {
        if (KeyStates.check(Teclas[ultimoHeading])) {
          let t = ultimoHeading;
          if (ultimoHeading != heading) {
            ultimoHeading = heading;
          }
          heading = t;
        } else if (KeyStates.check(Teclas[0])) {
          if (ultimoHeading != heading) {
            ultimoHeading = heading;
          }
          heading = Heading.South;
        } else if (KeyStates.check(Teclas[1])) {
          if (ultimoHeading != heading) {
            ultimoHeading = heading;
          }
          heading = Heading.East;
        } else if (KeyStates.check(Teclas[2])) {
          if (ultimoHeading != heading) {
            ultimoHeading = heading;
          }
          heading = Heading.North;
        } else if (KeyStates.check(Teclas[3])) {
          if (ultimoHeading != heading) {
            ultimoHeading = heading;
          }
          heading = Heading.West;
        } else {
          heading = null;
        }
      }

      if (heading != null) {
        Camera.moveCamera(heading);
      }
    }
  });
}