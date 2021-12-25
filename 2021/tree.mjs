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
	outline: [
		[
			0.25, 0,
			0.175, 1.75
		],
		[
			0.7, 0.6,
			0.3, 2.2
		],
		[
			0.65, 1.2,
			0.175, 3.0
		],
		[
			0.545, 1.85,
			0.1, 3.3
		],
		[
			0.435, 2.45,
			0, 3.7
		]
	],

	position: null,
	pos_length: 0,

	color: null,
	col_length: 0,

	indices: null,

	generate() {
		this.position = new Float32Array(3 * this.outline.length * 12);
		this.color = new Float32Array(4 * this.outline.length * 12);
		this.indices = new Uint16Array(3 * this.outline.length * 12);

		const SIXTH_ROT = Math.PI / 3;

		for(let o = 0; o < this.outline.length; o++) {
			for(let i = 0; i < 6; i++) {
				const offset = polar_to_cart(1, i * SIXTH_ROT);

				const pos_ind = o * 36 + i * 6;

				this.position[pos_ind + 0] = this.outline[o][0] * offset.x;
				this.position[pos_ind + 1] = this.outline[o][1];
				this.position[pos_ind + 2] = this.outline[o][0] * offset.y;
				this.position[pos_ind + 3] = this.outline[o][2] * offset.x;
				this.position[pos_ind + 4] = this.outline[o][3];
				this.position[pos_ind + 5] = this.outline[o][2] * offset.y;

				const col_ind = o * 48 + i * 8;

				for(let c = 0; c < 8; c++)
					this.color[col_ind + c] = 1.0;

				const ind_ind = o * 36 + i * 6;
				const o12 = o * 12;
				const i2 = i * 2;

				this.indices[ind_ind + 0] = o12 + i2;
				this.indices[ind_ind + 1] = o12 + i2 + 1;
				this.indices[ind_ind + 2] = o12 + (i2 + 2) % 12;
				this.indices[ind_ind + 3] = o12 + i2 + 1;
				this.indices[ind_ind + 4] = o12 + (i2 + 2) % 12;
				this.indices[ind_ind + 5] = o12 + (i2 + 3) % 12;
			}
		}

		this.pos_length = this.position.length;
		this.col_length = this.color.length;
	}
};


const Trees = {
	program: null,

	count: 0,
	chunks: [], // Chunk locations that already contain trees
	available: [],

	data: {
		position: null,
		color: null,
		indices: null
	},

	color_func: null,

	buffers: null,

	async init(gl, { color_func }) {
		this.program = twgl.createProgramInfo(gl, await shader_array('shaders/foliage'));
		Template.generate();

		this.count = Ground.trees_per_chunk * Ground.chunk_pool_size;

		for(let c = 0; c < this.count; c++)
			this.available.push(c);

		this.data.position = new Float32Array(Template.pos_length * this.count);
		this.data.color = new Float32Array(Template.col_length * this.count);
		this.data.indices = new Uint16Array(Template.indices.length * this.count);

		this.color_func = color_func;
	},

	gen_tree(chunk, x, z) {
		if(this.available.length === 0) return;

		let chunk_index = -1;

		for(let c in this.chunks) {
			if(this.chunks[c].x === chunk.x && this.chunks[c].z === chunk.z) {
				if(this.chunks[c].trees.length === Ground.trees_per_chunk)
					return;

				chunk_index = +c;
				break;
			}
		}

		let index = this.available.pop();

		if(chunk_index === -1)
			this.chunks.push({ x: chunk.x, z: chunk.z, trees: [index] });
		else
			this.chunks[chunk_index].trees.push(index);

		const scale = Math.random() * 0.3 + 1.4;
		const pos_ind = index * Template.pos_length;

		for(let i = 0; i < Template.pos_length; i += 3) {
			this.data.position[pos_ind + i] = Template.position[i] * scale + x;
			this.data.position[pos_ind + i + 1] = Template.position[i + 1] * scale + Ground.height_at(x, z) - 0.15;
			this.data.position[pos_ind + i + 2] = Template.position[i + 2] * scale + z;
		}

		const col_ind = index * Template.col_length;

		for(let i = 0; i < Template.col_length / 4; i++) {
			const col = this.color_func(Template.indices[i * 3] < 12 ? 'trunk' : 'leaves');

			this.data.color[col_ind + i * 4 + 0] = col[0];
			this.data.color[col_ind + i * 4 + 1] = col[1];
			this.data.color[col_ind + i * 4 + 2] = col[2];
			this.data.color[col_ind + i * 4 + 3] = col[3];
		}

		const ind_ind = index * Template.indices.length;
		const ind_offset = index * (Template.pos_length / 3);

		for(let i = 0; i < Template.indices.length; i++)
			this.data.indices[ind_ind + i] = Template.indices[i] + ind_offset;
	},

	free_chunk(x, z) {
		for(let c in this.chunks) {
			if(this.chunks[c].x !== x || this.chunks[c].z !== z)
				continue;

			while(this.chunks[c]?.trees?.length) {
				const ind = this.chunks[c].trees.pop();
				this.available.push(ind);
			}

			this.chunks.splice(+c, 1);
			break;
		}
	},

	buffer(gl) {
		this.buffers = twgl.createBufferInfoFromArrays(gl, {
			position: { numComponents: 3, data: this.data.position },
			color: { numComponents: 4, data: this.data.color },
			indices: this.data.indices
		});
	},

	render(gl, uniforms, ground_uniforms) {
		gl.useProgram(this.program.program);
		twgl.setUniforms(this.program, uniforms);
		twgl.setUniforms(this.program, ground_uniforms);

		twgl.setBuffersAndAttributes(gl, this.program, this.buffers);
		twgl.drawBufferInfo(gl, gl.TRIANGLES, this.buffers);
	}
};


export default Trees;
