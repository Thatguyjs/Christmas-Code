import { shader_source } from "./shader.mjs";


const Ground = {
	program: null,

	position: new Float32Array(64 * 3), // 8x8
	color: new Float32Array(64 * 4), // rgba

	init(gl, size) {
		size /= 8;

		this.program = twgl.createProgramInfo(gl, shader_array('shaders/color'));

		for(let x = 0; x < 8; x++) {
			for(let z = 0; z < 8; z++) {
				const ind = x * 3 + z * 12;
				this.position[ind] = (x - 4) * size;
				this.position[ind + 1] = 0;
				this.position[ind + 2] = (z - 4) * size;

				const col_ind = x * 4 + z * 16;
				this.color[col_ind] = Math.random();
				this.color[col_ind + 1] = Math.random();
				this.color[col_ind + 2] = Math.random();
				this.color[col_ind + 3] = 1;
			}
		}
	},

	render(gl) {

	}
};


export default Ground;
