/// <reference types="pixi-display" />
import * as Camera from '../mzengine/Camera';
import { Body } from './Body';
import { Heading } from '../Enums';
import { currentMap } from '../mzengine/GameLoop';

export class ClientPlayer {
  speed: number = 1;
  x: number = 0;
  y: number = 0;
  heading: Heading;

  body = new Body();

  private AddX: number = 0;
  private AddY: number = 0;

  // private cleanChat = mz.delayer(() => this.headText = null, 15000);

  key = (Math.random() * 100000).toString(16);

  setPos(x: number, y: number) {
    this.body.isMoving = false;
    this.x = x;
    this.y = y;
    this.AddX = 0;
    this.AddY = 0;
    this.body.setTransform(
      this.x * currentMap.tileWidth - this.AddX,
      this.y * currentMap.tileHeight - this.AddY
    );
  }

  update(elapsedTime: number) {

    if (this.AddX > 0) {
      this.AddX -= elapsedTime * Camera.velCamara * this.speed;
      if (this.AddX <= 0) {
        this.body.isMoving = false;
      }
    } else if (this.AddX < 0) {
      this.AddX += elapsedTime * Camera.velCamara * this.speed;
      if (this.AddX >= 0) {
        this.body.isMoving = false;
      }
    } else if (this.AddY > 0) {
      this.AddY -= elapsedTime * Camera.velCamara * this.speed;
      if (this.AddY <= 0) {
        this.body.isMoving = false;
      }
    } else if (this.AddY < 0) {
      this.AddY += elapsedTime * Camera.velCamara * this.speed;
      if (this.AddY >= 0) {
        this.body.isMoving = false;
      }
    }
  }

  setChat(text: string) {
    this.setText(text);
  }

  protected setText(text: string) {
    // this.headText = text;
    // this.cleanChat.cancel();
    // this.cleanChat();
  }

  // render(renderer: PIXI.WebGLRenderer, elapsedTime: number, x?: number, y?: number) {

  //   if (arguments.length == 2) {
  //     x = this.x * currentMap.tileWidth - this.AddX;
  //     y = this.y * currentMap.tileHeight - this.AddY;
  //   }

  //   if (this.key == state.playerKey) {
  //     x = Camera.pos.x;
  //     y = Camera.pos.y;
  //   }


  //   /*
  // 	var tmpx = x - ((AnchoCuerpos / 2) | 0) + 16;
  // 	var tmpy = y - AltoCuerpos + 16;

  // 	this.body[_heading][
  // 		!enMovimiento ? 0 : ((engine.tick / 60) | 0) % this.body[_heading].length
  // 	](tmpx,tmpy);

  // 	this.head[_heading](x + 8,tmpy - 8);
  // 	*/

  //   this.body && this.body.render(renderer, x, y, this.heading, this.body.isMoving, false);

  //   this.headText && this.headText.length && renderText(this.headText, x + 16, y - 45, true, this.headTextColor);
  // }

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
    this.body.isMoving = true;
  }
  frenar() {
    this.body.isMoving = false;
    this.AddX = 0;
    this.AddY = 0;
  }
  setHeading(heading: Heading) {
    this.heading = heading;
  }
}

export let chars = new PIXI.display.Group(0, (x: any) => x.y);