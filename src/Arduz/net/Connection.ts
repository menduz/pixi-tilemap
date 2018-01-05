
import { EventDispatcher } from '../../Core/EventDispatcher';
import { Body } from '../Game/Body';

function uuid() {
  return Math.random().toString(16) + Math.random().toString(16);
}

export type Peer = any;

declare var SimplePeer: Peer;

declare var EventSource: any;

const SERVER_URL = 'https://arduz-rtc.now.sh';

export interface EventMessage extends Event {
  data: string;
}

export interface UUIDCapable {
  uuid: string;
}

export class WebrtcClient extends EventDispatcher {
  priorPosition: any;
  source: any;
  uuid: string;
  peers: { [key: string]: Peer };
  stream: any;
  constructor(public player: Body) {
    super();

    this.uuid = uuid();
    this.peers = {};
  }

  connect() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      this.connectToEventSource();
      return;
    }

    navigator.mediaDevices.getUserMedia({ audio: true, video: false })
      .then((stream) => {
        this.stream = stream;
        this.connectToEventSource();
      })
      .catch(() => {
        // no stream supported
        this.connectToEventSource();
      });
  }

  connectToEventSource() {
    this.source = new EventSource(`${SERVER_URL}/${this.uuid}/listen`);

    this.source.addEventListener('message', this.onMessage.bind(this), false);

    this.source.addEventListener('open', (e: Event) => {
      this.sendAnnounce();
    }, false);

    this.source.addEventListener('error', (e: any) => {
      if (e.readyState === EventSource.CLOSED) {
        console.log('Connection was closed');
      }
    }, false);

    setInterval(() => {
      this.sendAnnounce();
    }, 5000);
  }

  get connected() {
    return this.source.readyState === EventSource.OPEN;
  }

  get headers() {
    return {
      'Accept': 'application/json, text/plain, */*',
      'Content-Type': 'application/json'
    };
  }

  get position() {
    return this.player.position;
  }

  sendAnnounce() {
    if (this.connected) {
      const p = [this.player.worldX, this.player.worldY];

      if (p.join(',') === this.priorPosition) {
        return;
      }

      fetch(`${SERVER_URL}/announce`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          position: p,
          uuid: this.uuid
        })
      });

      this.priorPosition = p.join(',');
    }
  }

  onMessage(e: EventMessage) {
    let packet;

    try {
      packet = JSON.parse(e.data);
    } catch (e) {
      console.error(`bad packet: ${e.data}`);
    }

    if (packet.type === 'accept') {
      // ignore
    } else if (packet.type === 'ping') {
      // ignore
    } else if (packet.type === 'parcelloaded') {
      // ignore
    } else if (packet.type === 'announce') {
      this.onAnnounce(packet);
    } else if (packet.type === 'signal') {
      this.onSignal(packet);
    } else {
      console.log(e.data);
    }
  }

  onAnnounce(packet: UUIDCapable) {
    const interested = true;

    if (interested) {
      this.connectToPeer(packet.uuid);
    }
  }

  onSignal(packet: UUIDCapable & { initiator: boolean, data: any }) {
    const uuid = packet.uuid;

    if (packet.initiator) {
      if (this.peers[uuid]) {
        // oh sweet race condition, i'll try cancel my initiated
        // connection, but this is probably going to result in
        // undefined behaviour.

        this.peers[uuid].destroy();
        delete this.peers[uuid];
      }

      let p = new SimplePeer({
        initiator: false,
        trickle: false,
        stream: this.stream
      });

      p.on('error', (err: any) => {
        console.log('error', err);
      });

      p.on('signal', (data: any) => {
        fetch(`${SERVER_URL}/${uuid}/signal`, {
          method: 'POST',
          headers: this.headers,
          body: JSON.stringify({
            initiator: false,
            data: data,
            uuid: this.uuid
          })
        });

        // console.log('SIGNAL', JSON.stringify(data))
      });

      p.signal(packet.data);

      this.addPeer(uuid, p);
    } else {
      if (!this.peers[uuid]) {
        console.error('Response signal from peer we didnt try and connect to');
        return;
      }

      this.peers[uuid].signal(packet.data);
    }
  }

  connectToPeer(uuid: string) {
    if (this.peers[uuid]) {
      console.log('Already connected...');
      return;
    }

    let p = new SimplePeer({
      initiator: true,
      trickle: false,
      stream: this.stream
    });

    p.on('error', (err: any) => {
      console.log('error', err);
    });

    p.on('signal', (data: any) => {
      fetch(`${SERVER_URL}/${uuid}/signal`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          initiator: true,
          data: data,
          uuid: this.uuid
        })
      });

      // console.log('SIGNAL', JSON.stringify(data))
    });

    this.addPeer(uuid, p);
  }

  addPeer(uuid: string, peer: Peer) {
    this.peers[uuid] = peer;

    // This user object has properties added to it by
    // other parts of the code, so it needs to be consistent
    // across all emitted events
    const user = { uuid };
    const audio = document.createElement('audio');

    peer.on('connect', () => {
      console.log(`[client] connected to peer ${uuid}`);
      peer.send(JSON.stringify({ type: 'hello' }));
      this.emit('connect', user);
    });

    peer.on('close', () => {
      audio.remove();
      this.emit('disconnect', user);
    });

    peer.on('stream', function (stream: any) {
      // got remote video stream, now let's show it in a video tag
      document.body.appendChild(audio);
      audio.src = window.URL.createObjectURL(stream);
      audio.play();
    });

    peer.on('data', (data: any) => {
      // console.log('data: ' + data)

      let packet;

      try {
        packet = JSON.parse(data);
      } catch (e) {
        console.error(data);
        return;
      }

      this.emit(packet.type, Object.assign(packet, { user, type: undefined }));
    });
  }

  // Broadcast to all
  send(packet: any) {
    Object.keys(this.peers).forEach((uuid) => {
      const peer = this.peers[uuid];

      if (peer.connected) {
        peer.send(JSON.stringify(packet));
      }
    });
  }

  // Pull out the attributes we want to send
  sendChat(message: { content: string }) {
    this.send({
      type: 'chat',
      content: message.content
    });
  }


  sendPosition(update: { p: any; q: any; }) {
    this.send({
      type: 'position',
      p: update.p,
      q: update.q
    });
  }

  sendVisible(visible: boolean) {
    this.send({
      type: 'visible', visible
    });
  }
}