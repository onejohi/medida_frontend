import { useRef, useState } from 'react';
import CanvasDrawing from "./CanvasDrawing"
import MeasurementsTable from "./MeasurementsTable"

interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

function App() {

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedData, setSelectedData] = useState<{
    rectangles: Rectangle[];
    distance: number | null;
  } | null>(null);

  const handleRowClick = (data: { rectangles: Rectangle[]; distance: number | null }) => {
    setSelectedData(data);

    // Optionally redraw immediately if canvasRef is available
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');

    if (canvas && context) {
      context.clearRect(0, 0, canvas.width, canvas.height);

      data.rectangles.forEach(({ x, y, width, height }) => {
        context.strokeStyle = 'black';
        context.strokeRect(x, y, width, height);
      });
    }
  };

  return (
      <>
        <div>
          <main className="lg:pl-96 h-screen">
            <div className="xl:pl-96 h-full">
              <div className="px-4 py-10 sm:px-6 lg:px-8 lg:py-6 h-full">
                <CanvasDrawing canvasRef={canvasRef} selectedData={selectedData} />
              </div>
            </div>
          </main>

          <aside className="fixed inset-y-0 hidden w-120 overflow-y-auto border-r border-gray-200 py-3 xl:block">
            <MeasurementsTable onRowClick={handleRowClick} />
          </aside>
        </div>
      </>
  )
}

export default App
