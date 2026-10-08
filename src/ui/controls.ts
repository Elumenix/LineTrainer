// Will handle html elements on the page, such as buttons and checkboxes
import { drawRandomCircle } from "../canvas/renderer";

export const initUI = (callback: (canvas: HTMLCanvasElement) => void) => {
    const canvas = document.getElementById("vectorCanvas") as HTMLCanvasElement;
    callback(canvas);

    const generateButton = document.getElementById("generateButton") as HTMLButtonElement;
    generateButton.addEventListener('click', () => {
        console.log("Button clicked, trying to place circle on renderqueue");
        drawRandomCircle();
    });
}