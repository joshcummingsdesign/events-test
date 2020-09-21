import React from 'react';
import { SocketProvider } from 'views/components/providers/SocketProvider';
import { DrawingCanvas } from 'views/components/DrawingCanvas';

export const App = () => (
  <SocketProvider>
    <DrawingCanvas />
  </SocketProvider>
);
