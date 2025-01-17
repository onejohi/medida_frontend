import { Rectangle } from "./Rectangle";

export interface SavedData {
  id: string;
  rectangles: Rectangle[];
  distance: number | null;
  createdAt: string;
}