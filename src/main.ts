import { setupCanvas } from "./canvas/setup";
import { render } from "./canvas/renderer"; 

const canvas = document.getElementById("vectorCanvas") as HTMLCanvasElement;



let queued = false;
let requestRender = () => {
    if (queued) return; // We already know
    queued = true;

    // The render will happen at what the browser consideres the optimal time in the event loop
    requestAnimationFrame(() => {
        queued = false;
        render(view);
    });
}

// Things that happen immediately
const view = setupCanvas(canvas, () => { requestRender() });
