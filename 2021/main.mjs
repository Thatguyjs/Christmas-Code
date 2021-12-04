const canvas = document.getElementById('cnv');
const gl = canvas.getContext('webgl2');

const prog_info = twgl.createProgramInfo(
	gl,
	[
		await (await fetch(location.href + 'shaders/color.vert')).text(),
		await (await fetch(location.href + 'shaders/color.frag')).text()
	]
);

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

	gl.useProgram(prog_info.program);
	twgl.setBuffersAndAttributes(gl, prog_info, bufs);
	twgl.drawBufferInfo(gl, gl.TRIANGLES, bufs);

	window.requestAnimationFrame(render);
}

window.requestAnimationFrame(render);
