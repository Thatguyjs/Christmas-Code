import Ground from "./ground.mjs";
import Player from "./player.mjs";


const canvas = document.getElementById('cnv');
const gl = canvas.getContext('webgl2');

twgl.resizeCanvasToDisplaySize(canvas);

await Ground.init(gl, {
	rows: 35,
	cols: 35,
	spacing: 0.5,
	chunk_pool_size: 9,
	height_func: (x, z) => {
		return Math.sin(x ^ (z * 10)) * Math.cos(z ^ (x * 10)) * 0.2 + 0.4;
	},
	color_func: (x, z, height) => {
		height = height * 0.4 + 0.7;
		return [height, height, height, 1.0];
	}
});

Player.init();


const uniforms = {
	world_mat: twgl.m4.identity(),
	mv_mat: twgl.m4.identity(),
	proj_mat: twgl.m4.perspective(65 * Math.PI / 180, canvas.width / canvas.height, 0.01, 100),
	fog_dist: 15,
	viewport_width: window.innerWidth
};

gl.clearColor(0.0, 0.0, 0.0, 1);
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

	Ground.update_chunks(gl, Player);
	Ground.render(gl, uniforms);

	window.requestAnimationFrame(render);
}

window.requestAnimationFrame(render);


window.addEventListener('click', () => {
	canvas.requestPointerLock();
});
