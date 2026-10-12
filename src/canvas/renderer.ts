import { currentState, setState } from "../state";

// Types
export interface Point {
    x: number;
    y: number;
}

export interface LineConfig {
    type: "line";
    p1: Point;
    p2: Point;
    p3: Point;
}

export interface CircleConfig {
    type: "circle";
    center: Point;
    radius: number;
    color: string;
}

export interface View {
    ctx: CanvasRenderingContext2D;
    w: number;
    h: number;
    dpr: number;
}


// State variables
let queued = false;
let view: View;
let drawQueue: (CircleConfig | LineConfig)[] = [];


// Helpers
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

const getRandomSafeCanvasPoint = (): Point => {
    const { w, h } = view;

    return {
        x: Math.random() * (w - 20) + 10, // 10 to w-10 
        y: Math.random() * (h - 20) + 10 // 10 to h-10 
    }
}

const createCircle = (pos: Point): CircleConfig => {
    const circle: CircleConfig = {
        type: "circle",
        center: pos,
        radius: 5,
        color: currentState === "input" ? "red" : "blue"
    }

    return circle;
}

const createRandomLine = (startLocation: Point | CircleConfig): LineConfig => {
    const { w, h } = view;
    const startPoint: Point = "type" in startLocation ? startLocation.center : startLocation;

    // Canvas info helpers
    const { x: px, y: py } = startPoint;
    const midX = w / 2;
    const midY = h / 2;

    // Essentially what quadrant the passed in circle is in
    const startRight = px >= midX;
    const startBottom = py >= midY;

    // Required for loop
    let isGoodAngle: boolean;
    let angle: number;
    let target: Point;
    let hit: Point;

    // We want to confirm that a line extended from the circle to a full length won't end in the same quadrant
    // That wouldn't really be helpful for learning, so we make sure it ends in a different quadrant, which means lots of math
    do {
        isGoodAngle = true;

        // Gets random degree, then converts to radians
        angle = Math.random() * 2 * Math.PI;
        const dx = Math.cos(angle);
        const dy = Math.sin(angle);

        const lineLength = (Math.random() * 270) + 30; // Range: 30 - 300
        target = {
            x: px + dx * lineLength,
            y: py + dy * lineLength
        }

        // Target needs to be in the same quadrant as our start point to be valid
        isGoodAngle = (target.x >= midX) === startRight && (target.y >= midY) === startBottom;
        if (!isGoodAngle) continue;

        // Essentially figuring out what edge of the canvas this line would hit if fully extended
        // Then we can calculate that exact point, so we can reuse it later in the output
        const tx = dx > 0 ? (w - px) / dx : dx < 0 ? (0 - px) / dx : Infinity;
        const ty = dy > 0 ? (h - py) / dy : dy < 0 ? (0 - py) / dy : Infinity;
        const t = Math.min(tx, ty);
        hit = { x: px + t * dx, y: py + t * dy };

        // Final Check
        // The point where the line exits the canvas (hit) needs to be in a different quadrant from p1 and p2 to be valid
        isGoodAngle = (hit.x >= midX) !== startRight || (hit.y >= midY) !== startBottom;
    }
    while (!isGoodAngle);


    return {
        type: "line",
        p1: startPoint,
        p2: target,
        p3: hit!
    };
}


// Draw Request Functions
export const drawCircle = (pos: Point) => {

    const circle: CircleConfig = createCircle(pos);
    drawQueue.push(circle);
    requestRender();
    return circle;
}

export const drawRandomCircle = () => {
    return drawCircle(getRandomSafeCanvasPoint());
}

export const drawRandomLine = (startLocation?: Point | CircleConfig) => {

    // If no point is given, we'll take a random safe one
    const line = createRandomLine(startLocation ? startLocation : getRandomSafeCanvasPoint());
    drawQueue.push(line);
    requestRender();
    return line;
}


// Renderer Lifecycle Functions  
export const setupRenderer = (passedView: View) => {
    view = passedView;
    requestRender(); // Draw first frame
}

export const clearScene = () => {
    drawQueue.length = 0;
    setState("start");
    requestRender();
}

export const requestRender = () => {
    if (queued) return; // We already know
    queued = true;

    // The render will happen at what the browser considers the optimal time in the event loop
    // This also prevents errors from view not being defined on startup, because this defers
    // until all the setup code has already finished running
    requestAnimationFrame(() => {
        queued = false;
        render();
    });
}

const render = () => {
    const { ctx } = view;
    drawAxes();

    for (const obj of drawQueue) {
        if (obj.type === "circle") {
            const circle: CircleConfig = obj as CircleConfig;

            ctx.beginPath();
            ctx.arc(circle.center.x, circle.center.y, circle.radius, 0, Math.PI * 2);
            ctx.fillStyle = circle.color;
            ctx.fill();
            continue;
        }

        if (obj.type === "line") {
            const line: LineConfig = obj as LineConfig;

            // Step 1: Draw the start and target points
            ctx.beginPath();
            ctx.arc(line.p1.x, line.p1.y, 5, 0, Math.PI * 2);
            ctx.fillStyle = "blue";
            ctx.fill();

            ctx.beginPath();
            ctx.arc(line.p2.x, line.p2.y, 4, 0, Math.PI * 2);
            ctx.fillStyle = "purple";
            ctx.fill();

            // Step 2: Draw the result line
            if (currentState === "result") {
                ctx.strokeStyle = "blue";
                ctx.lineWidth = 2;

                ctx.beginPath();
                ctx.moveTo(line.p1.x, line.p1.y);
                ctx.lineTo(line.p3.x, line.p3.y);
                ctx.stroke();
            }
        }
    }
}
