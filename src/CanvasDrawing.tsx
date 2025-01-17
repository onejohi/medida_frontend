import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from './redux/store';
import { Rectangle } from './interfaces/Rectangle';
import calculateDistance from './utilities/calculateDistance';
import { CanvasDrawingProps } from './interfaces/CanvasDrawingProps';
import redrawRectangles from './utilities/redrawRectangles';
import isOverlapping from './utilities/isOverlapping';
import { addSavedData, resetRectangles, saveRectangleData } from './redux/rectangleSlice';

const CanvasDrawing: React.FC<CanvasDrawingProps> = ({ canvasRef, selectedData }) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [isDrawingEnabled, setIsDrawingEnabled] = useState(true);
  const [undoStack, setUndoStack] = useState<Rectangle[]>([]);

  const dispatch = useDispatch<AppDispatch>();
  const rectangles = useSelector((state: RootState) => state.rectangles.savedData.map(data => data.rectangles).flat());

  useEffect(() => {
    if (selectedData && canvasRef.current) {
      redrawRectangles(canvasRef, selectedData.rectangles);
    }
  }, [selectedData, canvasRef]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingEnabled) return;

    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      setIsDrawing(true);
      setStartPoint({ x, y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !startPoint) return;

    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (canvas && context) {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      redrawRectangles(canvasRef);

      const width = x - startPoint.x;
      const height = y - startPoint.y;
      context.strokeStyle = 'blue';
      context.strokeRect(startPoint.x, startPoint.y, width, height);
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !startPoint) return;
  
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
  
      // Create the new rectangle object
      const newRectangle: Rectangle = {
        x: Math.min(startPoint.x, x),
        y: Math.min(startPoint.y, y),
        width: Math.abs(x - startPoint.x),
        height: Math.abs(y - startPoint.y),
      };
  
      // Check for overlap
      const overlaps = rectangles.some((rect) => isOverlapping(rect, newRectangle ));
      if (overlaps) {
        alert('Rectangles cannot overlap.');
        redrawRectangles(canvasRef);
        setIsDrawing(false);
        setStartPoint(null);
        return;
      }
  
      // Add to undo stack
      setUndoStack([...undoStack, newRectangle]);
  
      // Add the new rectangle to the list of existing rectangles
      const updatedRectangles = [...rectangles, newRectangle];
  
      // If there are 2 rectangles, calculate the distance and save them together
      if (updatedRectangles.length === 2) {
        const calculatedDistance = calculateDistance(updatedRectangles);
        dispatch(addSavedData({
          id: Date.now().toLocaleString(),
          rectangles: updatedRectangles,
          distance: calculatedDistance,
          createdAt: new Date().toISOString(),
        }));
  
        // Store the distance for the canvas redraw and state
        setDistance(calculatedDistance);
  
        // Disable drawing once we've saved both rectangles
        setIsDrawingEnabled(false);
        setIsDrawing(false);
        setStartPoint(null);
  
        // Redraw all rectangles after update
        redrawRectangles(canvasRef, updatedRectangles);
      } else {
        // If there's only one rectangle, just update the state without calculating distance
        dispatch(addSavedData({
          id: Date.now().toLocaleString(),
          rectangles: updatedRectangles,
          distance: null,
          createdAt: new Date().toISOString(),
        }));
  
        // Redraw the current list of rectangles
        redrawRectangles(canvasRef, updatedRectangles);
  
        setIsDrawing(false);
        setStartPoint(null);
      }
    }
  };

  const handleRefresh = () => {
    dispatch(resetRectangles());
    setIsDrawingEnabled(true);
    setDistance(null);
    setUndoStack([]);
    redrawRectangles(canvasRef, []);
  };

  const handleSave = () => {
    if (rectangles.length > 1) {
      dispatch(saveRectangleData({
        id: Date.now().toLocaleString(),
        rectangles,
        distance,
        createdAt: new Date().toISOString(),
      }));
      handleRefresh();
    }
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const lastRectangle = undoStack.pop();
    setUndoStack([...undoStack]);

    const updatedRectangles = rectangles.filter((rect) => rect !== lastRectangle);
    dispatch(resetRectangles());
    setIsDrawingEnabled(updatedRectangles.length <= 2);
    redrawRectangles(canvasRef, updatedRectangles);
};


  return (
    <div className="flex flex-col items-center justify-center">
      <canvas
        ref={canvasRef}
        width={700}
        height={350}
        className="border"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      ></canvas>
      <div className="flex mt-4 space-x-4">
        <button onClick={handleUndo} className="bg-red-500 text-white px-4 py-2 rounded">
          Undo
        </button>
        <button onClick={handleSave} className="bg-blue-500 text-white px-4 py-2 rounded">
          Save
        </button>
        <button onClick={handleRefresh} className="bg-gray-500 text-white px-4 py-2 rounded">
          Refresh
        </button>
      </div>
    </div>
  );
};

export default CanvasDrawing;
