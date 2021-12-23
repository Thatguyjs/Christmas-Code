import Ground from "./ground.mjs";
import Trees from "./tree.mjs";
import Snow from "./snow.mjs";
import Player from "./player.mjs";


const canvas = document.getElementById('cnv');
const gl = canvas.getContext('webgl2');

twgl.resizeCanvasToDisplaySize(canvas);

await Ground.init(gl, {
	seed: Math.random(),
	rows: 80,
	cols: 80,
	spacing: 0.5,
	chunk_pool_size: 9,
	trees_per_chunk: 2,

	height_func: (x, z) => {
		let noise_y = noise.perlin2(x / 20, z / 20) * 2;
		let rand = Math.sin(x ^ (z * 10)) * Math.cos(z ^ (x * 10)) * (0.9 - noise_y) / (12 + Math.max(noise_y, 0));
		return noise_y + rand;
	},

	color_func: (x, z, height) => {
		height = height / 2 * 0.4 + 0.65;
		return [height, height, height, 1.0];
	}
});

await Trees.init(gl, {
	color_func: (part) => {
		if(part === 'trunk') {
			return [0.5, 0.3, 0.2, 1];
		}
		else {
			return [
				Math.random() * 0.1,
				Math.random() * 0.2 + 0.4,
				Math.random() * 0.1 + 0.15,
				1.0
			];
		}
	}
});

await Snow.init(gl, {
	seed: Math.random(),
	particles: 1200,

	y_func: () => {
		return 6.0 + Math.random() * 8.0;
	},

	color_func: () => {
		return [1.0, 1.0, 1.0, 1.0];
	}
});

Player.init();


const uniforms = {
	world_mat: twgl.m4.identity(),
	mv_mat: twgl.m4.identity(),
	proj_mat: twgl.m4.perspective(65 * Math.PI / 180, canvas.width / canvas.height, 0.05, 100),
	fog_dist: 24,
	player_pos: [-Player.pos.z, -Player.pos.x]
};

const ground_uniforms = {
	fog_color: [0, 0.01, 0.04]
};

Snow.gen_particles(uniforms.fog_dist, uniforms.player_pos);

gl.clearColor(...ground_uniforms.fog_color, 1);
gl.enable(gl.DEPTH_TEST);
gl.enable(gl.BLEND);
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

function render() {
	twgl.resizeCanvasToDisplaySize(canvas);
	gl.viewport(0, 0, canvas.width, canvas.height);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	Player.update(Ground.height_at(-Player.pos.z, -Player.pos.x));
	twgl.m4.translation([-Player.pos.z, Player.pos.y, -Player.pos.x], uniforms.mv_mat);
	twgl.m4.rotateY(uniforms.mv_mat, Player.rot.x, uniforms.mv_mat);
	twgl.m4.rotateX(uniforms.mv_mat, Player.rot.y, uniforms.mv_mat);
	twgl.m4.inverse(uniforms.mv_mat, uniforms.mv_mat);

	uniforms.player_pos[0] = -Player.pos.z;
	uniforms.player_pos[1] = -Player.pos.x;

	Ground.update_chunks(gl, Player);
	Ground.render(gl, uniforms, ground_uniforms);

	Trees.render(gl, uniforms, ground_uniforms);

	Snow.update(uniforms.fog_dist, uniforms.player_pos);
	Snow.buffer(gl);
	Snow.render(gl, uniforms);

	window.requestAnimationFrame(render);
}

window.requestAnimationFrame(render);


window.addEventListener('click', () => {
	canvas.requestPointerLock();
});
