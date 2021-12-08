import Ground from "./ground.mjs";


const canvas = document.getElementById('cnv');
const gl = canvas.getContext('webgl2');

twgl.resizeCanvasToDisplaySize(canvas);

const uniforms = {
	world_mat: twgl.m4.identity(),
	mv_mat: twgl.m4.identity(),
	proj_mat: twgl.m4.perspective(45 * Math.PI / 180, canvas.width / canvas.height, 0.01, 100)
};

twgl.m4.translate(uniforms.mv_mat, [0, -2, -10], uniforms.mv_mat);

await Ground.init(gl, {
	rows: 20,
	cols: 20,
	spacing: 0.5,
	height_func: (row, col) => {
		return Math.sin(row) * Math.cos(col) * 0.2;
	},
	color_func: (row, col, height) => {
		height = height * 2.5 + 0.5;
		return [row / 20, col / 20, height, 1.0];
	}
});

gl.clearColor(0.01, 0.01, 0.01, 1);
gl.enable(gl.DEPTH_TEST);
gl.enable(gl.BLEND);
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

function render() {
	twgl.resizeCanvasToDisplaySize(canvas);
	gl.viewport(0, 0, canvas.width, canvas.height);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	Ground.update(gl);
	Ground.render(gl, uniforms);

	twgl.m4.rotateY(uniforms.mv_mat, 0.005, uniforms.mv_mat);

	window.requestAnimationFrame(render);
}

window.requestAnimationFrame(render);
