import io from 'socket.io-client';

class Socket {
  public socket: SocketIOClient.Socket;

  constructor(socketUrl: string) {
    this.socket = io(socketUrl);
  }
}

export default new Socket(process.env.REACT_APP_API_URL!).socket;
