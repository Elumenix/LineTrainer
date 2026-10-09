import { drawCircle } from "../canvas/renderer";
import type { Point } from "../canvas/renderer";

export const setupMouse = (canvas: HTMLCanvasElement) => {
    
    canvas.addEventListener("click", (event) => {
        const rect = canvas.getBoundingClientRect();

        const point: Point = {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        }

        drawCircle(point);
    });
}