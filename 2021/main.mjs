import Ground from "./ground.mjs";


const canvas = document.getElementById('cnv');
const gl = canvas.getContext('webgl2');

const prog_info = twgl.createProgramInfo(
	gl,
	[
		await (await fetch(location.href + 'shaders/color.vert')).text(),
		await (await fetch(location.href + 'shaders/color.frag')).text()
	]
);

twgl.resizeCanvasToDisplaySize(canvas);

const uniforms = {
	world_mat: twgl.m4.perspective(70 * Math.PI / 180, canvas.width / canvas.height, 0.01, 100)
};

twgl.m4.translate(uniforms.world_mat, [0, 0, -2], uniforms.world_mat);

await Ground.init(gl, 2, 2);

const arrays = {
	position: [
		-0.5, 0.5, 0,
		0.5, 0.5, 0,
		-0.5, -0.5, 0,
		0.5, -0.5, 0
	],
	color: [
		1, 0, 0, 1,
		0, 1, 0, 1,
		0, 0, 1, 1,
		0, 1, 1, 1
	],
	indices: [0, 1, 2, 1, 2, 3]
};

const bufs = twgl.createBufferInfoFromArrays(gl, arrays);

gl.clearColor(0.01, 0.01, 0.01, 1);
gl.enable(gl.DEPTH_TEST);
gl.enable(gl.BLEND);
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

function render() {
	twgl.resizeCanvasToDisplaySize(canvas);
	gl.viewport(0, 0, canvas.width, canvas.height);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	/*
	gl.useProgram(prog_info.program);
	twgl.setUniforms(prog_info, uniforms);
	twgl.setBuffersAndAttributes(gl, prog_info, bufs);

	twgl.drawBufferInfo(gl, gl.TRIANGLES, bufs);
	*/

	Ground.update(gl);
	Ground.render(gl, uniforms);

	twgl.m4.rotateY(uniforms.world_mat, 0.01, uniforms.world_mat);

	window.requestAnimationFrame(render);
}

window.requestAnimationFrame(render);
