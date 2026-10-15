// Will control the state that the line drawer is in, and transmit information so we know what to render
export type CanvasState =
    | "start"
    | "input"
    | "result";

export type PracticeMode = 
    | "Line"
    | "Box";

export let currentState: CanvasState = "start";
export let currentMode: PracticeMode = "Box";

export const setState = (newState: CanvasState) => {
    currentState = newState;
}

export const setMode = (newMode: PracticeMode) => {
    currentMode = newMode;
}

