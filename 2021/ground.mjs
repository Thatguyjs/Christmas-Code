import { shader_array } from "./shader.mjs";


const Ground = {
	program: null,

	rows: 0,
	cols: 0,
	spacing: 0,
	height_func: null,
	color_func: null,

	chunks: [],
	batch_pos: { length: 0, data: null },
	batch_color: { length: 0, data: null },

	buffers: null,

	async init(gl, { rows, cols, spacing, height_func, color_func }) {
		this.program = twgl.createProgramInfo(gl, await shader_array('shaders/color'));

		this.rows = rows;
		this.cols = cols;
		this.spacing = spacing;
		this.height_func = height_func;
		this.color_func = color_func;

		this.gen_chunk(0, 0);
		this.batch();
		this.buffer(gl);
	},

	gen_chunk(x, z) {
		const offset = {
			x: this.rows / 2 * this.spacing + x * this.rows * this.spacing,
			z: this.cols / 2 * this.spacing + z * this.cols * this.spacing
		};

		let chunk = { position: [], color: [] };

		for(let c = 0; c < this.cols; c++) {
			for(let r = 0; r < this.rows; r++) {
				const r_s = r * this.spacing;
				const c_s = c * this.spacing;

				const y1 = this.height_func(r_s - offset.x,                c_s - offset.z);
				const y2 = this.height_func(r_s - offset.x + this.spacing, c_s - offset.z);
				const y3 = this.height_func(r_s - offset.x,                c_s - offset.z + this.spacing);
				const y4 = this.height_func(r_s - offset.x + this.spacing, c_s - offset.z + this.spacing);

				const t1 = {
					p1: { x: r * this.spacing - offset.x, y: y1, z: c * this.spacing - offset.z },
					p2: { x: (r + 1) * this.spacing - offset.x, y: y2, z: c * this.spacing - offset.z },
					p3: { x: r * this.spacing - offset.x, y: y3, z: (c + 1) * this.spacing - offset.z }
				};

				const t2 = {
					p1: { x: (r + 1) * this.spacing - offset.x, y: y2, z: c * this.spacing - offset.z },
					p2: { x: r * this.spacing - offset.x, y: y3, z: (c + 1) * this.spacing - offset.z },
					p3: { x: (r + 1) * this.spacing - offset.x, y: y4, z: (c + 1) * this.spacing - offset.z }
				};

				chunk.position.push(
					t1.p1.x, t1.p1.y, t1.p1.z,
					t1.p2.x, t1.p2.y, t1.p2.z,
					t1.p3.x, t1.p3.y, t1.p3.z,

					t2.p1.x, t2.p1.y, t2.p1.z,
					t2.p2.x, t2.p2.y, t2.p2.z,
					t2.p3.x, t2.p3.y, t2.p3.z
				);

				chunk.color.push(
					...this.color_func(r, c, t1.p1.y),
					...this.color_func(r, c, t1.p2.y),
					...this.color_func(r, c, t1.p3.y),

					...this.color_func(r, c, t2.p1.y),
					...this.color_func(r, c, t2.p2.y),
					...this.color_func(r, c, t2.p3.y)
				);
			}
		}

		this.batch_pos.length += chunk.position.length;
		this.batch_color.length += chunk.color.length;
		this.chunks.push(chunk);
	},

	remove_chunk(index) {
		if(index < 0 || index >= this.chunks.length)
			throw new RangeError(`Invalid chunk index: ${index}`);

		this.batch_pos.length -= this.chunks[index].position.length;
		this.batch_color.length -= this.chunks[index].color.length;
		this.chunks[index] = null;
	},

	// Batch chunks
	batch() {
		this.batch_pos.data = new Float32Array(this.batch_pos.length);
		this.batch_color.data = new Float32Array(this.batch_color.length);

		let pos_offset = 0;
		let col_offset = 0;

		for(let c in this.chunks) {
			if(this.chunks[c] === null) continue;

			this.batch_pos.data.set(this.chunks[c].position, pos_offset);
			this.batch_color.data.set(this.chunks[c].color, col_offset);

			pos_offset += this.chunks[c].position.length;
			col_offset += this.chunks[c].color.length;
		}
	},

	// Generate buffers
	buffer(gl) {
		// TODO: Use x and z as offsets, apply noise
		this.buffers = twgl.createBufferInfoFromArrays(gl, {
			position: { numComponents: 3, data: this.batch_pos.data },
			color: { numComponents: 4, data: this.batch_color.data },
			// indices: this.indices
		});
	},

	render(gl, uniforms) {
		gl.useProgram(this.program.program);
		twgl.setUniforms(this.program, uniforms);

		twgl.setBuffersAndAttributes(gl, this.program, this.buffers);
		twgl.drawBufferInfo(gl, gl.TRIANGLES, this.buffers);
	}
};


export default Ground;
