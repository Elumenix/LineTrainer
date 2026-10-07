export const setupCanvas = (canvas: HTMLCanvasElement, callback: () => void) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("2D canvas context is not available");
    const view = { ctx, w: 0, h: 0, dpr: 1 };

    // Updates the view to match the html canvas parameters
    const measure = () => {
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();

        // Make drawing coordinates match CSS pixels
        canvas.width = Math.round(rect.width * dpr);
        canvas.height = Math.round(rect.height * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        view.dpr = dpr;
        view.w = canvas.width / dpr;
        view.h = canvas.height / dpr;
    }

    // When a resize happens, the view is updated, and the callback triggers all function that need that information immediately
    const handleResize = () => {
        measure();
        callback();
    }

    // Monitors and adapts to changes in the screens device pixel ratio
    // This should only commonly happen if moving the page from one monitor to another
    const watchDevicePixelRatio = () => {
        // Observer for the dpr
        const mq = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);

        mq.addEventListener('change', () => {
            handleResize(); // Update view and send callback
            watchDevicePixelRatio(); // Set up another watcher for the new dpr
        }, { once: true }); // We no longer need to track the old dpr, so this is put to rest
    }

    measure(); // Validate immediately on page load

    // Set up observers to detect when a change requires the view to change
    new ResizeObserver(handleResize).observe(canvas);
    watchDevicePixelRatio();

    // Reference to the view, so the rest of the program can use it
    return view;
}