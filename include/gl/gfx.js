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
	},


	// 2D texture class
	Texture2D: class {

		#gl = null;
		#texture = null;

		#image = null;
		#format = null;
		#dataType = null;

		#positions = null;
		#coords = null;

		#imageLoaded = false;
		#imageCallback = null;


		// Load image data
		#loadImage() {
			this.#gl.bindTexture(this.#gl.TEXTURE_2D, this.#texture);
			this.#gl.texImage2D(
				this.#gl.TEXTURE_2D,
				0,
				this.#format, this.#format,
				this.#dataType,
				this.#image
			);

			this.#gl.generateMipmap(this.#gl.TEXTURE_2D);

			this.#imageLoaded = true;
			if(this.#imageCallback) this.#imageCallback();
		}


		constructor(gl, drawType, index, colorFormat, dataType, url) {
			this.#gl = gl;

			// Positions & coordinates
			this.#positions = Gfx.createBuffer(
				gl,
				gl.ARRAY_BUFFER,
				new Float32Array([
					-1, -1, -1,
					1, -1, -1,
					-1, 1, -1,

					1, -1, -1,
					-1, 1, -1,
					1, 1, -1
				]),
				drawType
			);

			this.#coords = Gfx.createBuffer(
				gl,
				gl.ARRAY_BUFFER,
				new Float32Array([
					0, 1,
					1, 1,
					0, 0,

					1, 1,
					0, 0,
					1, 0
				]),
				drawType
			);

			// Initialize the texture
			this.#texture = gl.createTexture();
			gl.activeTexture(index);
			gl.bindTexture(gl.TEXTURE_2D, this.#texture);

			// Set pixel to avoid rendering issues if the image isn't loaded
			gl.texImage2D(
				gl.TEXTURE_2D,
				0,
				gl.RGBA,
				1, 1, 0,
				gl.RGBA,
				gl.UNSIGNED_BYTE,
				new Uint8Array([0, 0, 0, 0])
			);

			// Load the image
			this.#format = colorFormat;
			this.#dataType = dataType;

			this.#image = new Image();
			this.#image.src = url;
			this.#image.addEventListener('load', this.#loadImage.bind(this));
		}


		// Get the position buffer
		get positions() {
			return this.#positions;
		}


		// Set the position buffer
		set positions(buf) {
			// Todo
		}


		// Get the coordinate buffer
		get coordinates() {
			return this.#coords;
		}


		// Set the coordinate buffer
		set coordinates(buf) {
			// Todo
		}


		// Load callback
		async load() {
			return new Promise((res, rej) => {
				if(this.#imageLoaded) res();
				else this.#imageCallback = res;
			});
		}
	}

};
