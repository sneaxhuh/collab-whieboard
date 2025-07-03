import React, { useRef, useEffect, useState, useCallback } from 'react';
import { DrawingData, Point, DrawingTool, User, CursorData } from '../types/whiteboard';
import { v4 as uuidv4 } from 'uuid';

interface CanvasProps {
  tool: DrawingTool;
  color: string;
  strokeWidth: number;
  drawings: DrawingData[];
  users: User[];
  currentUser: User;
  onDrawing: (drawing: DrawingData) => void;
  onCursor: (cursor: CursorData) => void;
  fillMode?: boolean;
  fontSize?: number;
}

export const Canvas = React.forwardRef<HTMLCanvasElement, CanvasProps>((
  {
    tool,
    color,
    strokeWidth,
    drawings,
    users,
    currentUser,
    onDrawing,
    onCursor,
    fillMode = false,
    fontSize = 16,
  },
  ref
) => {
  
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<Point[]>([]);
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [textInput, setTextInput] = useState<{ point: Point; value: string } | null>(null);

  const drawOnCanvas = useCallback((ctx: CanvasRenderingContext2D, drawingData: DrawingData) => {
    ctx.save();
    ctx.strokeStyle = drawingData.color;
    ctx.lineWidth = drawingData.strokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    switch (drawingData.type) {
      case 'pen':
        if (drawingData.points.length > 1) {
          ctx.beginPath();
          ctx.moveTo(drawingData.points[0].x, drawingData.points[0].y);
          for (let i = 1; i < drawingData.points.length; i++) {
            ctx.lineTo(drawingData.points[i].x, drawingData.points[i].y);
          }
          ctx.stroke();
        }
        break;

      case 'rectangle':
        if (drawingData.points.length === 2) {
          const [start, end] = drawingData.points;
          const width = end.x - start.x;
          const height = end.y - start.y;
          
          ctx.beginPath();
          ctx.rect(start.x, start.y, width, height);
          
          if (drawingData.fill) {
            ctx.fillStyle = drawingData.color;
            ctx.fill();
          } else {
            ctx.stroke();
          }
        }
        break;

      case 'circle':
        if (drawingData.points.length === 2) {
          const [start, end] = drawingData.points;
          const radius = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
          
          ctx.beginPath();
          ctx.arc(start.x, start.y, radius, 0, 2 * Math.PI);
          
          if (drawingData.fill) {
            ctx.fillStyle = drawingData.color;
            ctx.fill();
          } else {
            ctx.stroke();
          }
        }
        break;

      case 'text':
        if (drawingData.text && drawingData.points.length > 0) {
          ctx.font = `${drawingData.fontSize || fontSize}px Arial`;
          ctx.fillStyle = drawingData.color;
          ctx.fillText(drawingData.text, drawingData.points[0].x, drawingData.points[0].y);
        }
        break;

      case 'eraser':
        if (drawingData.points.length > 1) {
          ctx.globalCompositeOperation = 'destination-out';
          ctx.beginPath();
          ctx.moveTo(drawingData.points[0].x, drawingData.points[0].y);
          for (let i = 1; i < drawingData.points.length; i++) {
            ctx.lineTo(drawingData.points[i].x, drawingData.points[i].y);
          }
          ctx.stroke();
        }
        break;
    }

    ctx.restore();
  }, [fontSize]);

  const redrawCanvas = useCallback(() => {
    const canvas = ref.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw all completed drawings
    drawings.forEach(drawing => {
      drawOnCanvas(ctx, drawing);
    });

    // Draw current path for pen tool
    if (tool === 'pen' && currentPath.length > 1) {
      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = strokeWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(currentPath[0].x, currentPath[0].y);
      for (let i = 1; i < currentPath.length; i++) {
        ctx.lineTo(currentPath[i].x, currentPath[i].y);
      }
      ctx.stroke();
      ctx.restore();
    }

    // Draw preview for shapes
    if ((tool === 'rectangle' || tool === 'circle') && startPoint && currentPath.length > 0) {
      const endPoint = currentPath[currentPath.length - 1];
      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = strokeWidth;
      ctx.setLineDash([5, 5]);

      if (tool === 'rectangle') {
        const width = endPoint.x - startPoint.x;
        const height = endPoint.y - startPoint.y;
        ctx.rect(startPoint.x, startPoint.y, width, height);
        ctx.stroke();
      } else if (tool === 'circle') {
        const radius = Math.sqrt(Math.pow(endPoint.x - startPoint.x, 2) + Math.pow(endPoint.y - startPoint.y, 2));
        ctx.beginPath();
        ctx.arc(startPoint.x, startPoint.y, radius, 0, 2 * Math.PI);
        ctx.stroke();
      }

      ctx.restore();
    }

    // Draw other users' cursors
    users.forEach(user => {
      if (user.id !== currentUser.id && user.cursor) {
        ctx.save();
        ctx.fillStyle = user.color;
        ctx.beginPath();
        ctx.arc(user.cursor.x, user.cursor.y, user.isDrawing ? 8 : 4, 0, 2 * Math.PI);
        ctx.fill();
        
        // Draw user name
        ctx.fillStyle = '#000';
        ctx.font = '12px Arial';
        ctx.fillText(user.name, user.cursor.x + 10, user.cursor.y - 10);
        ctx.restore();
      }
    });
  }, [drawings, currentPath, startPoint, tool, color, strokeWidth, users, currentUser, drawOnCanvas]);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    redrawCanvas();
  }, [redrawCanvas]);

  const getPointFromEvent = (e: React.MouseEvent<HTMLCanvasElement>): Point => {
    const canvas = ref.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const point = getPointFromEvent(e);
    setIsDrawing(true);
    
    if (tool === 'text') {
      setTextInput({ point, value: '' });
      return;
    }

    if (tool === 'pen' || tool === 'eraser') {
      setCurrentPath([point]);
    } else if (tool === 'rectangle' || tool === 'circle') {
      setStartPoint(point);
      setCurrentPath([point]);
    }

    onCursor({ userId: currentUser.id, x: point.x, y: point.y, isDrawing: true });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const point = getPointFromEvent(e);
    
    if (isDrawing && (tool === 'pen' || tool === 'eraser')) {
      setCurrentPath(prev => [...prev, point]);
    } else if (isDrawing && (tool === 'rectangle' || tool === 'circle')) {
      setCurrentPath([point]);
    }

    onCursor({ userId: currentUser.id, x: point.x, y: point.y, isDrawing });
  };

  const handleMouseUp = () => {
    if (!isDrawing) return;

    setIsDrawing(false);

    if (tool === 'pen' || tool === 'eraser') {
      if (currentPath.length > 1) {
        const drawingData: DrawingData = {
          id: uuidv4(),
          type: tool,
          points: currentPath,
          color,
          strokeWidth,
          timestamp: Date.now(),
          userId: currentUser.id,
        };
        onDrawing(drawingData);
      }
    } else if ((tool === 'rectangle' || tool === 'circle') && startPoint && currentPath.length > 0) {
      const endPoint = currentPath[currentPath.length - 1];
      const drawingData: DrawingData = {
        id: uuidv4(),
        type: tool,
        points: [startPoint, endPoint],
        color,
        strokeWidth,
        fill: fillMode,
        timestamp: Date.now(),
        userId: currentUser.id,
      };
      onDrawing(drawingData);
    }

    setCurrentPath([]);
    setStartPoint(null);
    onCursor({ userId: currentUser.id, x: 0, y: 0, isDrawing: false });
  };

  const handleTextSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && textInput) {
      const drawingData: DrawingData = {
        id: uuidv4(),
        type: 'text',
        points: [textInput.point],
        color,
        strokeWidth,
        text: textInput.value,
        fontSize,
        timestamp: Date.now(),
        userId: currentUser.id,
      };
      onDrawing(drawingData);
      setTextInput(null);
    }
  };

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={ref}
        className="w-full h-full cursor-crosshair"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => setIsDrawing(false)}
      />
      
      {textInput && (
        <input
          type="text"
          value={textInput.value}
          onChange={(e) => setTextInput({ ...textInput, value: e.target.value })}
          onKeyDown={handleTextSubmit}
          onBlur={() => setTextInput(null)}
          className="absolute border-2 border-blue-500 bg-white px-2 py-1 outline-none"
          style={{
            left: textInput.point.x,
            top: textInput.point.y,
            fontSize: `${fontSize}px`,
            color: color,
          }}
          autoFocus
        />
      )}
    </div>
  );
});