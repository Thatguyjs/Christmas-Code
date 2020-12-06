// Manage & render textures


const Textures = {

	// Array of textures
	_textures: [],


	// Load the shader program
	init: async function() {
		await Renderer.createProgram('texture', {
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

		Renderer.useProgram('texture');

		// Default rendering settings
		Renderer.setProjectionType('perspective');
		mat4.translate(Renderer.program.matrix.modelView, Renderer.program.matrix.modelView, [0, 0, -3]);

		// Set shader variables
		Renderer.setUniformMatrix('projection', 4, Renderer.program.matrix.projection);
		Renderer.setUniformMatrix('modelView', 4, Renderer.program.matrix.modelView);
	},


	// Add a texture
	add: async function(url) {
		// Todo
	}

};
