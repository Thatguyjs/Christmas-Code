const Main = {

	init: async function() {
		await Renderer.createProgram('main', {
			vertex: '@include/gl/vertex.vert',
			fragment: '@include/gl/fragment.frag',

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
		Renderer.setUniformMatrix('projection', 4, Renderer.projection.matrix);
		Renderer.setUniformMatrix('modelView', 4, Renderer.modelView);
		mat4.translate(Renderer.modelView, Renderer.modelView, [0, 0, -4]);

		// Update shader variables
		Renderer.setUniformMatrix('projection', 4, Renderer.projection.matrix);
		Renderer.setUniformMatrix('modelView', 4, Renderer.modelView);

		// Render the scene
		this.render();
	},


	// Render the scene
	render: function() {
		Renderer.clear();

		console.log('render');
	}

};
