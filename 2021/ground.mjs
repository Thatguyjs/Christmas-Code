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

	player_chunk: { x: 0, z: 0 },
	last_player_chunk: { x: 0, z: 0 },

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

	async gen_chunk(x, z) {
		const offset = {
			x: this.rows / 2 * this.spacing + x * this.rows * this.spacing,
			z: this.cols / 2 * this.spacing + z * this.cols * this.spacing
		};

		let chunk = {
			x, z,
			position: new Float32Array(this.rows * this.cols * 18),
			color: new Float32Array(this.rows * this.cols * 24)
		};

		for(let c = 0; c < this.cols; c++) {
			for(let r = 0; r < this.rows; r++) {
				const r_s = r * this.spacing - offset.x;
				const c_s = c * this.spacing - offset.z;

				const y1 = this.height_func(r_s,                c_s);
				const y2 = this.height_func(r_s + this.spacing, c_s);
				const y3 = this.height_func(r_s,                c_s + this.spacing);
				const y4 = this.height_func(r_s + this.spacing, c_s + this.spacing);

				const p1 = { x: r_s,                z: c_s };
				const p2 = { x: r_s + this.spacing, z: c_s };
				const p3 = { x: r_s,                z: c_s + this.spacing };
				const p4 = { x: r_s + this.spacing, z: c_s + this.spacing };

				const pos_ind = r * 18 + c * this.rows * 18;

				chunk.position[pos_ind] = p1.x;
				chunk.position[pos_ind + 1] = y1;
				chunk.position[pos_ind + 2] = p1.z;
				chunk.position[pos_ind + 3] = p2.x;
				chunk.position[pos_ind + 4] = y2;
				chunk.position[pos_ind + 5] = p2.z;
				chunk.position[pos_ind + 6] = p3.x;
				chunk.position[pos_ind + 7] = y3;
				chunk.position[pos_ind + 8] = p3.z;

				chunk.position[pos_ind + 9] = p2.x;
				chunk.position[pos_ind + 10] = y2;
				chunk.position[pos_ind + 11] = p2.z;
				chunk.position[pos_ind + 12] = p3.x;
				chunk.position[pos_ind + 13] = y3;
				chunk.position[pos_ind + 14] = p3.z;
				chunk.position[pos_ind + 15] = p4.x;
				chunk.position[pos_ind + 16] = y4;
				chunk.position[pos_ind + 17] = p4.z;

				const c1 = this.color_func(r, c, y1);
				const c2 = this.color_func(r, c, y2);
				const c3 = this.color_func(r, c, y3);

				const c4 = this.color_func(r, c, y2);
				const c5 = this.color_func(r, c, y3);
				const c6 = this.color_func(r, c, y4);

				const col_ind = r * 24 + c * this.rows * 24;

				chunk.color[col_ind] = c1[0];
				chunk.color[col_ind + 1] = c1[1];
				chunk.color[col_ind + 2] = c1[2];
				chunk.color[col_ind + 3] = c1[3];

				chunk.color[col_ind + 4] = c2[0];
				chunk.color[col_ind + 5] = c2[1];
				chunk.color[col_ind + 6] = c2[2];
				chunk.color[col_ind + 7] = c2[3];

				chunk.color[col_ind + 8] = c3[0];
				chunk.color[col_ind + 9] = c3[1];
				chunk.color[col_ind + 10] = c3[2];
				chunk.color[col_ind + 11] = c3[3];

				chunk.color[col_ind + 12] = c4[0];
				chunk.color[col_ind + 13] = c4[1];
				chunk.color[col_ind + 14] = c4[2];
				chunk.color[col_ind + 15] = c4[3];

				chunk.color[col_ind + 16] = c5[0];
				chunk.color[col_ind + 17] = c5[1];
				chunk.color[col_ind + 18] = c5[2];
				chunk.color[col_ind + 19] = c5[3];

				chunk.color[col_ind + 20] = c6[0];
				chunk.color[col_ind + 21] = c6[1];
				chunk.color[col_ind + 22] = c6[2];
				chunk.color[col_ind + 23] = c6[3];
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

	clear_chunks() {
		let ind = this.chunks.length;

		while(--ind >= 0)
			this.chunks.pop();
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

	// Update which chunks are shown around the player
	update_chunks(gl, player) {
		this.player_chunk = {
			x: Math.round(player.pos.z / (this.rows * this.spacing)),
			z: Math.round(player.pos.x / (this.cols * this.spacing))
		};

		if(this.player_chunk.x !== this.last_player_chunk.x || this.player_chunk.z !== this.last_player_chunk.z) {
			console.time('ChunkGen');
			// this.clear_chunks();

			let is_available = true;

			for(let c in this.chunks)
				if(this.chunks[c].x === this.player_chunk.x && this.chunks[c].z === this.player_chunk.z)
					is_available = false;

			if(is_available) {
				this.gen_chunk(this.player_chunk.x, this.player_chunk.z);
				this.batch();
				this.buffer(gl);
			}
			console.timeEnd('ChunkGen');
		}

		this.last_player_chunk.x = this.player_chunk.x;
		this.last_player_chunk.z = this.player_chunk.z;
	},

	render(gl, uniforms) {
		gl.useProgram(this.program.program);
		twgl.setUniforms(this.program, uniforms);

		twgl.setBuffersAndAttributes(gl, this.program, this.buffers);
		twgl.drawBufferInfo(gl, gl.TRIANGLES, this.buffers);
	}
};


export default Ground;
