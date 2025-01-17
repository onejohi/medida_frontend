import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { deleteRectangleData } from './redux/rectangleSlice';
import { Rectangle } from './interfaces/Rectangle';
import { SavedData } from './interfaces/SavedData'

interface MeasurementsTableProps {
  onRowClick: (data: { rectangles: Rectangle[]; distance: number | null }) => void;
}

export default function MeasurementsTable({ onRowClick }: MeasurementsTableProps) {
  const dispatch = useDispatch();

  const [rectangles, setRectangles] = useState<SavedData[]>([])
  const [selectedRow, setSelectedRow] = useState<string | null>(null);

  useEffect(() => {
    const savedData = localStorage.getItem('canvasData');
    if (savedData) {
      const parsedData: SavedData[] = JSON.parse(savedData);
      setRectangles(parsedData); // Set the rectangles state with data from localStorage
    }
  }, [rectangles]); 

  const handleDelete = (createdAt: string) => {
    if (window.confirm('Are you sure you want to delete this measurement?')) {
      dispatch(deleteRectangleData(createdAt));
    }
  };

  const handleRowClick = (rectangle: any) => {
    setSelectedRow(rectangle.timestamp);
    onRowClick(rectangle);
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold text-gray-900">
            Interactive Measurement Tool
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            Click a row to visualize its measurement on the canvas. You can also edit or delete saved measurements.
          </p>
        </div>
      </div>
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
          {rectangles?.length === 0 ? (
            <div>
              <div className="text-center py-4 text-sm text-gray-500">
                No Data
              </div>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-300">
              <thead>
                <tr>
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">#</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Rectangle 1 (HxW)
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Rectangle 2 (HxW)
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Distance
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Timestamp
                  </th>
                  <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              
              <tbody className="divide-y divide-gray-200">
                {rectangles?.map((rectangle) => (
                  <tr
                    key={rectangle.createdAt}
                    className={`cursor-pointer hover:bg-gray-100 ${
                      selectedRow === rectangle.createdAt ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => handleRowClick(rectangle)}
                  > <td>
                    #
                  </td>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-500">
                      {rectangle.rectangles[0]?.height}x{rectangle.rectangles[0]?.width}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {rectangle.rectangles[1]?.height}x{rectangle.rectangles[1]?.width}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {rectangle.distance ? rectangle?.distance.toFixed(2) : 'N/A'}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {new Date(rectangle?.createdAt).toLocaleString()}
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(rectangle?.id);
                        }}
                        className="text-red-600 hover:text-red-900 mr-4"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          </div>
        </div>
      </div>
    </div>
  );
}