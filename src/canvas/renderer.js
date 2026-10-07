// @ts-check

/**
 * @param {{ ctx: CanvasRenderingContext2D, w: number, h: number, dpr: number }} view
 */
const drawAxes = (view) => {
    const { ctx, w, h, dpr } = view;

    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = "red";
    ctx.lineWidth = 1 / dpr; // exactly 1 device pixel

    // Center of the middle device pixel, converted back to CSS pixels
    const cx = (Math.floor((w * dpr) / 2) + 0.5) / dpr;
    const cy = (Math.floor((h * dpr) / 2) + 0.5) / dpr;

    ctx.beginPath();
    ctx.moveTo(cx, 0);
    ctx.lineTo(cx, h);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, cy);
    ctx.lineTo(w, cy);
    ctx.stroke();
}

/**
 * @param {{ ctx: CanvasRenderingContext2D, w: number, h: number, dpr: number }} view
 */
export const render = (view) => {
    // This is all currently
    drawAxes(view);
}
