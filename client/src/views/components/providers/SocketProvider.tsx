import React, { createContext, FC, useContext, useEffect, useState } from 'react';
import socket from 'services/socket';

export enum ESocketEvent {
  'connect_error' = 'connection_error',
  'reconnect' = 'reconnect',
  'draw' = 'draw',
  'clear' = 'clear',
}

export const SocketContext = createContext<SocketIOClient.Socket>(socket);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: FC = ({ children }) => {
  const [error, setError] = useState(false);

  useEffect(() => {
    socket.on(ESocketEvent.connect_error, () => {
      if (!error) {
        setError(true);
        console.log('Connection Error');
      }
    });

    socket.on(ESocketEvent.reconnect, () => {
      setError(false);
      console.log('Reconnected');
    });

    return () => {
      socket.off(ESocketEvent.connect_error);
      socket.off(ESocketEvent.reconnect);
    };
  }, [error]);

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
};
