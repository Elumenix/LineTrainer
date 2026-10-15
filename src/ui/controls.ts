// Will handle html elements on the page, such as buttons and checkboxes
import { drawRandomBoxY, clearScene } from "../canvas/renderer";
import { currentMode, setState } from "../state";

export const initUI = (callback: (canvas: HTMLCanvasElement) => void) => {
    const canvas = document.getElementById("vectorCanvas") as HTMLCanvasElement;
    callback(canvas);

    const generateButton = document.getElementById("generateButton") as HTMLButtonElement;
    generateButton.addEventListener('click', () => {
        
        // Clicking the button always results in having on circle on the screen and moving to await input
        clearScene();

        // Depending on the mode, we either draw 1 line, or the 3 needed for a cube
        //drawRandomLine();
        drawRandomBoxY();
        

        setState("input");
    });
}