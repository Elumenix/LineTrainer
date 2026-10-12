// Will handle html elements on the page, such as buttons and checkboxes
import { drawRandomLine, clearScene } from "../canvas/renderer";
import { setState } from "../state";

export const initUI = (callback: (canvas: HTMLCanvasElement) => void) => {
    const canvas = document.getElementById("vectorCanvas") as HTMLCanvasElement;
    callback(canvas);

    const generateButton = document.getElementById("generateButton") as HTMLButtonElement;
    generateButton.addEventListener('click', () => {
        
        // Clicking the button always results in having on circle on the screen and moving to await input
        clearScene();
        drawRandomLine();

        setState("input");
    });
}