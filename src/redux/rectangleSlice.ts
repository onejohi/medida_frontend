import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RectangleState } from '../interfaces/RectangleState';
import { SavedData } from '../interfaces/SavedData';

const initialState: RectangleState = {
  savedData: [],
  currentRectangles: [],
};

const rectangleSlice = createSlice({
  name: 'rectangles',
  initialState,
  reducers: {
    addSavedData: (state, action: PayloadAction<SavedData>) => {
      state.savedData.push(action.payload);
    },
    resetRectangles: (state) => {
      state.savedData = [];
    },
    saveRectangleData: (state, action: PayloadAction<SavedData>) => {
      const savedData: SavedData = {
        id: action.payload.id,
        rectangles: [action.payload.rectangles[1], action.payload.rectangles[2]],
        distance: action.payload.distance,
        createdAt: action.payload.createdAt, // Created at timestamp
      };
      const existingData = localStorage.getItem('canvasData');
      let savedRectangles: SavedData[] = existingData ? JSON.parse(existingData) : [];
    
      savedRectangles.push(savedData);
      state.savedData = savedRectangles;
    
      localStorage.setItem('canvasData', JSON.stringify(savedRectangles));
    },
    
    deleteRectangleData: (_, action: PayloadAction<string>) => {
      const createdAtToDelete = action.payload;
      const measurementsList = JSON.parse(localStorage.getItem('canvasData') || '[]');

      const remaining = measurementsList.filter((item: SavedData) => item.id !== createdAtToDelete);
      localStorage.setItem('canvasData', JSON.stringify(remaining));

    },
  },
});

export const { addSavedData, resetRectangles, saveRectangleData, deleteRectangleData } = rectangleSlice.actions;
export default rectangleSlice.reducer;
