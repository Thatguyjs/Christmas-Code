const Renderer = {

	// Canvas and WebGL context
	canvas: document.getElementById('display'),
	gl: null,


	// Global WebGL settings and constants
	clearColor: [0, 0, 0, 1],
	clearDepth: 1,
	depthFunc: null,
	perspective: { fov: 45, aspect: null },
	orthographic: { left: -1, right: 1, bottom: -1, top: 1 },
	clip: { near: 0.1, far: 100 },
	projection: { type: '', matrix: mat4.create() },
	modelView: mat4.create(),


	// Program info
	program: null, // Active program
	programs: {},


	// Initialize variables
	init: async function() {
		this.gl = this.canvas.getContext('webgl2');
		this.resizeCanvas();

		// Set constants / variables
		this.depthFunc = this.gl.LEQUAL;

		this.orthographic.left = -window.innerWidth / window.innerHeight;
		this.orthographic.right = window.innerWidth / window.innerHeight;
	},


	// Create a new shader program
	createProgram: async function(name, options) {
		if(this.programs[name]) {
			throw new Error("Program \"" + name + "\" already exists");
		}

		this.programs[name] = {
			name,
			program: await Gfx.createProgram(this.gl, options),
			attributes: {},
			uniforms: {}
		};

		let replaceProgram = null;
		if(this.program) replaceProgram = this.program.name;

		this.useProgram(name);

		let attrKeys = Object.keys(options.attributes || {});

		for(let k in attrKeys) {
			this.getItemLocation(attrKeys[k], 'attribute', options.attributes[attrKeys[k]]);
		}

		let uniformKeys = Object.keys(options.uniforms || {});

		for(let k in uniformKeys) {
			this.getItemLocation(uniformKeys[k], 'uniform', options.uniforms[uniformKeys[k]]);
		}

		if(replaceProgram !== null) {
			this.useProgram(replaceProgram);
		}
	},


	// Use a shader program
	useProgram: function(name) {
		if(!this.programs[name]) throw new Error("Program \"" + name + "\" does not exist");
		else if(this.program && this.program.name === name) return;

		this.gl.useProgram(this.programs[name].program);
		this.program = this.programs[name];
	},


	// Get shader uniform locations
	getItemLocation: function(alias, type, name) {
		if(type === 'attribute') {
			this.program.attributes[alias] = this.gl.getAttribLocation(this.program.program, name);
			return this.program.attributes[alias];
		}
		else if(type === 'uniform') {
			this.program.uniforms[alias] = this.gl.getUniformLocation(this.program.program, name);
			return this.program.uniforms[alias];
		}
		else throw new Error("Unknown shader variable type: " + type);
	},


	// Set a uniform matrix
	setUniformMatrix: function(alias, type, value) {
		const location = this.program.uniforms[alias];
		if(!location) throw new Error("Unknown alias: " + alias);

		if(type === 2)
			this.gl.uniformMatrix2fv(location, false, value);
		else if(type === 3)
			this.gl.uniformMatrix3fv(location, false, value);
		else if(type === 4)
			this.gl.uniformMatrix4fv(location, false, value);
		else throw new Error("Unknown matrix type: " + type);
	},


	// Set the projection matrix
	setProjectionType: function(type) {
		if(type === 'ortho' || type === 'orthographic') {
			this.projection.type = 'orthographic';

			mat4.ortho(
				this.projection.matrix,
				this.orthographic.left,
				this.orthographic.right,
				this.orthographic.bottom,
				this.orthographic.top,
				this.clip.near,
				this.clip.far
			);
		}
		else if(type === 'persp' || type === 'perspective') {
			this.projection.type = 'perspective';

			mat4.perspective(
				this.projection.matrix,
				this.perspective.fov,
				this.perspective.aspect,
				this.clip.near,
				this.clip.far
			);
		}
		else throw new Error("Unknown projection type: " + type);
	},


	// Resize the canvas and viewport
	resizeCanvas: function(w=window.innerWidth, h=window.innerHeight) {
		this.canvas.width = w;
		this.canvas.height = h;

		if(this.gl) this.gl.viewport(0, 0, w, h);

		this.perspective.aspect = this.canvas.clientWidth / this.canvas.clientHeight;
		this.orthographic.left = -this.perspective.aspect;
		this.orthographic.right = this.perspective.aspect;
	},


	// Clear the screen
	clear: function() {
		this.gl.clearColor(...this.clearColor);
		this.gl.clearDepth(this.clearDepth);
		this.gl.enable(this.gl.DEPTH_TEST);
		this.gl.depthFunc(this.depthFunc);

		this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
	}

};
