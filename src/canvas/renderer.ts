interface View {
    ctx: CanvasRenderingContext2D;
    w: number;
    h: number;
    dpr: number;
}

export interface Point {
    x: number;
    y: number;
}

interface Line {
    type: "line";
    p1: Point;
    p2: Point;
    color: string;
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
export const drawCircle = (pos: Point) => {
    const circle: CircleConfig = {
        type: "circle",
        center: pos,
        radius: 3,
        color: 'blue'
    }

    drawQueue.push(circle);
    requestRender();
    return circle;
}

export const drawRandomCircle = () => {
    const { w, h } = view;

    let circleCenter: Point = {
        x: Math.random() * (w - 20) + 10, // 10 to w-10 (inclusive)
        y: Math.random() * (h - 20) + 10    // 10 to h-10 (inclusive)
    }

    return drawCircle(circleCenter);
}

export const drawRandomLineFromCircle = (circle: CircleConfig) => {
    const { w, h } = view;

    // Canvas info helpers
    const { x: px, y: py } = circle.center;
    const midX = w / 2;
    const midY = h / 2;

    // Essentially what quadrant the passed in circle is in
    const startRight = px >= midX;
    const startBottom = py >= midY;

    // Required for loop
    let isGoodAngle: boolean;
    let angle: number;

    // We want to confirm that a line extended from the circle to a full length won't end in the same quadrant
    // That wouldn't really be helpful for learning, so we make sure it ends in a different quadrant, which means lots of math
    do {
        isGoodAngle = true;

        // Gets random degree, then converts to radians
        angle = (Math.random() * 360) * 0.01745329251;
        const dx = Math.cos(angle);
        const dy = Math.sin(angle);
        
        // Essentially figuring out what edge of the canvas a line of this angle, extended from the input circle, would hit first
        // Then we can calculate that exact point 
        const tx = dx > 0 ? (w - px) / dx : dx < 0 ? (0 - px) / dx : Infinity;
        const ty = dy > 0 ? (h - py) / dy : dy < 0 ? (0 - py) / dy : Infinity;
        const t = Math.min(tx, ty);
        const hit : Point =  {x: px + t * dx, y: py + t * dy };

        // If both the x and y are on the same side of the center line as the circle, then we stayed in the same quadrant
        isGoodAngle = (hit.x >= midX) !== startRight || (hit.y >= midY) !== startBottom;
    }
    while (!isGoodAngle);


    const lineLength = (Math.random() * 50) + 10; // Range: 30 - 300
    const line: Line = {
        type: "line",
        p1: circle.center,
        p2: {
            x: circle.center.x + Math.cos(angle) * lineLength,
            y: circle.center.y + Math.sin(angle) * lineLength
        },
        color: "blue"
    }

    drawQueue.push(line);
    requestRender();
    return line;
}

export const clearScene = () => {
    drawQueue.length = 0;
    requestRender();
}

const render = () => {
    const { ctx } = view;
    drawAxes();

    for (const obj of drawQueue) {
        if (obj.type === "circle") {
            const circle: CircleConfig = obj as CircleConfig;

            ctx.beginPath();
            ctx.arc(circle.center.x, circle.center.y, 5, 0, Math.PI * 2);
            ctx.fillStyle = circle.color;
            ctx.fill();
            continue;
        }

        if (obj.type === "line") {
            console.log("Line path entered");
            const line: Line = obj as Line;

            ctx.strokeStyle = line.color;
            ctx.lineWidth = 2;

            ctx.beginPath();
            ctx.moveTo(line.p1.x, line.p1.y);
            ctx.lineTo(line.p2.x, line.p2.y);
            ctx.stroke();
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
let drawQueue: (CircleConfig | Line)[] = [];
export const setupRenderer = (passedView: View) => {
    view = passedView;
    requestRender(); // Draw first frame
}
