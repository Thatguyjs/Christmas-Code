import { shader_array } from "./shader.mjs";
import Ground from "./ground.mjs";


function polar_to_cart(radius, radians) {
	return {
		x: Math.cos(radians) * radius,
		y: Math.sin(radians) * radius
	};
}


const Template = {
	// [dist, y]
	trunk_side: new Float32Array([
		0.3, 0,
		0.3, 1
	]),

	position: [],
	pos_length: 0,

	color: [],
	col_length: 0,

	indices: [],

	generate() {
		const SIXTH_ROT = Math.PI / 3;

		for(let i = 0; i < 6; i++) {
			const offset = polar_to_cart(1, i * SIXTH_ROT);

			for(let t = 0; t < this.trunk_side.length; t += 2) {
				this.position.push(
					this.trunk_side[t] * offset.x,
					this.trunk_side[t + 1],
					this.trunk_side[t] * offset.y
				);

				this.color.push(
					Math.random(),
					Math.random(),
					Math.random(),
					1.0
				);
			}

			this.indices.push(
				i * 2, i * 2 + 1, (i * 2 + 2) % 12,
				i * 2 + 1, (i * 2 + 2) % 12, (i * 2 + 3) % 12
			);
		}

		console.log(this.indices);

		this.pos_length = this.position.length;
		this.col_length = this.color.length;
	}
};


const Trees = {
	program: null,

	count: 0,
	data: {
		position: null,
		color: null,
		indices: null
	},

	color_func: null,

	buffers: null,

	async init(gl, { tree_count, color_func }) {
		this.program = twgl.createProgramInfo(gl, await shader_array('shaders/tree'));
		Template.generate();

		this.count = tree_count;
		this.data.position = new Float32Array(Template.pos_length * tree_count);
		this.data.color = new Float32Array(Template.col_length * tree_count);
		this.data.indices = new Uint16Array(Template.indices.length * tree_count);

		this.color_func = color_func;
	},

	gen_tree(index) {
		if(index < 0 || index >= this.tree_count) return;

		const offset = index * Template.pos_length;

		for(let i = 0; i < Template.pos_length / 3; i++) {
			this.data.position[offset + i * 3] = Template.position[i * 3];
			this.data.position[offset + i * 3 + 1] = Template.position[i * 3 + 1];
			this.data.position[offset + i * 3 + 2] = Template.position[i * 3 + 2] - 5;
		}

		this.data.color.set(Template.color, index * Template.col_length);
		this.data.indices.set(Template.indices, index * Template.indices.length);
	},

	buffer(gl) {
		this.buffers = twgl.createBufferInfoFromArrays(gl, {
			position: { numComponents: 3, data: this.data.position },
			color: { numComponents: 4, data: this.data.color },
			indices: this.data.indices
		});
	},

	render(gl, uniforms) {
		gl.useProgram(this.program.program);
		twgl.setUniforms(this.program, uniforms);

		twgl.setBuffersAndAttributes(gl, this.program, this.buffers);
		twgl.drawBufferInfo(gl, gl.TRIANGLES, this.buffers);
	}
};


export default Trees;
