import { shader_array } from "./shader.mjs";


function dist_plane(o1, o2) {
	return Math.sqrt((o1.x - o2.x) ** 2 + (o1.z - o2.z) ** 2);
}


const Ground = {
	program: null,

	rows: 0,
	cols: 0,
	spacing: 0,
	height_func: null,
	color_func: null,

	chunk_data: { position: null, color: null },
	chunk_positions: { x: [], z: [], length: 0 },
	avail_chunks: [],
	chunk_order: [],
	chunk_pool_size: 0,

	player_chunk: { x: 0, z: 0 },
	last_player_chunk: { x: 0, z: 0 },

	buffers: null,

	async init(gl, { rows, cols, spacing, chunk_pool_size, height_func, color_func }) {
		this.program = twgl.createProgramInfo(gl, await shader_array('shaders/color'));

		this.rows = rows;
		this.cols = cols;
		this.spacing = spacing;
		this.height_func = height_func;
		this.color_func = color_func;

		this.chunk_pool_size = chunk_pool_size;
		this.chunk_data.position = new Float32Array(18 * rows * cols * this.chunk_pool_size);
		this.chunk_data.color = new Float32Array(24 * rows * cols * this.chunk_pool_size);

		for(let i = 0; i < chunk_pool_size; i++)
			this.avail_chunks.push(i);

		this.gen_chunk(0, 0);
		this.buffer(gl);
	},

	gen_chunk(x, z, save_index=null) {
		// Make sure the chunk isn't already generated
		if(save_index === null)
			for(let c = 0; c < this.chunk_positions.length; c++)
				if(this.chunk_positions.x[c] === x && this.chunk_positions.z[c] === z)
					return;

		// Remove the last generated chunk if we've reached the limit
		if(save_index === null && this.avail_chunks.length === 0)
			return;

		const offset = {
			x: this.rows / 2 * this.spacing + x * this.rows * this.spacing,
			z: this.cols / 2 * this.spacing + z * this.cols * this.spacing
		};

		const avail_chunk = save_index !== null ? save_index : this.avail_chunks.shift();
		const start_pos = avail_chunk * 18 * this.rows * this.cols;
		const start_col = avail_chunk * 24 * this.rows * this.cols;

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

				const pos_ind = start_pos + r * 18 + c * this.rows * 18;

				this.chunk_data.position[pos_ind] = p1.x;
				this.chunk_data.position[pos_ind + 1] = y1;
				this.chunk_data.position[pos_ind + 2] = p1.z;
				this.chunk_data.position[pos_ind + 3] = p2.x;
				this.chunk_data.position[pos_ind + 4] = y2;
				this.chunk_data.position[pos_ind + 5] = p2.z;
				this.chunk_data.position[pos_ind + 6] = p3.x;
				this.chunk_data.position[pos_ind + 7] = y3;
				this.chunk_data.position[pos_ind + 8] = p3.z;

				this.chunk_data.position[pos_ind + 9] = p2.x;
				this.chunk_data.position[pos_ind + 10] = y2;
				this.chunk_data.position[pos_ind + 11] = p2.z;
				this.chunk_data.position[pos_ind + 12] = p3.x;
				this.chunk_data.position[pos_ind + 13] = y3;
				this.chunk_data.position[pos_ind + 14] = p3.z;
				this.chunk_data.position[pos_ind + 15] = p4.x;
				this.chunk_data.position[pos_ind + 16] = y4;
				this.chunk_data.position[pos_ind + 17] = p4.z;

				const c1 = this.color_func(r, c, y1);
				const c2 = this.color_func(r, c, y2);
				const c3 = this.color_func(r, c, y3);

				const c4 = this.color_func(r, c, y2);
				const c5 = this.color_func(r, c, y3);
				const c6 = this.color_func(r, c, y4);

				const col_ind = start_col + r * 24 + c * this.rows * 24;

				this.chunk_data.color[col_ind] = c1[0];
				this.chunk_data.color[col_ind + 1] = c1[1];
				this.chunk_data.color[col_ind + 2] = c1[2];
				this.chunk_data.color[col_ind + 3] = c1[3];

				this.chunk_data.color[col_ind + 4] = c2[0];
				this.chunk_data.color[col_ind + 5] = c2[1];
				this.chunk_data.color[col_ind + 6] = c2[2];
				this.chunk_data.color[col_ind + 7] = c2[3];

				this.chunk_data.color[col_ind + 8] = c3[0];
				this.chunk_data.color[col_ind + 9] = c3[1];
				this.chunk_data.color[col_ind + 10] = c3[2];
				this.chunk_data.color[col_ind + 11] = c3[3];

				this.chunk_data.color[col_ind + 12] = c4[0];
				this.chunk_data.color[col_ind + 13] = c4[1];
				this.chunk_data.color[col_ind + 14] = c4[2];
				this.chunk_data.color[col_ind + 15] = c4[3];

				this.chunk_data.color[col_ind + 16] = c5[0];
				this.chunk_data.color[col_ind + 17] = c5[1];
				this.chunk_data.color[col_ind + 18] = c5[2];
				this.chunk_data.color[col_ind + 19] = c5[3];

				this.chunk_data.color[col_ind + 20] = c6[0];
				this.chunk_data.color[col_ind + 21] = c6[1];
				this.chunk_data.color[col_ind + 22] = c6[2];
				this.chunk_data.color[col_ind + 23] = c6[3];
			}
		}

		if(!save_index) {
			this.chunk_order.push(avail_chunk);

			this.chunk_positions.x.push(x);
			this.chunk_positions.z.push(z);
			this.chunk_positions.length++;
		}
		else {
			this.chunk_positions.x[save_index] = x;
			this.chunk_positions.z[save_index] = z;
		}
	},

	replace_chunk(index, x, y) {
		this.gen_chunk(x, y, index);
	},

	remove_chunk(index) {
		if(index < 0 || index > this.chunk_order.length) return;
		this.avail_chunks.push(this.chunk_order.splice(index, 1)[0]);

		this.chunk_positions.x.splice(index, 1);
		this.chunk_positions.z.splice(index, 1);
		this.chunk_positions.length--;
	},

	remove_last_chunk() {
		if(this.chunk_order.length === 0) return;
		this.avail_chunks.push(this.chunk_order.shift());

		this.chunk_positions.x.shift();
		this.chunk_positions.z.shift();
		this.chunk_positions.length--;
	},

	remove_furthest_chunk(player) {
		if(this.chunk_order.length === 0) return;

		let furthest = {
			index: 0,
			distance: 0
		};

		for(let i = 0; i < this.chunk_positions.length; i++) {
			const chunk_dist = dist_plane({
				x: this.chunk_positions.x[i],
				z: this.chunk_positions.z[i]
			}, {
				x: player.pos.z / (this.rows * this.spacing),
				z: player.pos.x / (this.cols * this.spacing)
			});

			if(chunk_dist > furthest.distance) {
				furthest.index = i;
				furthest.distance = chunk_dist;
			}
		}

		this.remove_chunk(furthest.index);
	},

	// Generate buffers
	buffer(gl) {
		this.buffers = twgl.createBufferInfoFromArrays(gl, {
			position: { numComponents: 3, data: this.chunk_data.position },
			color: { numComponents: 4, data: this.chunk_data.color },
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
			for(let i = -1; i <= 1; i++) {
				for(let j = -1; j <= 1; j++) {
					this.replace_chunk(i + 1 + (j + 1) * 3, this.player_chunk.x + i, this.player_chunk.z + j);
				}
			}

			this.buffer(gl);
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
