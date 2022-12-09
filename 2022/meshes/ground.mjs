import { create_program, array_template } from "../util.mjs";
import Mesh from "../mesh.mjs";


const GroundMesh = {
	program: null,
	mesh: null,
	arrays: array_template({ position: 3, color: 4 }),

	async init(gl, uniforms) {
		this.program = await create_program(gl, 'shaders/color');
		this.mesh = new Mesh(this.program, uniforms);

		this.generate_arrays();
		this.mesh.set_data(gl, this.arrays);
	},

	// Generate the actual mesh data
	generate_arrays() {
		this.arrays.position.data = new Float32Array([
			-1, 1, 0,
			1, 1, 0,
			0, -1, 0
		]);

		this.arrays.color.data = new Float32Array([
			1, 0, 0, 1,
			0, 1, 0, 1,
			0, 0, 1, 1
		]);
	},

	render(gl) {
		this.mesh.render(gl);
	}
};


export default GroundMesh;
