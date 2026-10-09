import { setupCanvas } from "./canvas/setup";
import { setupRenderer, requestRender } from "./canvas/renderer"; 
import { initUI } from "./ui/controls";
import { setupMouse } from "./input/mouse";


// Things that happen immediately
initUI((canvas: HTMLCanvasElement) : void => {
    const view = setupCanvas(canvas, () => { requestRender(); });
    setupRenderer(view);    
    setupMouse(canvas);
});
