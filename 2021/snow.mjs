import { shader_array } from "./shader.mjs";
import Seed from "./seed.mjs";
import Ground from "./ground.mjs";


function constrain(value, min, max) {
	if(value < min) return min;
	if(value > max) return max;
	return value;
}


const Snow = {
	program: null,

	seed: 0,
	particles: 0,
	data: {
		position: null,
		color: null,
		age: null
	},

	time: 0,

	y_func: null,
	color_func: null,

	buffers: null,

	async init(gl, { seed, particles, y_func, color_func }) {
		this.program = twgl.createProgramInfo(gl, await shader_array('shaders/snow'));

		this.seed = seed;
		this.particles = particles;
		this.data.position = new Float32Array(3 * particles);
		this.data.color = new Float32Array(4 * particles);
		this.data.age = new Float32Array(particles);

		this.y_func = y_func;
		this.color_func = color_func;
	},

	gen_particle(index, fog_dist, player_pos) {
		if(index < 0 || index >= this.particles) return;

		this.data.position[index * 3] = (Math.random() * 2 - 1) * fog_dist + player_pos[0];
		this.data.position[index * 3 + 2] = (Math.random() * 2 - 1) * fog_dist + player_pos[1];

		this.data.position[index * 3 + 1] = this.y_func(
			this.data.position[index * 3],
			this.data.position[index * 3 + 2]
		);

		const color = this.color_func(
			this.data.position[index * 3],
			this.data.position[index * 3 + 1],
			this.data.position[index * 3 + 2]
		);

		this.data.color[index * 4] = color[0];
		this.data.color[index * 4 + 1] = color[1];
		this.data.color[index * 4 + 2] = color[2];
		this.data.color[index * 4 + 3] = color[3];

		this.data.age[index] = 0;
	},

	gen_particles(fog_dist, player_pos) {
		for(let p = 0; p < this.particles; p++)
			this.gen_particle(p, fog_dist, player_pos);
	},

	buffer(gl) {
		this.buffers = twgl.createBufferInfoFromArrays(gl, {
			position: { numComponents: 3, data: this.data.position },
			color: { numComponents: 4, data: this.data.color },
			age: { numComponents: 1, data: this.data.age }
		});
	},

	update(fog_dist, player_pos) {
		this.time++;
		Seed.set_seed(this.seed);

		for(let i = 0; i < this.particles; i++) {
			this.data.age[i]++;

			let x = this.data.position[i * 3];
			let y = this.data.position[i * 3 + 1];
			let z = this.data.position[i * 3 + 2];

			let angle = noise.perlin3(x, y / 50, z) * Math.PI * 2;

			this.data.position[i * 3] += Math.cos(angle) / 150;
			this.data.position[i * 3 + 1] -= 0.01;
			this.data.position[i * 3 + 2] += Math.sin(angle) / 150;

			x = this.data.position[i * 3];
			y = this.data.position[i * 3 + 1];
			z = this.data.position[i * 3 + 2];

			if(player_pos[0] - x > fog_dist) {
				this.data.position[i * 3] += fog_dist * 2;
				this.data.age[i] = 0;
			}
			else if(x - player_pos[0] > fog_dist) {
				this.data.position[i * 3] -= fog_dist * 2;
				this.data.age[i] = 0;
			}

			if(player_pos[1] - z > fog_dist) {
				this.data.position[i * 3 + 2] += fog_dist * 2;
				this.data.age[i] = 0;
			}
			else if(z - player_pos[1] > fog_dist) {
				this.data.position[i * 3 + 2] -= fog_dist * 2;
				this.data.age[i] = 0;
			}

			if(y <= Ground.height_at(x, z))
				this.gen_particle(i, fog_dist, player_pos);
		}
	},

	render(gl, uniforms) {
		gl.useProgram(this.program.program);
		twgl.setUniforms(this.program, uniforms);

		twgl.setBuffersAndAttributes(gl, this.program, this.buffers);
		twgl.drawBufferInfo(gl, gl.POINTS, this.buffers);
	}
};


export default Snow;
