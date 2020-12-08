const Main = {

	// Shader variables
	vars: {},


	// Index buffer
	indices: null,


	init: async function() {
		await Renderer.createProgram('main', {
			vertex: '@include/gl/color.vert',
			fragment: '@include/gl/color.frag',

			attributes: {
				'position': 'aVertexPosition',
				'color': 'aVertexColor'
			},

			uniforms: {
				'projection': 'uProjectionMatrix',
				'modelView': 'uModelViewMatrix'
			}
		});

		Renderer.useProgram('main');

		// Setup rendering type & translation
		Renderer.setProjectionType('perspective');
		mat4.translate(Renderer.program.matrix.modelView, Renderer.program.matrix.modelView, [0, 0, -3]);

		// Set matrices
		Renderer.setUniformMatrix('projection', 4, Renderer.program.matrix.projection);
		Renderer.setUniformMatrix('modelView', 4, Renderer.program.matrix.modelView);

		// Get shader variables
		this.vars.position = Renderer.getItemLocation('position', 'attribute', 'aVertexPosition');
		this.vars.color = Renderer.getItemLocation('color', 'attribute', 'aVertexColor');

		// Positions
		Ground.generate(8, 16);

		Gfx.createBuffer(
			Renderer.gl,
			Renderer.gl.ARRAY_BUFFER,
			Ground.points,
			Renderer.gl.STATIC_DRAW
		);

		Renderer.gl.vertexAttribPointer(
			this.vars.position,
			3,
			Renderer.gl.FLOAT,
			false,
			0,
			0
		);
		Renderer.gl.enableVertexAttribArray(this.vars.position);

		// Colors
		let colBuf = new Float32Array(Ground.triangleCount * 12);

		for(let i = 0; i < Ground.triangleCount; i++) {
			colBuf[i * 12] = i / Ground.triangleCount;
			colBuf[i * 12 + 1] = 0;
			colBuf[i * 12 + 2] = 0;
			colBuf[i * 12 + 3] = 1;

			colBuf[i * 12 + 4] = i / Ground.triangleCount;
			colBuf[i * 12 + 5] = 0;
			colBuf[i * 12 + 6] = 0;
			colBuf[i * 12 + 7] = 1;

			colBuf[i * 12 + 8] = i / Ground.triangleCount;
			colBuf[i * 12 + 9] = 0;
			colBuf[i * 12 + 10] = 0;
			colBuf[i * 12 + 11] = 1;
		}

		Gfx.createBuffer(
			Renderer.gl,
			Renderer.gl.ARRAY_BUFFER,
			colBuf,
			Renderer.gl.STATIC_DRAW
		);

		Renderer.gl.vertexAttribPointer(
			this.vars.color,
			4,
			Renderer.gl.FLOAT,
			false,
			0,
			0
		);
		Renderer.gl.enableVertexAttribArray(this.vars.color);

		// Indices
		this.indices = Gfx.createBuffer(
			Renderer.gl,
			Renderer.gl.ELEMENT_ARRAY_BUFFER,
			Ground.indices,
			Renderer.gl.STATIC_DRAW
		);

		// Render the scene
		this.render();
	},


	// Render the scene
	render: function() {
		Renderer.clear();

		Renderer.gl.bindBuffer(Renderer.gl.ELEMENT_ARRAY_BUFFER, this.indices);

		Renderer.gl.drawElements(
			Renderer.gl.TRIANGLES,
			Ground.indices.length,
			Renderer.gl.UNSIGNED_SHORT,
			0
		);

		console.log('render');
	}

};
