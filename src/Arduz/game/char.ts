import * as bodies from './body';
import * as Camera from '../mzengine/Camera';

import * as state from '../state';
import { Heading } from '../Enums';
import { currentMap } from '../mzengine/GameLoop';
import { renderText } from './Texts';

export class ClientPlayer {
  x: number = 0;
  y: number = 0;
  heading: Heading;

  body = new bodies.Body();

  moving = false;

  private AddX: number = 0;
  private AddY: number = 0;

  private headText: string;
  private headTextColor = "#aaa";

  // private cleanChat = mz.delayer(() => this.headText = null, 15000);

  key = (Math.random() * 100000).toString(16);

  setPos(x: number, y: number) {
    this.moving = false;
    this.x = x;
    this.y = y;
    this.AddX = 0;
    this.AddY = 0;

  }

  setChat(text: string) {
    this.setText(text);
  }

  protected setText(text: string) {
    this.headText = text;
    // this.cleanChat.cancel();
    // this.cleanChat();
  }

  render(elapsedTime: number, x?: number, y?: number) {

    if (arguments.length == 1) {
      x = this.x * currentMap.tileWidth - this.AddX;
      y = this.y * currentMap.tileHeight - this.AddY;
    }

    if (this.key == state.playerKey) {
      x = Camera.pos.x;
      y = Camera.pos.y;
    }

    if (this.AddX > 0) {
      this.AddX -= elapsedTime * Camera.velCamara;
      if (this.AddX <= 0) {
        this.moving = false;
      }
    }
    if (this.AddX < 0) {
      this.AddX += elapsedTime * Camera.velCamara;
      if (this.AddX >= 0) {
        this.moving = false;
      }
    }
    if (this.AddY > 0) {
      this.AddY -= elapsedTime * Camera.velCamara;
      if (this.AddY <= 0) {
        this.moving = false;
      }
    }
    if (this.AddY < 0) {
      this.AddY += elapsedTime * Camera.velCamara;
      if (this.AddY >= 0) {
        this.moving = false;
      }
    }

    /*
		var tmpx = x - ((AnchoCuerpos / 2) | 0) + 16;
		var tmpy = y - AltoCuerpos + 16;


		this.body[_heading][
			!enMovimiento ? 0 : ((engine.tick / 60) | 0) % this.body[_heading].length
		](tmpx,tmpy);

		this.head[_heading](x + 8,tmpy - 8);
		*/

    this.body && this.body.render(x, y, this.heading, this.moving, false);

    this.headText && this.headText.length && renderText(this.headText, x + 16, y - 45, true, this.headTextColor);
  }

  moveByHead(heading: Heading) {
    switch (heading) {
      case Heading.South:
        this.AddY = currentMap.tileHeight;
        this.AddX = 0;
        this.y++;
        break;
      case Heading.East:
        this.AddX = currentMap.tileWidth;
        this.AddY = 0;
        this.x++;
        break;
      case Heading.North:
        this.AddY = -currentMap.tileHeight;
        this.AddX = 0;
        this.y--;
        break;
      case Heading.West:
        this.AddX = -currentMap.tileWidth;
        this.AddY = 0;
        this.x--;
        break;
    }
    this.heading = heading;
    this.moving = true;
  }
  frenar() {
    this.moving = false;
    this.AddX = 0;
    this.AddY = 0;
  }
  setHeading(heading: Heading) {
    this.heading = heading;
  }
}

export let chars: { [key: string]: ClientPlayer } = {};
