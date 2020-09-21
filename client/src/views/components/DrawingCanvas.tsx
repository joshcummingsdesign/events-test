import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ESocketEvent, useSocket } from './providers/SocketProvider';

interface IDrawingCanvas {
  width?: number;
  height?: number;
  lineWidth?: number;
  lineCap?: CanvasLineCap;
  strokeStyle?: string;
  altStrokeStyle?: string;
}

export const DrawingCanvas = ({
  width = 900,
  height = 600,
  lineWidth = 5,
  lineCap = 'round',
  strokeStyle = 'dodgerblue',
  altStrokeStyle = 'hotpink',
}: IDrawingCanvas) => {
  const [isDrawing, setIsDrawing] = useState(false);

  const socket = useSocket();

  const _canvas = useRef<HTMLCanvasElement>(null);

  const _draw = useCallback(
    ({ type, x, y, color }: { type: string; x: number; y: number; color?: string }) => {
      if (!_canvas.current) return;

      const ctx = _canvas.current.getContext('2d');

      if (ctx) {
        ctx.lineWidth = lineWidth;
        ctx.lineCap = lineCap;
        ctx.strokeStyle = color || strokeStyle;

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
    [lineWidth, lineCap, strokeStyle, isDrawing]
  );

  const _handleDraw = useCallback(
    ({ type, clientX, clientY }: MouseEvent) => {
      if (!_canvas.current) return;

      const x = clientX - _canvas.current.offsetLeft;
      const y = clientY - _canvas.current.offsetTop;

      socket.emit(ESocketEvent.draw, { type, x, y, color: altStrokeStyle });

      _draw({ type, x, y });
    },
    [altStrokeStyle, _draw, socket]
  );

  const _clear = useCallback(() => {
    if (!_canvas.current) return;

    const ctx = _canvas.current.getContext('2d');

    if (ctx) {
      ctx.clearRect(0, 0, width, height);
    }
  }, [width, height]);

  const _handleClear = () => {
    socket.emit(ESocketEvent.clear);
    _clear();
  };

  useEffect(() => {
    const canvas = _canvas.current;

    if (canvas) {
      canvas.addEventListener('mousedown', _handleDraw);
      canvas.addEventListener('mouseup', _handleDraw);
      canvas.addEventListener('mousemove', _handleDraw);
      canvas.addEventListener('mouseout', _handleDraw);
    }

    socket.on(ESocketEvent.draw, _draw);
    socket.on(ESocketEvent.clear, _clear);

    return () => {
      if (canvas) {
        canvas.removeEventListener('mousedown', _handleDraw);
        canvas.removeEventListener('mouseup', _handleDraw);
        canvas.removeEventListener('mousemove', _handleDraw);
        canvas.removeEventListener('mouseout', _handleDraw);
      }

      socket.off(ESocketEvent.draw, _draw);
      socket.off(ESocketEvent.clear, _clear);
    };
  }, [_draw, _clear, _handleDraw, socket]);

  return (
    <div>
      <canvas ref={_canvas} width={width} height={height} style={{ border: '1px solid black' }} />
      <div>
        <button onClick={_handleClear}>Clear</button>
      </div>
    </div>
  );
};
