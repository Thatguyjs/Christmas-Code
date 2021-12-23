import { shader_array } from "./shader.mjs";
import Seed from "./seed.mjs";
import Trees from "./tree.mjs";


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

	trees_per_chunk: 0,

	chunk_data: { position: null, color: null, indices: null },
	chunk_positions: { x: [], z: [], length: 0 },
	avail_chunks: [],
	chunk_order: [],
	chunk_pool_size: 0,

	player_chunk: { x: 0, z: 0 },
	last_player_chunk: { x: 0, z: -1 },

	buffers: null,

	async init(gl, { seed, rows, cols, spacing, chunk_pool_size, height_func, color_func, trees_per_chunk }) {
		this.program = twgl.createProgramInfo(gl, await shader_array('shaders/ground'));

		this.seed = seed;
		this.rows = rows + 1;
		this.cols = cols + 1;
		this.spacing = spacing;
		this.height_func = height_func;
		this.color_func = color_func;

		this.trees_per_chunk = trees_per_chunk;

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

	gen_chunk(x, z, save_index) {
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

		for(let t = 0; t < this.trees_per_chunk; t++) {
			const tree_pos = {
				x: Math.random() * this.cols * this.spacing - offset.x,
				z: Math.random() * this.rows * this.spacing - offset.z
			};

			Trees.gen_tree({ x, z }, tree_pos.x, tree_pos.z);
		}

		this.chunk_positions.x[save_index] = x;
		this.chunk_positions.z[save_index] = z;
	},

	replace_chunk(index, x, z) {
		this.gen_chunk(x, z, index);
	},

	// Update which chunks are shown around the player
	update_chunks(gl, player) {
		this.player_chunk = {
			x: Math.round(player.pos.z / (this.rows * this.spacing)),
			z: Math.round(player.pos.x / (this.cols * this.spacing))
		};

		if(this.player_chunk.x !== this.last_player_chunk.x || this.player_chunk.z !== this.last_player_chunk.z) {
			let dir = { x: this.player_chunk.x - this.last_player_chunk.x, z: this.player_chunk.z - this.last_player_chunk.z };

			if(dir.x !== 0) {
				for(let z = -1; z <= 1; z++)
					Trees.free_chunk(this.last_player_chunk.x - dir.x, this.player_chunk.z + z);
			}
			else if(dir.z !== 0) {
				for(let x = -1; x <= 1; x++)
					Trees.free_chunk(this.player_chunk.x + x, this.last_player_chunk.z - dir.z);
			}

			for(let i = -1; i <= 1; i++) {
				for(let j = -1; j <= 1; j++) {
					this.replace_chunk(i + 1 + (j + 1) * 3, this.player_chunk.x + i, this.player_chunk.z + j);
				}
			}

			this.buffer(gl);
			Trees.buffer(gl);
		}

		this.last_player_chunk.x = this.player_chunk.x;
		this.last_player_chunk.z = this.player_chunk.z;
	},

	// Generate buffers
	buffer(gl) {
		this.buffers = twgl.createBufferInfoFromArrays(gl, {
			position: { numComponents: 3, data: this.chunk_data.position },
			color: { numComponents: 4, data: this.chunk_data.color },
			indices: this.chunk_data.indices
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


export default Ground;
