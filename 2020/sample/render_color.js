const SampleRenderColor = {

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

		// Set shader variables
		Renderer.setUniformMatrix('projection', 4, Renderer.program.matrix.projection);
		Renderer.setUniformMatrix('modelView', 4, Renderer.program.matrix.modelView);

		// Render the scene
		this.render();
	},


	// Draw a colored square
	render: function() {
		Renderer.clear();

		let posLoc = Renderer.getItemLocation('position', 'attribute', 'aVertexPosition');

		let pos = new Float32Array([
			-1, 1, 0,
			1, 1, 0,
			-1, -1, 0,
			1, -1, 0
		]);

		let buf = Gfx.createBuffer(
			Renderer.gl,
			Renderer.gl.ARRAY_BUFFER,
			pos,
			Renderer.gl.STATIC_DRAW
		);

		Renderer.gl.bindBuffer(Renderer.gl.ARRAY_BUFFER, buf);
		Renderer.gl.vertexAttribPointer(
			posLoc,
			3,
			Renderer.gl.FLOAT,
			false,
			0,
			0
		);
		Renderer.gl.enableVertexAttribArray(posLoc);

		let colorLoc = Renderer.getItemLocation('color', 'attribute', 'aVertexColor');

		let colors = new Float32Array([
			1, 0, 0, 1,
			0, 1, 0, 1,
			0, 0, 1, 1,
			1, 1, 1, 1,
		]);

		let cBuf = Gfx.createBuffer(
			Renderer.gl,
			Renderer.gl.ARRAY_BUFFER,
			colors,
			Renderer.gl.STATIC_DRAW
		);

		Renderer.gl.bindBuffer(Renderer.gl.ARRAY_BUFFER, cBuf);
		Renderer.gl.vertexAttribPointer(
			colorLoc,
			4,
			Renderer.gl.FLOAT,
			false,
			0,
			0
		);
		Renderer.gl.enableVertexAttribArray(colorLoc);

		Renderer.gl.drawArrays(Renderer.gl.TRIANGLE_STRIP, 0, 4);
	}

};
