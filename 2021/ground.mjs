import { shader_array } from "./shader.mjs";


const Ground = {
	program: null,

	rows: 0,
	cols: 0,
	height_map: null,
	height_func: null,

	position: null,
	color: null,
	indices: null,

	buffers: null,

	async init(gl, { rows, cols, spacing, height_func, color_func }) {
		this.program = twgl.createProgramInfo(gl, await shader_array('shaders/color'));

		this.rows = rows;
		this.cols = cols;
		this.height_map = [];
		this.height_func = height_func;

		const center = {
			x: rows / 2 * spacing,
			z: cols / 2 * spacing
		};

		this.position = []; // new Float32Array(12 * rows * cols);
		this.color = []; // new Float32Array(4 * rows * cols);
		this.indices = [];

		for(let c = 0; c < cols; c++) {
			for(let r = 0; r < rows; r++) {
				const y1 = this.height_func(r, c);
				const y2 = this.height_func(r + 1, c);
				const y3 = this.height_func(r, c + 1);
				const y4 = this.height_func(r + 1, c + 1);

				this.height_map.push(y1);

				const t1 = {
					p1: { x: r * spacing - center.x, y: y1, z: c * spacing - center.z },
					p2: { x: (r + 1) * spacing - center.x, y: y2, z: c * spacing - center.z },
					p3: { x: r * spacing - center.x, y: y3, z: (c + 1) * spacing - center.z }
				};

				const t2 = {
					p1: { x: (r + 1) * spacing - center.x, y: y2, z: c * spacing - center.z },
					p2: { x: r * spacing - center.x, y: y3, z: (c + 1) * spacing - center.z },
					p3: { x: (r + 1) * spacing - center.x, y: y4, z: (c + 1) * spacing - center.z }
				};

				this.position.push(
					t1.p1.x, t1.p1.y, t1.p1.z,
					t1.p2.x, t1.p2.y, t1.p2.z,
					t1.p3.x, t1.p3.y, t1.p3.z,

					t2.p1.x, t2.p1.y, t2.p1.z,
					t2.p2.x, t2.p2.y, t2.p2.z,
					t2.p3.x, t2.p3.y, t2.p3.z
				);

				this.color.push(
					...color_func(r, c, t1.p1.y),
					...color_func(r, c, t1.p2.y),
					...color_func(r, c, t1.p3.y),

					...color_func(r, c, t2.p1.y),
					...color_func(r, c, t2.p2.y),
					...color_func(r, c, t2.p3.y)
				);
			}
		}
	},

	// Calculate the height (y) at a given (x, z) position
	height_at(x, z) {
		// TODO: Interpolate values & account for the center
		x = Math.round(x);
		z = Math.round(z);

		return this.height_map[x + z * this.rows];
	},

	move_by(x, z) {

	},

	update(gl, x, z, vx, vz) {
		// TODO: Use x and z as offsets, apply noise

		// TODO: Update the heightmap
		for(let c = 0; c < this.cols; c++) {
			for(let r = 0; r < this.rows; r++) {
				const y1 = this.height_func(r + x, c + z);
				const y2 = this.height_func(r + x + 1, c + z);
				const y3 = this.height_func(r + x, c + z + 1);
				const y4 = this.height_func(r + x + 1, c + z + 1);

				const ind = r * 18 + c * this.rows * 18;

				this.position[ind + 1] = y1;
				this.position[ind + 4] = y2;
				this.position[ind + 7] = y3;

				this.position[ind + 10] = y2;
				this.position[ind + 13] = y3;
				this.position[ind + 16] = y4;

				// x and z
				this.position[ind] = (this.position[ind] + vx) % 20;
				this.position[ind + 2] = (this.position[ind + 2] + vz) % 20;

				this.position[ind + 3] = (this.position[ind + 3] + vx) % 20;
				this.position[ind + 5] = (this.position[ind + 5] + vz) % 20;

				this.position[ind + 6] = (this.position[ind + 6] + vx) % 20;
				this.position[ind + 8] = (this.position[ind + 8] + vz) % 20;

				this.position[ind + 9] = (this.position[ind + 9] + vx) % 20;
				this.position[ind + 11] = (this.position[ind + 11] + vz) % 20;

				this.position[ind + 12] = (this.position[ind + 12] + vx) % 20;
				this.position[ind + 14] = (this.position[ind + 14] + vz) % 20;

				this.position[ind + 15] = (this.position[ind + 15] + vx) % 20;
				this.position[ind + 17] = (this.position[ind + 17] + vz) % 20;
			}
		}

		this.buffers = twgl.createBufferInfoFromArrays(gl, {
			position: { numComponents: 3, data: this.position },
			color: { numComponents: 4, data: this.color },
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
