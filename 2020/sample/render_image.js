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
		// Variable locations
		const posLoc = Renderer.getItemLocation('position', 'attribute', 'aVertexPosition');
		const coordLoc = Renderer.getItemLocation('coord', 'attribute', 'aTexCoord');

		// Vertex array object
		const vao = Renderer.gl.createVertexArray();
		Renderer.gl.bindVertexArray(vao);

		// Position buffer
		Renderer.gl.enableVertexAttribArray(posLoc);

		const posArr = new Float32Array([
			-1, -1, -1,
			1, -1, -1,
			-1, 1, -1,
			1, -1, -1,
			-1, 1, -1,
			1, 1, -1
		]);

		const posBuf = Gfx.createBuffer(
			Renderer.gl,
			Renderer.gl.ARRAY_BUFFER,
			posArr,
			Renderer.gl.STATIC_DRAW
		);

		Renderer.gl.vertexAttribPointer(posLoc, 3, Renderer.gl.FLOAT, false, 0, 0);

		// Texcoord buffer
		const coordBuf = Gfx.createBuffer(
			Renderer.gl,
			Renderer.gl.ARRAY_BUFFER,
			new Float32Array([
				0, 1,
				1, 1,
				0, 0,
				0, 0,
				1, 1,
				1, 0
			]),
			Renderer.gl.STATIC_DRAW
		);

		Renderer.gl.enableVertexAttribArray(coordLoc);
		Renderer.gl.vertexAttribPointer(coordLoc, 2, Renderer.gl.FLOAT, true, 0, 0);

		// Texture
		let texture = Renderer.gl.createTexture();
		Renderer.gl.activeTexture(Renderer.gl.TEXTURE0);
		Renderer.gl.bindTexture(Renderer.gl.TEXTURE_2D, texture);

		Renderer.gl.texImage2D(
			Renderer.gl.TEXTURE_2D,
			0,
			Renderer.gl.RGBA,
			1, 1, 0,
			Renderer.gl.RGBA,
			Renderer.gl.UNSIGNED_BYTE,
			new Uint8Array([255, 0, 0, 255])
		);

		// Load an image
		let image = new Image();
		image.src = "sample/sample.png";

		image.addEventListener('load', () => {
			Renderer.gl.bindTexture(Renderer.gl.TEXTURE_2D, texture);
			Renderer.gl.texImage2D(
				Renderer.gl.TEXTURE_2D,
				0,
				Renderer.gl.RGBA, Renderer.gl.RGBA,
				Renderer.gl.UNSIGNED_BYTE,
				image
			);

			Renderer.gl.generateMipmap(Renderer.gl.TEXTURE_2D);

			Renderer.clear();

			Renderer.gl.bindVertexArray(vao);
			Renderer.gl.drawArrays(Renderer.gl.TRIANGLES, 0, 6);
		});
	}

};
