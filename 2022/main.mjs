import { el, create_program } from "./util.mjs";
import GroundMesh from "./meshes/ground.mjs";


const cnv = el('canvas');
const gl = cnv.getContext('webgl2');

function resize_canvas() {
	twgl.resizeCanvasToDisplaySize(cnv);
	gl.viewport(0, 0, cnv.width, cnv.height);
}

window.addEventListener('resize', resize_canvas);
resize_canvas();


const uniforms = {
	proj_mat: twgl.m4.perspective(65 * Math.PI / 180, cnv.width / cnv.height, 0.1, 100),
	mv_mat: twgl.m4.translation([0, 0, -4], twgl.m4.identity())
};


await GroundMesh.init(gl, uniforms);

gl.clearColor(0, 0, 0, 1);
let prev_time = 0;

function render(time) {
	const elapsed = time - prev_time; // Elapsed frame time in ms
	prev_time = time;

	gl.clear(gl.COLOR_BUFFER_BIT);

	GroundMesh.render(gl);

	// window.requestAnimationFrame(render);
}

window.requestAnimationFrame(render);
