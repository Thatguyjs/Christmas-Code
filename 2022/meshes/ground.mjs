import { create_program, array_template, lerp } from "../util.mjs";
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

	height_at(x, z) {
		return Math.random();
	},

	// Generate the actual mesh data
	generate_arrays() {
		const rows = 100, cols = 100;
		const row_v = rows + 1,
			  col_v = cols + 1;

		this.arrays.position.data = new Float32Array(3 * row_v * col_v);
		this.arrays.color.data = new Float32Array(4 * row_v * col_v);
		this.arrays.indices = new Uint32Array(6 * rows * cols);

		for(let x = 0; x <= cols; x++) {
			for(let z = 0; z <= rows; z++) {
				this.arrays.position.data[x * 3 + z * 3 * col_v + 0] = x;
				this.arrays.position.data[x * 3 + z * 3 * col_v + 1] = this.height_at(x, z);
				this.arrays.position.data[x * 3 + z * 3 * col_v + 2] = z;

				this.arrays.color.data[x * 4 + z * 4 * col_v + 0] = Math.random();
				this.arrays.color.data[x * 4 + z * 4 * col_v + 1] = Math.random();
				this.arrays.color.data[x * 4 + z * 4 * col_v + 2] = Math.random();
				this.arrays.color.data[x * 4 + z * 4 * col_v + 3] = 1;

				if(x < cols && z < rows) {
					this.arrays.indices[x * 6 + z * 6 * cols + 0] = x + z * col_v;
					this.arrays.indices[x * 6 + z * 6 * cols + 1] = (x + 1) + z * col_v;
					this.arrays.indices[x * 6 + z * 6 * cols + 2] = x + (z + 1) * col_v;
					this.arrays.indices[x * 6 + z * 6 * cols + 3] = (x + 1) + z * col_v;
					this.arrays.indices[x * 6 + z * 6 * cols + 4] = x + (z + 1) * col_v;
					this.arrays.indices[x * 6 + z * 6 * cols + 5] = (x + 1) + (z + 1) * col_v;
				}
			}
		}

		// console.log(this.arrays);
	},

	render(gl) {
		this.mesh.render(gl);
	}
};


export default GroundMesh;
