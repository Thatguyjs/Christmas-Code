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

	// bufferSubData() should be faster than using twgl.createBufferInfoFromArrays()
	update_data(gl) {
		for(let a in this.buffers.attribs) {
			const attrib = this.buffers.attribs[a];
			const target = (a === 'indices') ? gl.ELEMENT_ARRAY_BUFFER : gl.ARRAY_BUFFER;

			let data = this.mesh_data[a];
			if('numComponents' in data)
				data = data.data;

			gl.bindBuffer(target, attrib.buffer);
			gl.bufferSubData(target, 0, data);
		}
	}

	render(gl, mode=gl.TRIANGLES) {
		gl.useProgram(this.program.program);
		twgl.setUniforms(this.program, this.uniforms);
		twgl.setBuffersAndAttributes(gl, this.program, this.buffers);
		twgl.drawBufferInfo(gl, mode, this.buffers);
	}
}


export default Mesh;
