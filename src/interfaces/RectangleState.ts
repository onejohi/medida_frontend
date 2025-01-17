import { SavedData } from "./SavedData";
import { Rectangle } from "./Rectangle";

export interface RectangleState {
  savedData: SavedData[];
  currentRectangles: Rectangle[];
}