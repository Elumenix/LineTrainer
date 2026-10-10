import { setupCanvas } from "./canvas/setup";
import { setupRenderer, clearScene } from "./canvas/renderer"; 
import { initUI } from "./ui/controls";
import { setupMouse } from "./input/mouse";


// Things that happen immediately
initUI((canvas: HTMLCanvasElement) : void => {
    // Callback: canvas is cleared whenever screen size or device pixel ratio changes
    const view = setupCanvas(canvas, () => { clearScene() });

    // Everything else gets set up
    setupRenderer(view);    
    setupMouse(canvas);
});
