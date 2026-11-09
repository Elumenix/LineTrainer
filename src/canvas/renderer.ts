import { currentState, setState, currentMode, currentYMode, checkEdge, trackEdge } from "../state";

// Types
export type Point = {
    x: number;
    y: number;
}

export type LineConfig = {
    type: "line";
    p1: Point;
    p2: Point;
    p3: Point;
}

export type CircleConfig = {
    type: "circle";
    center: Point;
    radius: number;
    color: string;
}

type Angles = {
    angle1: number;
    angle2: number;
    angle3: number;
};

export type View = {
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

const createLine = (startLocation: Point | CircleConfig, endLocation?: Point, angle?: number, length?: number): LineConfig => {
    const { w, h } = view;
    const startPoint: Point = "type" in startLocation ? startLocation.center : startLocation;
    const { x: px, y: py } = startPoint;

    // Calculate direction and length
    let dx: number;
    let dy: number;
    let lineLength: number;

    // If the endpoint was passed in, we can get angle and length info directly from it, otherwise it's we'll use the passed in / default values
    if (endLocation) {
        const deltaX = endLocation!.x - px;
        const deltaY = endLocation!.y - py;

        lineLength = Math.sqrt(deltaX ** 2 + deltaY ** 2);
        dx = deltaX / lineLength;
        dy = deltaY / lineLength;
    }
    else {
        // This is expected to be passed in if this branch was called, but there are safety values
        dx = Math.cos(angle ?? 0);
        dy = Math.sin(angle ?? 0);
        lineLength = length ?? 30; // Default length is 30
    }

    // Essentially figuring out what edge of the canvas this line would hit if fully extended
    // Then we can calculate that exact point, so we can reuse it later in the output
    const tx = dx > 0 ? (w - px) / dx : dx < 0 ? (0 - px) / dx : Infinity;
    const ty = dy > 0 ? (h - py) / dy : dy < 0 ? (0 - py) / dy : Infinity;
    const t = Math.min(tx, ty);

    return {
        type: "line",
        p1: startPoint,
        p2: { x: px + dx * lineLength, y: py + dy * lineLength },
        p3: { x: px + t * dx, y: py + t * dy }
    };
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

const generateAngles = (): Angles => {
    let extraGaps: number[];

    if (currentYMode === "Random") {
        // This version of the function provides a linear descending distribution
        // This ends up having the generated boxes have some extreme angles
        // There will be a minimum of 90 degrees between each of the arms of the box

        // Uniformly distribute two cuts across 90 degrees.
        const cuts = [
            Math.random() * 90,
            Math.random() * 90
        ].sort((a, b) => a - b);

        extraGaps = [
            cuts[0]!,
            cuts[1]! - cuts[0]!,
            90 - cuts[1]!
        ];
    }
    else {
        // This version of the function provides a right skewed bell curve for each angle, centered on ~112, with a range of 90-180
        // This ends up having the generated boxes be much more cube shaped than completely random
        // There will be a minimum of 90 degrees between each of the arms of the box

        // Generate Gamma-distributed weights (shape = 2).
        const randomWeight = (): number =>
            -Math.log(Math.random()) - Math.log(Math.random());

        const weights = [
            randomWeight(),
            randomWeight(),
            randomWeight()
        ];

        const total = weights.reduce(
            (sum, weight) => sum + weight,
            0
        );

        extraGaps = weights.map(
            weight => (90 * weight) / total
        );
    }

    // Every gap has a minimum of 90 degrees.
    const gaps = extraGaps.map(gap => gap + 90);

    /// Randomly rotate the triangle so all placements are possible
    const start = Math.random() * 360;
    const degToRad = Math.PI / 180;

    return {
        angle1: (start) * degToRad,
        angle2: ((start + gaps[0]!) % 360) * degToRad,
        angle3: ((start + gaps[0]! + gaps[1]!) % 360) * degToRad
    }
}




// Draw Request Functions
export const drawCircle = (
    ...args: [pos: Point] | [x: number, y: number]
): CircleConfig => {
    // We're allowing Point of (x,y) as input so we gotta parse that
    const pos: Point =
        typeof args[0] === "number"
            ? { x: args[0], y: args[1] } as Point
            : args[0] as Point;

    const circle: CircleConfig = createCircle(pos);
    drawQueue.push(circle);
    requestRender();
    return circle;
}

export const drawBoxCorner = (x: number, y: number) => {
    if (currentMode !== "Box") {
        throw new Error("Not the right mode to guarantee this is appropriate.");
    }

    // In box mode, the first line will be a part of the y, so this is correct
    const lines = drawQueue.filter((obj): obj is LineConfig => obj.type === "line").slice(0, 3);
    if (lines.length !== 3) {
        // This shouldn't be a problem, but just in case
        throw new Error("The lines that should make up the Y are not present.")
    }

    const origin = lines[0]!.p1;
    const inputAngle = Math.atan2(
        y - origin.y,
        x - origin.x
    );

    // Make it range from 0 to 2Pi
    const normalize = (angle: number) => ((angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    const targetAngle = normalize(Math.atan2(y - origin.y, x - origin.x));

    // Sort lines by their angle
    const sorted = lines.map((line, index) => ({
        line,
        index,
        angle: Math.atan2(
            line.p2.y - origin.y,
            line.p2.x - origin.x
        )
    })).sort((a, b) => a.angle - b.angle);



    // Generate all three edges
    const candidates = sorted.map((current, i) => {
        const next = sorted[(i + 1) % sorted.length];

        const start = current.angle;
        const end = next!.angle;

        const sectorWidth = normalize(next!.angle - current.angle);
        const relativeAngle = normalize(targetAngle - current.angle);
        const containsAngle = relativeAngle <= sectorWidth;

        const angularDistance = containsAngle ? 0 : Math.min(normalize(start - targetAngle), normalize(targetAngle - end));

        const edge: [number, number] = [current.index, next!.index];

        return {
            edge,
            a: current.line.p2,
            b: next!.line.p2,
            containsAngle,
            angularDistance,
            occupied: checkEdge(edge[0], edge[1])
        };
    });

    // Bring whichever two lines are on either side of the input angle
    candidates.sort((a, b) => a.angularDistance - b.angularDistance);

    // Take the first edge that wasn't already drawn, if one exists
    const selectedEdge = candidates.find(candidate => !candidate.occupied);



    if (!selectedEdge) {
        // If no corner can be selected, that means that this was the back corner, so all chosen points will draw to the back corner

        // Track a set of points (box corners) and add the ones that are a part of the Y
        const seen: Set<Point> = new Set();
        seen.add({ x, y }); // To prevent points we add from firing
        for (const line of lines) {
            seen.add(line.p2);
        }

        drawQueue.filter((edge): edge is LineConfig => {
            if (edge.type === "line") {

                // If this point is already seen, skip it
                if (seen.has(edge.p2)) return false;

                seen.add(edge.p2);
                drawQueue.push(createLine(edge.p2, { x, y }));
                return true;
            }
            return false;
        });
    }
    else {
        // Create the corner as normal
        drawQueue.push(createLine(selectedEdge.a as Point, { x, y }));
        drawQueue.push(createLine(selectedEdge.b as Point, { x, y }));
        trackEdge(selectedEdge.edge[0] ?? Infinity, selectedEdge.edge[1] ?? Infinity);
    }

    requestRender();
}

export const drawRandomCircle = () => {
    return drawCircle(getRandomSafeCanvasPoint());
}

export const drawLine = (startLocation: Point | CircleConfig, angle: number, length: number) => {

    const line = createLine(startLocation, undefined, angle, length);
    drawQueue.push(line);
    requestRender();
    return line;
}

export const drawRandomLine = (startLocation?: Point | CircleConfig) => {

    // If no point is given, we'll take a random safe one
    const line = createRandomLine(startLocation ? startLocation : getRandomSafeCanvasPoint());
    drawQueue.push(line);
    requestRender();
    return line;
}

export const drawRandomBoxY = () => {

    const { angle1, angle2, angle3 } = generateAngles();
    const { w, h } = view;
    let boxCenter = getRandomSafeCanvasPoint();

    // The boxes center should be somewhere in the middle of the graph to give more room to expand the arms
    // This also prevents the web worker from potentially freezing if the center gets placed too close to the edge of the graph
    while (boxCenter.x < w / 4 || boxCenter.x > w * 3 / 4 || boxCenter.y < h / 4 || boxCenter.y > h * 3 / 4) {
        boxCenter = getRandomSafeCanvasPoint();
    }

    for (let i = 0; i < 3; i++) {
        const angle = i === 0 ? angle1 : i === 1 ? angle2 : angle3;
        const length = Math.random() * 270 + 30;
        const line = createLine(boxCenter, undefined, angle, length);

        // Needs the be in poinds on the canvas so that the user can actually see the points
        if (line.p2.x < 10 || line.p2.x >= w - 10 || line.p2.y < 10 || line.p2.y >= h - 10) {
            i--;
        }
        else {
            drawQueue.push(line);
        }
    }

    requestRender();
};


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

            // Step 1: Draw lines to show the current edges of the box
            ctx.strokeStyle = "red";
            ctx.lineWidth = 3;

            ctx.beginPath();
            ctx.moveTo(line.p1.x, line.p1.y);
            ctx.lineTo(line.p2.x, line.p2.y);
            ctx.stroke();

            // Step 1.5: If in line mode, draw the actual points on the line to help signify direction
            if (currentMode === "Line") {
                // Start point
                ctx.beginPath();
                ctx.arc(line.p1.x, line.p1.y, 5, 0, Math.PI * 2);
                ctx.fillStyle = "red";
                ctx.fill();

                // End of sample line
                ctx.beginPath();
                ctx.arc(line.p2.x, line.p2.y, 2, 0, Math.PI * 2);
                ctx.fillStyle = "purple";
                ctx.fill();
            }

            // Step 2: Draw the line extensions
            if (currentState === "result") {
                ctx.strokeStyle = "blue";
                ctx.lineWidth = 1;

                ctx.beginPath();
                ctx.moveTo(line.p2.x, line.p2.y);
                ctx.lineTo(line.p3.x, line.p3.y);
                ctx.stroke();
            }
        }
    }
}
