import { el } from "./util.mjs";


const cnv = el('canvas');
const gl = cnv.getContext('webgl2');

function resize_canvas() {
	twgl.resizeCanvasToDisplaySize(cnv);
	gl.viewport(0, 0, cnv.width, cnv.height);
}

window.addEventListener('resize', resize_canvas);
resize_canvas();


gl.clearColor(0, 0, 0, 1);
let prev_time = 0;

function render(time) {
	const elapsed = time - prev_time; // Elapsed frame time in ms
	prev_time = time;

	gl.clear(gl.COLOR_BUFFER_BIT);

	window.requestAnimationFrame(render);
}

window.requestAnimationFrame(render);
