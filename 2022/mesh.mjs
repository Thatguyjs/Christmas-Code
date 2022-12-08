// A generic mesh class


class Mesh {
	constructor(program, uniforms) {
		this.program = program;
		this.uniforms = uniforms;
		this.buffers = {};
		this.mesh_data = {};
	}

	set_data(gl, arrays) {
		this.mesh_data = arrays;
		this.buffers = twgl.createBufferInfoFromArrays(gl, this.mesh_data);
	}

	// TODO: Better way of doing this??
	update_data(gl) {
		this.buffers = twgl.createBufferInfoFromArrays(gl, this.mesh_data);
	}

	render(gl, mode=gl.TRIANGLES) {
		gl.useProgram(this.program.program);
		twgl.setUniforms(this.program, this.uniforms);
		twgl.setBuffersAndAttributes(gl, this.program, this.buffers);
		twgl.drawBufferInfo(gl, mode, this.buffers);
	}
}


export default Mesh;
