import { create_program, array_template, lerp } from "../util.mjs";
import Mesh from "../mesh.mjs";


function polar_to_cart(angle, radius) {
	return {
		x: Math.cos(angle) * radius,
		y: Math.sin(angle) * radius
	};
}


const RoadMesh = {
	program: null,
	mesh: null,
	arrays: array_template({ position: 3, color: 4, indices: null }),

	async init(gl, uniforms) {
		this.program = await create_program(gl, 'shaders/color');
		this.mesh = new Mesh(this.program, uniforms);

		this.generate_arrays();
		this.mesh.set_data(gl, this.arrays);
	},

	generate_arrays() {
		const angle = Math.random() * 2 * Math.PI;
		const start = polar_to_cart(angle, 10);
		const end = polar_to_cart(angle + Math.PI, 10);

		this.arrays.position.data = new Float32Array([

		]);
	},

	render(gl) {
		this.mesh.render(gl);
	}
};
