const Main = {

	init: function() {
		Renderer.createProgram('texture', {
			vertex: '@include/gl/vertex.vert',
			fragment: '@include/gl/fragment.frag',

			attributes: {
				'position': 'aVertexPosition',
				'color': 'aVertexColor'
			},

			uniforms: {
				'modelView': 'uModelViewMatrix',
				'projection': 'uProjectionMatrix'
			}
		});


		Renderer.clear();
	}

};
