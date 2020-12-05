const Main = {

	// Shader variables
	vars: {},

	// Vertex array
	vao: null,

	// Texture
	texture: null,


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

		this.vars.position = Renderer.getItemLocation('position', 'attribute', 'aVertexPosition');
		this.vars.coord = Renderer.getItemLocation('coord', 'attribute', 'aTexCoord');


		// Rendering setup
		this.vao = Renderer.gl.createVertexArray();
		Renderer.gl.bindVertexArray(this.vao);

		this.texture = new Gfx.Texture2D(
			Renderer.gl,
			Renderer.gl.STATIC_DRAW,
			Renderer.gl.TEXTURE0,
			Renderer.gl.RGBA,
			Renderer.gl.UNSIGNED_BYTE,
			"sample/sample2.png"
		);

		await this.texture.load();

		Renderer.gl.bindBuffer(Renderer.gl.ARRAY_BUFFER, this.texture.positions);
		Renderer.gl.enableVertexAttribArray(this.vars.position);
		Renderer.gl.vertexAttribPointer(this.vars.position, 3, Renderer.gl.FLOAT, false, 0, 0);

		Renderer.gl.bindBuffer(Renderer.gl.ARRAY_BUFFER, this.texture.coordinates);
		Renderer.gl.enableVertexAttribArray(this.vars.coord);
		Renderer.gl.vertexAttribPointer(this.vars.coord, 2, Renderer.gl.FLOAT, true, 0, 0);

		this.render();
	},


	// Render the scene
	render: function() {
		Renderer.clear();

		Renderer.gl.bindVertexArray(this.vao);
		Renderer.gl.drawArrays(Renderer.gl.TRIANGLES, 0, 6);

		console.log('render');
	}

};
