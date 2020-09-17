import React, { useCallback, useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';

export const App = () => {
  // State
  const [isDrawing, setIsDrawing] = useState(false);

  // Refs
  const _socket = useRef<SocketIOClient.Socket | null>(null);
  const _canvas = useRef<HTMLCanvasElement>(null);

  // Constants
  const WIDTH = 900;
  const HEIGHT = 600;
  const LINE_WIDTH = 5;
  const LINE_CAP = 'round';
  const MY_STROKE_STYLE = 'dodgerblue';
  const USER_STROKE_STYLE = 'hotpink';

  const _draw = useCallback(
    ({ type, x, y, color }: { type: MouseEvent['type']; x: number; y: number; color?: string }) => {
      if (!_canvas.current) return;

      const ctx = _canvas.current.getContext('2d');

      if (ctx) {
        ctx.lineWidth = LINE_WIDTH;
        ctx.lineCap = LINE_CAP;
        ctx.strokeStyle = color || MY_STROKE_STYLE;

        if (type === 'mousedown') {
          setIsDrawing(true);
          ctx.beginPath();
          ctx.moveTo(x, y);
        }

        if (type === 'mousemove') {
          if (isDrawing) {
            ctx.lineTo(x, y);
            ctx.stroke();
          }
        }

        if (type === 'mouseup' || type === 'mouseout') {
          if (isDrawing) {
            ctx.beginPath();
            setIsDrawing(false);
          }
        }
      }
    },
    [isDrawing]
  );

  const _handleDraw = useCallback(
    ({ type, clientX, clientY }: MouseEvent) => {
      if (!_canvas.current) return;

      const x = clientX - _canvas.current.offsetLeft;
      const y = clientY - _canvas.current.offsetTop;

      if (_socket.current) {
        _socket.current.emit('draw', { type, x, y, color: USER_STROKE_STYLE });
      }

      _draw({ type, x, y });
    },
    [_draw, _socket]
  );

  const _clear = () => {
    if (!_canvas.current) return;

    const ctx = _canvas.current.getContext('2d');

    if (ctx) {
      ctx.clearRect(0, 0, WIDTH, HEIGHT);
    }
  };

  const _handleClear = () => {
    if (_socket.current) {
      _socket.current.emit('clear');
    }
    _clear();
  };

  useEffect(() => {
    const canvas = _canvas.current;
    const socket = _socket.current;

    if (canvas) {
      canvas.addEventListener('mousedown', _handleDraw);
      canvas.addEventListener('mouseup', _handleDraw);
      canvas.addEventListener('mousemove', _handleDraw);
      canvas.addEventListener('mouseout', _handleDraw);
    }

    if (socket) {
      socket.on('draw', _draw);
      socket.on('clear', _clear);
    }

    return () => {
      if (canvas) {
        canvas.removeEventListener('mousedown', _handleDraw);
        canvas.removeEventListener('mouseup', _handleDraw);
        canvas.removeEventListener('mousemove', _handleDraw);
        canvas.removeEventListener('mouseout', _handleDraw);
      }

      if (socket) {
        socket.off('draw', _draw);
        socket.off('clear', _clear);
      }
    };
  }, [_draw, _handleDraw]);

  useEffect(() => {
    _socket.current = io(process.env.REACT_APP_API_URL!);
  }, []);

  return (
    <div>
      <canvas ref={_canvas} width={WIDTH} height={HEIGHT} style={{ border: '1px solid black' }} />
      <div>
        <button onClick={_handleClear}>Clear</button>
      </div>
    </div>
  );
};
