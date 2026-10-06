
/** @type {HTMLCanvasElement} */
const canvas = document.getElementById("vectorCanvas");
/** @type {CanvasRenderingContext2D} */
const ctx = canvas.getContext("2d");

// TODO: might want to bring the size variables out of resizecanvas to reuse them
// If things are correct, event.clientX - rect.left will be in CSS pixels, which is the current coordinate space

const draw = () => {
    const dpr = window.devicePixelRatio || 1;

    // Buffer size expressed in CSS pixels, so it maps exactly onto the buffer
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;

    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = "red";
    //ctx.lineWidth = 1 / dpr; // exactly 1 device pixel
    ctx.lineWidth = 2;


    // Center of the middle device pixel, converted back to CSS pixels
    const cx = (Math.floor(canvas.width / 2) + 0.5) / dpr;
    const cy = (Math.floor(canvas.height / 2) + 0.5) / dpr;

    ctx.beginPath();
    ctx.moveTo(cx, 0);
    ctx.lineTo(cx, h);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, cy);
    ctx.lineTo(w, cy);
    ctx.stroke();
}

function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    // Set the buffer size in physical pixels
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);

    // Make drawing coordinates match CSS pixels
    // I should not use ctx.reset() in any draw methods becuase of this
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    draw(); // redraw, since resizing clears the canvas
}

// This will only happen if moving the page from one monitor to the other, as pixel ratio might change
function watchDevicePixelRatio() {
    const dpr = window.devicePixelRatio;
    const mq = window.matchMedia(`(resolution: ${dpr}dppx)`);

    mq.addEventListener('change', () => {
        resizeCanvas();
        watchDevicePixelRatio(); // re-arm for the new DPR
    }, { once: true });
}

new ResizeObserver(resizeCanvas).observe(canvas);
watchDevicePixelRatio();