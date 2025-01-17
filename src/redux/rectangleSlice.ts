import { createSlice, PayloadAction } from '@reduxjs/toolkit';

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

interface RectangleState {
  savedData: SavedData[];
  currentRectangles: Rectangle[];
}

const initialState: RectangleState = {
  savedData: [],
  currentRectangles: [],
};

const calculateDistance = (rect1: Rectangle, rect2: Rectangle) => {
  const center1 = {
    x: rect1.x + rect1.width / 2,
    y: rect1.y + rect1.height / 2,
  };
  const center2 = {
    x: rect2.x + rect2.width / 2,
    y: rect2.y + rect2.height / 2,
  };
  return Math.sqrt(
    Math.pow(center2.x - center1.x, 2) + Math.pow(center2.y - center1.y, 2)
  );
};

// const saveToLocalStorage = (savedData: SavedData) => {
//   // Retrieve the existing array from localStorage, or create an empty array if it doesn't exist
//   const existingData = localStorage.getItem('canvasData');
//   console.log({ existingData })
//   let savedRectangles: SavedData[] = existingData ? JSON.parse(existingData) : [];

//   // Append the new savedData to the array
//   savedRectangles.push(savedData);

//   // Store the updated array back to localStorage
//   localStorage.setItem('canvasData', JSON.stringify(savedRectangles));
// };

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
    
      // Append the new savedData to the array
      savedRectangles.push(savedData);
    
      // Store the updated array back to localStorage
      localStorage.setItem('canvasData', JSON.stringify(savedRectangles));
    },
    
    deleteRectangleData: (state, action: PayloadAction<string>) => {
      const createdAtToDelete = action.payload;
      const indexToDelete = state.savedData.findIndex((data) => data.createdAt === createdAtToDelete);

      if (indexToDelete !== -1) {
        state.savedData.splice(indexToDelete, 1);
        localStorage.setItem('savedRectangles', JSON.stringify(state.savedData));
      }
    },
  },
});

export const { addSavedData, resetRectangles, saveRectangleData, deleteRectangleData } = rectangleSlice.actions;
export default rectangleSlice.reducer;
