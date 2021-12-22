import { shader_array } from "./shader.mjs";
import Seed from "./seed.mjs";


function dist_plane(o1, o2) {
	return Math.sqrt((o1.x - o2.x) ** 2 + (o1.z - o2.z) ** 2);
}


const Ground = {
	program: null,

	seed: 0,
	rows: 0,
	cols: 0,
	spacing: 0,
	height_func: null,
	color_func: null,

	chunk_data: { position: null, color: null, indices: null },
	chunk_positions: { x: [], z: [], length: 0 },
	avail_chunks: [],
	chunk_order: [],
	chunk_pool_size: 0,

	player_chunk: { x: 0, z: 0 },
	last_player_chunk: { x: -1, z: -1 },

	buffers: null,

	async init(gl, { seed, rows, cols, spacing, chunk_pool_size, height_func, color_func }) {
		this.program = twgl.createProgramInfo(gl, await shader_array('shaders/ground'));

		this.seed = seed;
		this.rows = rows + 1;
		this.cols = cols + 1;
		this.spacing = spacing;
		this.height_func = height_func;
		this.color_func = color_func;

		this.chunk_pool_size = chunk_pool_size;
		this.chunk_data.position = new Float32Array(3 * this.rows * this.cols * this.chunk_pool_size);
		this.chunk_data.color = new Float32Array(4 * this.rows * this.cols * this.chunk_pool_size);
		this.chunk_data.indices = new Uint32Array(6 * this.rows * this.cols * this.chunk_pool_size);

		for(let i = 0; i < chunk_pool_size; i++)
			this.avail_chunks.push(i);
	},

	height_at(x, z) {
		Seed.set_seed(this.seed);
		return this.height_func(x, z);
	},

	gen_chunk(x, z, save_index=null) {
		// Make sure the chunk isn't already generated
		if(save_index === null)
			for(let c = 0; c < this.chunk_positions.length; c++)
				if(this.chunk_positions.x[c] === x && this.chunk_positions.z[c] === z)
					return;

		// No chunks available
		if(save_index === null && this.avail_chunks.length === 0)
			return;

		const offset = {
			x: this.cols / 2 * this.spacing + x * (this.cols - 1) * this.spacing,
			z: this.rows / 2 * this.spacing + z * (this.rows - 1) * this.spacing
		};

		const avail_chunk = save_index !== null ? save_index : this.avail_chunks.shift();
		const start_pos = avail_chunk * 3 * this.rows * this.cols;
		const start_col = avail_chunk * 4 * this.rows * this.cols;
		const start_ind = avail_chunk * 6 * this.rows * this.cols;

		Seed.set_seed(this.seed);

		for(let r = 0; r < this.rows; r++) {
			for(let c = 0; c < this.cols; c++) {
				const r_s = r * this.spacing - offset.z;
				const c_s = c * this.spacing - offset.x;
				const y = this.height_func(c_s, r_s);

				const pos_ind = start_pos + c * 3 + r * this.cols * 3;

				this.chunk_data.position[pos_ind] = c_s;
				this.chunk_data.position[pos_ind + 1] = y;
				this.chunk_data.position[pos_ind + 2] = r_s;

				const color = this.color_func(c, r, y);
				const col_ind = start_col + c * 4 + r * this.cols * 4;

				this.chunk_data.color[col_ind] = color[0];
				this.chunk_data.color[col_ind + 1] = color[1];
				this.chunk_data.color[col_ind + 2] = color[2];
				this.chunk_data.color[col_ind + 3] = color[3];

				if(r < this.rows - 1 && c < this.cols - 1) {
					const dat_ind = start_ind + c * 6 + r * this.cols * 6;
					const tri_ind = avail_chunk * this.rows * this.cols + c + r * this.cols;

					this.chunk_data.indices[dat_ind] = tri_ind;
					this.chunk_data.indices[dat_ind + 1] = tri_ind + 1;
					this.chunk_data.indices[dat_ind + 2] = tri_ind + this.cols;

					this.chunk_data.indices[dat_ind + 3] = tri_ind + 1;
					this.chunk_data.indices[dat_ind + 4] = tri_ind + this.cols;
					this.chunk_data.indices[dat_ind + 5] = tri_ind + this.cols + 1;
				}
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

	replace_chunk(index, x, z) {
		this.gen_chunk(x, z, index);
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
			indices: this.chunk_data.indices
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

	render(gl, uniforms, ground_uniforms) {
		gl.useProgram(this.program.program);
		twgl.setUniforms(this.program, uniforms);
		twgl.setUniforms(this.program, ground_uniforms);

		twgl.setBuffersAndAttributes(gl, this.program, this.buffers);
		twgl.drawBufferInfo(gl, gl.TRIANGLES, this.buffers);
	}
};


export default Ground;
