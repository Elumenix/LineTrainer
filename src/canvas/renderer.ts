interface View {
    ctx: CanvasRenderingContext2D;
    w: number;
    h: number;
    dpr: number;
}

interface Point {
    x: number;
    y: number;
}

interface CircleConfig {
    type: "circle";
    center: Point;
    radius: number;
    color: string;
}

const drawAxes = () => {
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

// Todo: Color may change depending on state
const drawCircle = (pos: Point) => {
    drawQueue.push({
        type: "circle",
        center: pos,
        radius: 3,
        color: 'blue'
    });

    requestRender();
}

export const drawRandomCircle = () => {
    const { w, h } = view;

    let circleCenter: Point = {
        x: Math.random() * (w - 20) + 10, // 10 to w-10 (inclusive)
        y: Math.random() * (h - 20) + 10    // 10 to h-10 (inclusive)
    }

    drawCircle(circleCenter);
}

const render = () => {
    const { ctx } = view;
    drawAxes();

    for (const obj of drawQueue) {
        if (obj.type === "circle") {
            const circle: CircleConfig = obj as CircleConfig;

            ctx.beginPath();
            ctx.arc(circle.center.x, circle.center.y, 5, 0, Math.PI * 2);
            ctx.fillStyle = 'blue';
            ctx.fill();
        }
    }
}


let queued = false;
export const requestRender = () => {
    if (queued) return; // We already know
    queued = true;

    // The render will happen at what the browser consideres the optimal time in the event loop
    // This also prevents errors from view not being defined on startup, because this defers
    // until all the setup code has already finished running
    requestAnimationFrame(() => {
        queued = false;
        render();
    });
}

let view: View;
let drawQueue: (CircleConfig)[] = [];
export const setupRenderer = (passedView: View) => {
    view = passedView;
    requestRender(); // Draw first frame
}
