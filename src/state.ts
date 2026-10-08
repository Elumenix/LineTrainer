// Will control the state that the line drawer is in, and transmit information so we know what to render
export type CanvasState =
    | "start"
    | "input"
    | "result";

export let currentState: CanvasState = "start";

export const setState = (newState: CanvasState) => {
    currentState = newState;
} 

