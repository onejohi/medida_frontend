import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from './redux/store';
import { addSavedData, resetRectangles, saveRectangleData } from './redux/rectangleSlice';

interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface SavedData {
  id: string;
  rectangles: Rectangle[];
  distance: number | null;
  createdAt: string;
}

interface CanvasDrawingProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  selectedData: { rectangles: Rectangle[]; distance: number | null } | null;
}

const CanvasDrawing: React.FC<CanvasDrawingProps> = ({ canvasRef, selectedData }) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [isDrawingEnabled, setIsDrawingEnabled] = useState(true);
  const [undoStack, setUndoStack] = useState<Rectangle[]>([]);

  const dispatch = useDispatch<AppDispatch>();
  const rectangles = useSelector((state: RootState) => state.rectangles.savedData.map(data => data.rectangles).flat());

  // useEffect(() => {
  //   // Load rectangles and distance from localStorage on mount
  //   const savedData = localStorage.getItem('canvasData');
  //   console.log({ savedData })
  //   if (savedData) {
  //     const { rectangles, distance } = JSON.parse(savedData);
  //     rectangles.forEach((rect: Rectangle) => dispatch(addSavedData({ id:  Date.now().toLocaleString(), rectangles: [rect], distance: null, createdAt: Date.now().toLocaleString() })));

  //     setDistance(distance);
  //   }
  // }, [dispatch]);

  useEffect(() => {
    if (selectedData && canvasRef.current) {
      redrawRectangles(selectedData.rectangles);
    }
  }, [selectedData, canvasRef]);

  const redrawRectangles = (rects: Rectangle[] = rectangles) => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (canvas && context) {
      context.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas before redrawing
  
      // Iterate through each rectangle in the list and draw them on the canvas
      rects.forEach(({ x, y, width, height }) => {
        context.strokeStyle = 'black'; // Set the stroke color for rectangles
        context.strokeRect(x, y, width, height); // Draw the rectangle on the canvas
      });
    }
  };  

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

      redrawRectangles();

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
      const newRectangle = {
        x: Math.min(startPoint.x, x),
        y: Math.min(startPoint.y, y),
        width: Math.abs(x - startPoint.x),
        height: Math.abs(y - startPoint.y),
      };
  
      // Check for overlap
      const overlaps = rectangles.some((rect) => isOverlapping(rect, newRectangle));
      if (overlaps) {
        alert('Rectangles cannot overlap.');
        redrawRectangles();
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
  
        // Save to localStorage (optional step)
        saveToLocalStorage(updatedRectangles, calculatedDistance);
  
        // Disable drawing once we've saved both rectangles
        setIsDrawingEnabled(false);
        setIsDrawing(false);
        setStartPoint(null);
  
        // Redraw all rectangles after update
        redrawRectangles(updatedRectangles);
      } else {
        // If there's only one rectangle, just update the state without calculating distance
        dispatch(addSavedData({
          id: Date.now().toLocaleString(),
          rectangles: updatedRectangles,
          distance: null,
          createdAt: new Date().toISOString(),
        }));
  
        // Redraw the current list of rectangles
        redrawRectangles(updatedRectangles);
  
        setIsDrawing(false);
        setStartPoint(null);
      }
    }
  };
  
  const saveToLocalStorage = (rects: Rectangle[], dist: number | null) => {
    console.log({ rects, dist });
  };

  const isOverlapping = (rect1: Rectangle, rect2: Rectangle): boolean => {
    return !(
      rect1.x + rect1.width <= rect2.x ||
      rect2.x + rect2.width <= rect1.x ||
      rect1.y + rect1.height <= rect2.y ||
      rect2.y + rect2.height <= rect1.y
    );
  };

  const calculateDistance = (rects: Rectangle[]): number | null => {
    if (rects.length < 2) return null;

    const [rect1, rect2] = rects;
    const x1 = rect1.x + rect1.width / 2;
    const y1 = rect1.y + rect1.height / 2;
    const x2 = rect2.x + rect2.width / 2;
    const y2 = rect2.y + rect2.height / 2;

    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  };

  const handleRefresh = () => {
    dispatch(resetRectangles());
    setIsDrawingEnabled(true);
    setDistance(null);
    setUndoStack([]);
    redrawRectangles([]);
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

    // Reset rectangles before updating
    dispatch(resetRectangles());

    // For each rectangle data, create a new SavedData object and dispatch the save action
    const newSavedData: SavedData = {
        id:  Date.now().toLocaleString(),
        rectangles: updatedRectangles,
        distance: updatedRectangles.length < 2 ? null : calculateDistance(updatedRectangles),
        createdAt: new Date().toISOString(), // Use the current timestamp
    };

    // dispatch(saveRectangleData(newSavedData));

    setIsDrawingEnabled(updatedRectangles.length < 2);

    // Redraw the rectangles after updating
    redrawRectangles(updatedRectangles);

    // Update localStorage manually (though dispatch should already take care of it)
    saveToLocalStorage(updatedRectangles, newSavedData.distance);
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
