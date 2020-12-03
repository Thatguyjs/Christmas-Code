const SampleRenderImage = {

	init: async function() {
		await Renderer.createProgram('main', {
			vertex: '@include/gl/texture.vert',
			fragment: '@include/gl/texture.frag',

			attributes: {
				'position': 'aVertexPosition',
				'coord': 'aTexCoord'
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


	render: function() {
		Renderer.clear();

		// Variable locations
		const posLoc = Renderer.getItemLocation('position', 'attribute', 'aVertexPosition');
		const coordLoc = Renderer.getItemLocation('coord', 'attribute', 'aTexCoord');

		// Setup positions
		let pos = new Float32Array([
			0, 0,
			32, 0,
			0, 32,

			32, 0,
			0, 32,
			32, 32
		]);

		let posBuf = Gfx.createBuffer(
			Renderer.gl,
			Renderer.gl.ARRAY_BUFFER,
			pos,
			Renderer.gl.STATIC_DRAW
		);

		Renderer.gl.bindBuffer(Renderer.gl.ARRAY_BUFFER, posBuf);
		Renderer.gl.vertexAttribPointer(
			posLoc,
			3,
			Renderer.gl.FLOAT,
			true,
			0,
			0
		);
		Renderer.gl.enableVertexAttribArray(posLoc);

		const texBuf = Gfx.createBuffer(
			Renderer.gl,
			Renderer.gl.ARRAY_BUFFER,
			new Float32Array([
				0, 0,
				1, 0,
				0, 1,

				1, 0,
				0, 1,
				1, 1
			]),
			Renderer.gl.STATIC_DRAW
		);

		Renderer.gl.bindBuffer(Renderer.gl.ARRAY_BUFFER, texBuf);
		Renderer.gl.vertexAttribPointer(
			coordLoc,
			2,
			Renderer.gl.FLOAT,
			true,
			0,
			0
		);
		Renderer.gl.enableVertexAttribArray(coordLoc);

		const tex = Renderer.gl.createTexture();
		Renderer.gl.activeTexture(Renderer.gl.TEXTURE0 + 0);
		Renderer.gl.bindTexture(Renderer.gl.TEXTURE_2D, tex);

		// Temp pixel
		Renderer.gl.texImage2D(
			Renderer.gl.TEXTURE_2D,
			0,
			Renderer.gl.RGBA,
			1, 1, 0,
			Renderer.gl.RGBA,
			Renderer.gl.UNSIGNED_BYTE,
			new Uint8Array([255, 0, 0, 255])
		);

		const image = new Image();

		image.addEventListener('load', () => {
			Renderer.gl.bindTexture(Renderer.gl.TEXTURE_2D, tex);
			Renderer.gl.texImage2D(
				Renderer.gl.TEXTURE_2D,
				0,
				Renderer.gl.RGBA, Renderer.gl.RGBA,
				Renderer.gl.UNSIGNED_BYTE,
				image
			);
			Renderer.gl.generateMipmap(Renderer.gl.TEXTURE_2D);

			Renderer.gl.drawArrays(Renderer.gl.TRIANGLES, 0, 6);
		});

		image.src = "sample/sample.png";
	}

};
