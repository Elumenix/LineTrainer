// Will control the state that the line drawer is in, and transmit information so we know what to render
export type CanvasState =
    | "start"
    | "input"
    | "result";

export type PracticeMode =
    | "Line"
    | "Box";

export type YMode =
    | "Random"
    | "Balanced";

export let currentState: CanvasState = "start";
export let currentMode: PracticeMode = "Box";
export let currentYMode: YMode = "Balanced"
let edgeTracker: number = 0; // A bitwise tracker

export const setState = (newState: CanvasState) => {
    currentState = newState;
    if (newState === "start") {
        edgeTracker = 0;
    }
}

export const setMode = (newMode: PracticeMode) => {
    currentMode = newMode;
}

const validateSides = (side1: number, side2: number) => {

    // We're not using a type because this system completely relies on the order in the draw queue
    if (
        !Number.isInteger(side1) ||
        !Number.isInteger(side2) ||
        side1 < 0 ||
        side1 > 2 ||
        side2 < 0 ||
        side2 > 2 ||
        side1 === side2
    ) {
        throw new Error("At least 1 of the inputted sides do not exist");
    }
}

export const checkEdge = (side1: number, side2: number): boolean => {

    if (side2 < side1) {
        return checkEdge(side2, side1);
    }
    validateSides(side1, side2);

    // Check the bit representing the correct side and return true if it's checked
    if (side1 === 0 && side2 === 1 && (edgeTracker & 1) === 1) return true;
    if (side1 === 0 && side2 === 2 && ((edgeTracker >> 1) & 1) === 1) return true;
    if (side1 === 1 && side2 === 2 && ((edgeTracker >> 2) & 1) === 1) return true;

    // If the bit isn't checked, return false
    return false;
}

export const trackEdge = (side1: number, side2: number) => {
    if (side2 < side1) {
        trackEdge(side2, side1);
        return;
    }
    validateSides(side1, side2);

    // Set the bit representing the side to 1
    if (side1 === 0 && side2 === 1) edgeTracker |= 1;
    if (side1 === 0 && side2 === 2) edgeTracker |= 2;
    if (side1 === 1 && side2 === 2) edgeTracker |= 4;
}

