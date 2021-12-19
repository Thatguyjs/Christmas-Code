import { shader_array } from "./shader.mjs";


const Snow = {
	program: null,

	particles: 0,
	data: {
		position: null,
		color: null
	},

	ground_heights: null, // Ground height corresponding with each particle position

	y_func: null,
	color_func: null,

	buffers: null,

	async init(gl, { particles, y_func, color_func }) {
		this.program = twgl.createProgramInfo(gl, await shader_array('shaders/snow'));

		this.particles = particles;
		this.data.position = new Float32Array(3 * particles);
		this.data.color = new Float32Array(4 * particles);

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
	},

	gen_particles(fog_dist, player_pos) {
		for(let p = 0; p < this.particles; p++)
			this.gen_particle(p, fog_dist, player_pos);
	},

	buffer(gl) {
		this.buffers = twgl.createBufferInfoFromArrays(gl, {
			position: { numComponents: 3, data: this.data.position },
			color: { numComponents: 4, data: this.data.color }
		});
	},

	update(fog_dist, player_pos) {
		for(let i = 0; i < this.particles; i++) {
			this.data.position[i * 3 + 1] -= 0.01;

			if(player_pos[0] - this.data.position[i * 3] > fog_dist)
				this.data.position[i * 3] += fog_dist * 2;
			else if(this.data.position[i * 3] - player_pos[0] > fog_dist)
				this.data.position[i * 3] -= fog_dist * 2;

			if(player_pos[1] - this.data.position[i * 3 + 2] > fog_dist)
				this.data.position[i * 3 + 2] += fog_dist * 2;
			else if(this.data.position[i * 3 + 2] - player_pos[1] > fog_dist)
				this.data.position[i * 3 + 2] -= fog_dist * 2;

			if(this.data.position[i * 3 + 1] <= 0)
				this.gen_particle(i, fog_dist, player_pos);
		}
	},

	render(gl, uniforms, snow_uniforms) {
		gl.useProgram(this.program.program);
		twgl.setUniforms(this.program, uniforms);
		twgl.setUniforms(this.program, snow_uniforms);

		twgl.setBuffersAndAttributes(gl, this.program, this.buffers);
		twgl.drawBufferInfo(gl, gl.POINTS, this.buffers);
	}
};


export default Snow;
