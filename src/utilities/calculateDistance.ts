import { Rectangle } from "../interfaces/Rectangle";

export default function calculateDistance(rects: Rectangle[]): number | null {
    if (rects.length < 2) return null;

    const [rect1, rect2] = rects;
    const x1 = rect1.x + rect1.width / 2;
    const y1 = rect1.y + rect1.height / 2;
    const x2 = rect2.x + rect2.width / 2;
    const y2 = rect2.y + rect2.height / 2;

    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  };