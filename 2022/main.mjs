import { el, create_program } from "./util.mjs";
import Mesh from "./mesh.mjs";


const cnv = el('canvas');
const gl = cnv.getContext('webgl2');

function resize_canvas() {
	twgl.resizeCanvasToDisplaySize(cnv);
	gl.viewport(0, 0, cnv.width, cnv.height);
}

window.addEventListener('resize', resize_canvas);
resize_canvas();


const prog = await create_program(gl, 'shaders/color');

const uniforms = {
	proj_mat: twgl.m4.perspective(65 * Math.PI / 180, cnv.width / cnv.height, 0.1, 100),
	mv_mat: twgl.m4.translation([0, 0, -4], twgl.m4.identity())
};

const arrays = {
	position: { numComponents: 3, data: new Float32Array([
		-1, 1, 0,
		1, 1, 0,
		-1, -1, 0
	]) },
	color: { numComponents: 4, data: new Float32Array([
		1, 0, 0, 1,
		0, 1, 0, 1,
		0, 0, 1, 1
	]) }
};

const mesh = new Mesh(prog, uniforms);
mesh.set_data(gl, arrays);


gl.clearColor(0, 0, 0, 1);
let prev_time = 0;

function render(time) {
	const elapsed = time - prev_time; // Elapsed frame time in ms
	prev_time = time;

	gl.clear(gl.COLOR_BUFFER_BIT);
	mesh.render(gl);

	window.requestAnimationFrame(render);
}

window.requestAnimationFrame(render);
