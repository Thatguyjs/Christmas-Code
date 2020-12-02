// A small collection of WebGL-related helper code


const Gfx = {

	// Log errors
	throw: function(error, message) {
		console.error(error + ':', message);
	},


	// Load shaders into a new GL program
	createProgram: async function(gl, shaders) {
		let vertexSource = "";
		let fragmentSource = "";

		// Get the shader sources
		let fileRes = await fetch(shaders.vertex);
		if(fileRes.ok) vertexSource = await fileRes.text();

		fileRes = await fetch(shaders.fragment);
		if(fileRes.ok) fragmentSource = await fileRes.text();

		// Compile shaders
		let vertexShader = this.loadShader(gl, gl.VERTEX_SHADER, vertexSource);
		let fragmentShader = this.loadShader(gl, gl.FRAGMENT_SHADER, fragmentSource);

		// Link into a new program
		const program = gl.createProgram();
		gl.attachShader(program, vertexShader);
		gl.attachShader(program, fragmentShader);
		gl.linkProgram(program);

		// Catch errors
		if(!gl.getProgramParameter(program, gl.LINK_STATUS)) {
			this.throw(
				"LoadError",
				"Unable to initialize the shader program: " + gl.getProgramInfoLog(program)
			);
			return null;
		}

		return program;
	},


	// Load and compile a shader
	loadShader: function(gl, type, source) {
		const shader = gl.createShader(type);

		// Load source & compile
		gl.shaderSource(shader, source);
		gl.compileShader(shader);

		// Catch errors
		if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
			gl.deleteShader(shader);
			this.throw(
				"CompileError",
				"Unable to compile shaders: " + gl.getShaderInfoLog(shader)
			);
			return null;
		}

		return shader;
	},


	// Create a buffer
	createBuffer: function(gl, type, data=null, drawMode) {
		const buffer = gl.createBuffer();

		gl.bindBuffer(type, buffer);
		if(data !== null) gl.bufferData(type, data, drawMode);

		return buffer;
	},


	// Modify buffer data
	updateBuffer: function(gl, type, buffer, source, offset) {
		if(buffer !== null) gl.bindBuffer(type, buffer);
		gl.bufferSubData(type, offset, source);
	}

};
