import { shader_array } from "./shader.mjs";


const Ground = {
	program: null,

	position: null,
	color: null,
	indices: null,

	buffers: null,

	async init(gl, { rows, cols, spacing, height_func, color_func }) {
		this.program = twgl.createProgramInfo(gl, await shader_array('shaders/color'));

		const center = {
			x: cols / 2 * spacing,
			z: rows / 2 * spacing
		};

		this.position = []; // new Float32Array(12 * rows * cols);
		this.color = []; // new Float32Array(4 * rows * cols);
		this.indices = [];

		for(let c = 0; c < cols; c++) {
			for(let r = 0; r < rows; r++) {
				const y1 = height_func(r, c);
				const y2 = height_func(r + 1, c);
				const y3 = height_func(r, c + 1);
				const y4 = height_func(r + 1, c + 1);

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
					...color_func(r, c, t1.p2.y),

					...color_func(r, c, t2.p1.y),
					...color_func(r, c, t2.p2.y),
					...color_func(r, c, t2.p3.y)
				);
			}
		}
	},

	update(gl, x, z) {
		// TODO: Use x and z as offsets, apply noise

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
