import { create_program, array_template } from "../util.mjs";
import Mesh from "../mesh.mjs";


const GroundMesh = {
	program: null,
	mesh: null,
	arrays: array_template({ position: 3, color: 4, indices: null }),

	async init(gl, uniforms) {
		this.program = await create_program(gl, 'shaders/color');
		this.mesh = new Mesh(this.program, uniforms);

		this.generate_arrays();
		this.mesh.set_data(gl, this.arrays);
	},

	// Generate the actual mesh data
	generate_arrays() {
		this.arrays.position.data = new Float32Array(3 * 9 * 9);
		this.arrays.color.data = new Float32Array(4 * 9 * 9);
		this.arrays.indices = new Uint16Array(6 * 8 * 8);

		for(let x = 0; x <= 8; x++) {
			for(let z = 0; z <= 8; z++) {
				this.arrays.position.data[x * 3 + z * 3 * 9 + 0] = x;
				this.arrays.position.data[x * 3 + z * 3 * 9 + 1] = Math.random();
				this.arrays.position.data[x * 3 + z * 3 * 9 + 2] = z;

				this.arrays.color.data[x * 4 + z * 4 * 9 + 0] = Math.random();
				this.arrays.color.data[x * 4 + z * 4 * 9 + 1] = Math.random();
				this.arrays.color.data[x * 4 + z * 4 * 9 + 2] = Math.random();
				this.arrays.color.data[x * 4 + z * 4 * 9 + 3] = 1;

				if(x < 8 && z < 8) {
					this.arrays.indices[x * 6 + z * 6 * 8 + 0] = x + z * 9;
					this.arrays.indices[x * 6 + z * 6 * 8 + 1] = (x + 1) + z * 9;
					this.arrays.indices[x * 6 + z * 6 * 8 + 2] = x + (z + 1) * 9;
					this.arrays.indices[x * 6 + z * 6 * 8 + 3] = (x + 1) + z * 9;
					this.arrays.indices[x * 6 + z * 6 * 8 + 4] = x + (z + 1) * 9;
					this.arrays.indices[x * 6 + z * 6 * 8 + 5] = (x + 1) + (z + 1) * 9;
				}
			}
		}

		console.log(this.arrays);
	},

	render(gl) {
		this.mesh.render(gl);
	}
};


export default GroundMesh;
