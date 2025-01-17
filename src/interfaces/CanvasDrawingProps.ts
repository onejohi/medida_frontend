import { Rectangle } from "./Rectangle";

export interface CanvasDrawingProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  selectedData: { rectangles: Rectangle[]; distance: number | null } | null;
}