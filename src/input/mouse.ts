import { drawCircle } from "../canvas/renderer";
import type { CircleConfig, Point } from "../canvas/renderer";
import { currentMode, currentState, setState } from "../state";

// I could use a counter for this whole ordeal rather than a generator function
// But the whole point of this is to learn new things and grow more comfortable with javascript, so we do this
function* clickHandler(canvas: HTMLCanvasElement): Generator<void, void, PointerEvent> {
    const rect = canvas.getBoundingClientRect();

    if (currentMode === "Box") {
        for (let i = 0; i < 4; i++) {
            const event = yield;
            drawCircle(
                event.clientX - rect.left,
                event.clientY - rect.top
            );
        }
    }
    else if (currentMode === "Line") {
        const event = yield;
        drawCircle(
            event.clientX - rect.left,
            event.clientY - rect.top
        );
    }

    // All the expected clicks are finished
    setState("result");
}


export const setupMouse = (canvas: HTMLCanvasElement) => {
    let handler = clickHandler(canvas);
    handler.next(); // Get to first yield

    canvas.addEventListener("click", (event) => {
        if (currentState !== "input") return; // Pretty clear, really 

        const step = handler.next(event);
        if (step.done) {
            // If we finished we need to set this up again
            handler = clickHandler(canvas);
            handler.next(); // Get to first yield
        }
    });
}