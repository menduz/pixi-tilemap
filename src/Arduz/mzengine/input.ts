import { EventDispatcher } from "../../Core/EventDispatcher";

export class KeyStateObserver extends EventDispatcher {
  keyStates: Dictionary<boolean> = {};
  keyDown(cual: string) {
    this.keyStates[cual] = true;
    this.emit(cual as any, true);
    this.emit('key_down', cual);
    this.emit('key_down_' + cual);
  }
  keyUp(cual: string) {
    this.keyStates[cual] = false;
    this.emit(cual as any, false);
    this.emit('key_up', cual);
    this.emit('key_up_' + cual);
  }
  check(cual: string) {
    return !!this.keyStates[cual];
  }

  constructor() {
    super();
    window.addEventListener('keydown', (ev) => this.keyDown(ev.keyCode.toString()));
    window.addEventListener('keyup', (ev) => this.keyUp(ev.keyCode.toString()));
  }
}

export const KeyStates = new KeyStateObserver;