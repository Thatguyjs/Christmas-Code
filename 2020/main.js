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
		let colBuf = new Float32Array(Ground.pointCount * 4);

		for(let i = 0; i < Ground.pointCount; i++) {
			const z = Ground.points[i * 3 + 2];
			const col = (z * 2) + 0.5;

			colBuf[i * 4] = col;
			colBuf[i * 4 + 1] = col;
			colBuf[i * 4 + 2] = col;
			colBuf[i * 4 + 3] = 1;
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
		Renderer.gl.bindBuffer(Renderer.gl.ELEMENT_ARRAY_BUFFER, this.indices);
		window.requestAnimationFrame(this.render);
	},


	// Render the scene
	render: function() {
		Renderer.clear();

		mat4.rotate(
			Renderer.program.matrix.modelView,
			Renderer.program.matrix.modelView,
			0.01,
			[0, 1, 1]
		);

		Renderer.setUniformMatrix('modelView', 4, Renderer.program.matrix.modelView);

		Renderer.gl.drawElements(
			Renderer.gl.TRIANGLES,
			Ground.indices.length,
			Renderer.gl.UNSIGNED_SHORT,
			0
		);

		window.requestAnimationFrame(Main.render);
	}

};
