import Ground from "./ground.mjs";
import Player from "./player.mjs";


const canvas = document.getElementById('cnv');
const gl = canvas.getContext('webgl2');

twgl.resizeCanvasToDisplaySize(canvas);

const uniforms = {
	world_mat: twgl.m4.identity(),
	mv_mat: twgl.m4.identity(),
	proj_mat: twgl.m4.perspective(45 * Math.PI / 180, canvas.width / canvas.height, 0.01, 100)
};

await Ground.init(gl, {
	rows: 50,
	cols: 50,
	spacing: 0.5,
	height_func: (row, col) => {
		return Math.sin(row) * Math.cos(col ^ (row * 10)) * 0.2 + 0.4;
	},
	color_func: (row, col, height) => {
		height = height * 0.4 + 0.7;
		// return [Math.random() * 0.7, Math.random() * 0.1, Math.random() * 0.4, 1.0];
		return [height, height, height, 1.0];
	}
});

Player.init();

gl.clearColor(0.01, 0.01, 0.01, 1);
gl.enable(gl.DEPTH_TEST);
gl.enable(gl.BLEND);
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

function render() {
	twgl.resizeCanvasToDisplaySize(canvas);
	gl.viewport(0, 0, canvas.width, canvas.height);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	Player.update();
	twgl.m4.translation([-Player.pos.z, 2, -Player.pos.x], uniforms.mv_mat);
	twgl.m4.rotateY(uniforms.mv_mat, Player.rot.x, uniforms.mv_mat);
	twgl.m4.rotateX(uniforms.mv_mat, Player.rot.y, uniforms.mv_mat);
	twgl.m4.inverse(uniforms.mv_mat, uniforms.mv_mat);

	Ground.update(gl);
	Ground.render(gl, uniforms);

	window.requestAnimationFrame(render);
}

window.requestAnimationFrame(render);


window.addEventListener('click', () => {
	canvas.requestPointerLock();
});
