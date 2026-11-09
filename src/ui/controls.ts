// Will handle html elements on the page, such as buttons and checkboxes
import { drawRandomLine, drawRandomBoxY, clearScene } from "../canvas/renderer";
import { currentMode, setState, setMode } from "../state";
import { setupMouse } from "../input/mouse";

export const initUI = (callback: (canvas: HTMLCanvasElement) => void) => {
    const canvas = document.getElementById("vectorCanvas") as HTMLCanvasElement;
    callback(canvas);

    // Set up mouse behavior so we can cancel inputs early
    const mouse = setupMouse(canvas);

    // Make generate button reset draw logic and initiate progress tracking and mouse input
    const generateButton = document.getElementById("generateButton") as HTMLButtonElement;
    generateButton.addEventListener('click', () => {
        setState("start");

        // Clicking the button always results in having on circle on the screen and moving to await input
        clearScene();

        // Depending on the mode, we either draw 1 line, or the 3 needed for a cube
        if (currentMode === "Line") {
            drawRandomLine();
        }
        else {
            drawRandomBoxY();
        }

        // We need new canvas inputs now, so we reset the mouse
        mouse.reset();
        setState("input");
    });

    const renderModeToggle = document.getElementById("renderMode") as HTMLInputElement
    renderModeToggle.addEventListener('change', (event: Event) => {
        const target = event.target as HTMLInputElement;

        if (target.checked) {
            setMode("Box");
        }
        else {
            setMode("Line");
        }

        // Clear the canvas to visually convey to the user that things have changed
        // Setting state to start means that mouse input on it will no longer affect background logic until generating
        clearScene();
        setState("start");
    });
}