import { shader_array } from "./shader.mjs";


const Ground = {
	program: null,

	position: null,
	color: null,
	indices: null,

	buffers: null,

	async init(gl, rows, cols, spacing) {
		this.program = twgl.createProgramInfo(gl, await shader_array('shaders/color'));

		const center = {
			x: cols / 2,
			z: rows / 2
		};

		this.position = []; // new Float32Array(12 * rows * cols);
		this.color = []; // new Float32Array(4 * rows * cols);
		this.indices = [];

		/*
		for(let c = 0; c < cols; c++) {
			for(let r = 0; r < rows; r++) {
				const t1 = {
					p1: { x: r - center.x, y: 0.0, z: c - center.z },
					p2: { x: (r + 1) - center.x, y: 0.0, z: c - center.z },
					p3: { x: r - center.x, y: 0.0, z: (c + 1) - center.z }
				};

				const t2 = {
					p1: { x: (r + 1) - center.x, y: 0.0, z: c - center.z },
					p2: { x: r - center.x, y: 0.0, z: (c + 1) - center.z },
					p3: { x: (r + 1) - center.x, y: 0.0, z: (c + 1) - center.z }
				};

				this.position.push(
					t1.p1.x, t1.p1.z, t1.p1.y,
					t1.p2.x, t1.p2.z, t1.p2.y,
					t1.p3.x, t1.p3.z, t1.p3.y,

					t2.p1.x, t2.p1.z, t2.p1.y,
					t2.p2.x, t2.p2.z, t2.p2.y,
					t2.p3.x, t2.p3.z, t2.p3.y
				);

				this.color.push(
					Math.random(), Math.random(), Math.random(), 1.0,
					Math.random(), Math.random(), Math.random(), 1.0,
					Math.random(), Math.random(), Math.random(), 1.0,

					Math.random(), Math.random(), Math.random(), 1.0,
					Math.random(), Math.random(), Math.random(), 1.0,
					Math.random(), Math.random(), Math.random(), 1.0
				);
			}
		}
		*/

		this.position = new Float32Array([
			-0.5,  0.5,  0.5, // Front
			 0.5,  0.5,  0.5,
			-0.5,  0.5, -0.5,
			 0.5,  0.5, -0.5,

			-0.5, -0.5,  0.5, // Back
			 0.5, -0.5,  0.5,
			-0.5, -0.5, -0.5,
			 0.5, -0.5, -0.5
		]);

		this.color = new Float32Array(8 * 4);

		for(let i = 0; i < this.color.length; i += 4) {
			this.color[i] = Math.random();
			this.color[i + 1] = Math.random();
			this.color[i + 2] = Math.random();
			this.color[i + 3] = 1;
		}

		this.indices = [
			0, 1, 2, // Front
			1, 2, 3,

			4, 5, 6, // Back
			5, 6, 7,

			0, 1, 5, // Top
			0, 4, 5,

			2, 3, 7, // Bottom
			2, 6, 7,

			0, 2, 6, // Left
			0, 4, 6,

			1, 3, 7, // Right
			1, 5, 7
		];
	},

	update(gl, x, z) {
		// TODO: Use x and z as offsets, apply noise

		this.buffers = twgl.createBufferInfoFromArrays(gl, {
			position: { numComponents: 3, data: this.position },
			color: { numComponents: 4, data: this.color },
			indices: this.indices
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
