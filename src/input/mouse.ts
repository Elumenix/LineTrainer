import { drawCircle } from "../canvas/renderer";
import type { Point } from "../canvas/renderer";
import { currentState, setState } from "../state";

export const setupMouse = (canvas: HTMLCanvasElement) => {
    
    canvas.addEventListener("click", (event) => {
        if (currentState !== "input") return; // Pretty clear, really 

        const rect = canvas.getBoundingClientRect();
        const point: Point = {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        }

        drawCircle(point);
        setState("result");
    });
}