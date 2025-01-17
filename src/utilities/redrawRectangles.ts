import { Rectangle } from "../interfaces/Rectangle";

export default function redrawRectangles(canvasRef: React.RefObject<HTMLCanvasElement>, rects: Rectangle[] = []) {
  console.log({ canvasRef })
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