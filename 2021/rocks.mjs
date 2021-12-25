import { shader_array } from "./shader.mjs";
import Ground from "./ground.mjs";


// h is the horizontal angle, v is the vertical angle
function polar_to_cart(radius, angle) {
	return {
		x: Math.cos(angle) * radius,
		y: Math.sin(angle) * radius
	};
}


function rotate_vertex(data, index, y_angle, z_angle) {
	let px = data[index];
	const py = data[index + 1];
	let pz = data[index + 2];

	const rot_y = polar_to_cart(1, y_angle);
	const rot_z = polar_to_cart(1, z_angle);

	data[index] = px * rot_y.x - pz * rot_y.y;
	data[index + 2] = px * rot_y.y + pz * rot_y.x;

	px = data[index];

	data[index] = px * rot_z.x - py * rot_z.y;
	data[index + 1] = px * rot_z.y + py * rot_z.x;
}


const Template = {
	position: new Float32Array([
		// Top
		-1,  1, -1,
		 1,  1, -1,
		-1,  1,  1,
		 1,  1,  1,

		// Bottom
		-1,  -1, -1,
		 1,  -1, -1,
		-1,  -1,  1,
		 1,  -1,  1
	]),

	color: new Float32Array(8 * 4),

	indices: new Uint16Array([
		// Top
		0, 1, 2,
		1, 2, 3,

		// Bottom
		4, 5, 6,
		5, 6, 7,

		// Front
		2, 3, 6,
		3, 6, 7,

		// Back
		0, 1, 4,
		1, 4, 5,

		// Left
		0, 2, 4,
		2, 4, 6,

		// Right
		1, 3, 5,
		3, 5, 7
	])
};


const Rocks = {
	program: null,

	count: 0, // # of rock groups
	group_size: 0,
	chunks: [], // Chunk locations that already contain rocks
	available: [],

	data: {
		position: null,
		color: null,
		indices: null
	},

	color_func: null,

	buffers: null,

	async init(gl, { group_size, color_func }) {
		this.program = twgl.createProgramInfo(gl, await shader_array('shaders/foliage'));

		this.count = Ground.rocks_per_chunk * Ground.chunk_pool_size;
		this.group_size = group_size;

		for(let c = 0; c < this.count; c++)
			this.available.push(c);

		this.data.position = new Float32Array(Template.position.length * this.count * group_size);
		this.data.color = new Float32Array(Template.color.length * this.count * group_size);
		this.data.indices = new Uint16Array(Template.indices.length * this.count * group_size);

		this.color_func = color_func;
	},

	gen_group(chunk, x, z) {
		if(this.available.length === 0) return;

		let chunk_index = -1;

		for(let c in this.chunks) {
			if(this.chunks[c].x === chunk.x && this.chunks[c].z === chunk.z) {
				if(this.chunks[c].groups.length === Ground.rocks_per_chunk)
					return;

				chunk_index = +c;
				break;
			}
		}

		let index = this.available.pop();

		if(chunk_index === -1)
			this.chunks.push({ x: chunk.x, z: chunk.z, groups: [index] });
		else
			this.chunks[chunk_index].groups.push(index);

		const pos_len = Template.position.length;
		const col_len = Template.color.length;
		const ind_len = Template.indices.length;

		for(let g = 0; g < this.group_size; g++) {
			const pos_ind = index * pos_len * this.group_size + (g * pos_len);

			const scale = 0.1 + Math.random() * 0.1;
			const x_angle = Math.random() * Math.PI * 2;
			const y_angle = Math.random() * Math.PI * 2;
			const offset = { x: Math.random() * 4, z: Math.random() * 4 };

			for(let i = 0; i < pos_len; i += 3) {
				const px = Template.position[i] * scale;
				const py = Template.position[i + 1] * scale;
				const pz = Template.position[i + 2] * scale;

				this.data.position[pos_ind + i] = px;
				this.data.position[pos_ind + i + 1] = py;
				this.data.position[pos_ind + i + 2] = pz;

				rotate_vertex(this.data.position, pos_ind + i, x_angle, y_angle);

				this.data.position[pos_ind + i] += x + offset.x;
				this.data.position[pos_ind + i + 1] += Ground.height_at(x + offset.x, z + offset.z);
				this.data.position[pos_ind + i + 2] += z + offset.z;
			}

			const col_ind = index * col_len * this.group_size + (g * col_len);

			for(let i = 0; i < col_len; i += 4) {
				const col = this.color_func();

				this.data.color[col_ind + i + 0] = col[0];
				this.data.color[col_ind + i + 1] = col[1];
				this.data.color[col_ind + i + 2] = col[2];
				this.data.color[col_ind + i + 3] = col[3];
			}

			const ind_ind = index * ind_len * this.group_size + (g * ind_len);
			const ind_offset = index * 8 * this.group_size + (g * 8);

			for(let i = 0; i < ind_len; i++)
				this.data.indices[ind_ind + i] = Template.indices[i] + ind_offset;
		}
	},

	free_chunk(x, z) {
		for(let c in this.chunks) {
			if(this.chunks[c].x !== x || this.chunks[c].z !== z)
				continue;

			while(this.chunks[c]?.groups?.length) {
				const ind = this.chunks[c].groups.pop();
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


export default Rocks;
