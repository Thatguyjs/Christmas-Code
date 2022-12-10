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
	view_mat: twgl.m4.identity(),
	model_mat: twgl.m4.translation([-4, -4, -4])
};


let rot = { y: 0, x: 0, scale: 0.01 };

window.addEventListener('mousemove', ev => {
	rot.y += ev.movementX * rot.scale;
	rot.x += ev.movementY * rot.scale;

	twgl.m4.rotationX(rot.x, uniforms.view_mat);
	twgl.m4.rotateY(uniforms.view_mat, rot.y, uniforms.view_mat);
});


await GroundMesh.init(gl, uniforms);

gl.clearColor(0, 0, 0, 1);
let prev_time = 0;

function render(time) {
	const elapsed = time - prev_time; // Elapsed frame time in ms
	prev_time = time;

	gl.clear(gl.COLOR_BUFFER_BIT);

	GroundMesh.render(gl);

	window.requestAnimationFrame(render);
}

window.requestAnimationFrame(render);
