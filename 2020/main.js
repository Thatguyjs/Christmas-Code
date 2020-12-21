const Main = {

	// Shader variables
	vars: {},


	// Ground buffers
	groundBuf: {
		points: null,
		indices: null,
		colors: null
	},


	// Particle buffers
	particleBuf: {
		points: null,
		colors: null
	},


	// Tree buffer
	treeBuf: {
		points: null,
		indices: null,
		colors: null
	},


	// Globe buffers
	globeBuf: {
		points: null,
		colors: null
	},


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
		mat4.translate(Renderer.program.matrix.projection, Renderer.program.matrix.projection, [0, 0, -3]);

		// Set matrices
		Renderer.setUniformMatrix('projection', 4, Renderer.program.matrix.projection);
		Renderer.setUniformMatrix('modelView', 4, Renderer.program.matrix.modelView);

		// Get shader variables
		this.vars.position = Renderer.getItemLocation('position', 'attribute', 'aVertexPosition');
		this.vars.color = Renderer.getItemLocation('color', 'attribute', 'aVertexColor');

		// Enable attributes
		Renderer.gl.enableVertexAttribArray(this.vars.position);
		Renderer.gl.enableVertexAttribArray(this.vars.color);


		// Positions
		Ground.generate(8, 16);

		// Ground vertices
		this.groundBuf.points = Gfx.createBuffer(
			Renderer.gl,
			Renderer.gl.ARRAY_BUFFER,
			Ground.points,
			Renderer.gl.STATIC_DRAW
		);

		// Ground colors
		this.groundBuf.colors = Gfx.createBuffer(
			Renderer.gl,
			Renderer.gl.ARRAY_BUFFER,
			Ground.colors,
			Renderer.gl.STATIC_DRAW
		);

		// Ground indices
		this.groundBuf.indices = Gfx.createBuffer(
			Renderer.gl,
			Renderer.gl.ELEMENT_ARRAY_BUFFER,
			Ground.indices,
			Renderer.gl.STATIC_DRAW
		);


		// Particles
		Particles.generate(150);

		// Particle vertices
		this.particleBuf.points = Gfx.createBuffer(
			Renderer.gl,
			Renderer.gl.ARRAY_BUFFER,
			Particles.points,
			Renderer.gl.DYNAMIC_DRAW
		);

		// Particle colors
		this.particleBuf.colors = Gfx.createBuffer(
			Renderer.gl,
			Renderer.gl.ARRAY_BUFFER,
			Particles.colors,
			Renderer.gl.STATIC_DRAW
		);


		// Trees
		Trees.generate(8, 6);

		// Tree vertices
		this.treeBuf.points = Gfx.createBuffer(
			Renderer.gl,
			Renderer.gl.ARRAY_BUFFER,
			Trees.points,
			Renderer.gl.STATIC_DRAW
		);

		// Tree colors
		this.treeBuf.colors = Gfx.createBuffer(
			Renderer.gl,
			Renderer.gl.ARRAY_BUFFER,
			Trees.colors,
			Renderer.gl.STATIC_DRAW
		);

		// Tree indices
		this.treeBuf.indices = Gfx.createBuffer(
			Renderer.gl,
			Renderer.gl.ELEMENT_ARRAY_BUFFER,
			Trees.indices,
			Renderer.gl.STATIC_DRAW
		);


		// Globe
		Globe.generate(8, 16);

		// Globe vertices
		this.globeBuf.points = Gfx.createBuffer(
			Renderer.gl,
			Renderer.gl.ARRAY_BUFFER,
			Globe.points,
			Renderer.gl.STATIC_DRAW
		);

		// Globe colors
		this.globeBuf.colors = Gfx.createBuffer(
			Renderer.gl,
			Renderer.gl.ARRAY_BUFFER,
			Globe.colors,
			Renderer.gl.STATIC_DRAW
		);

		// Globe indices
		this.globeBuf.indices = Gfx.createBuffer(
			Renderer.gl,
			Renderer.gl.ELEMENT_ARRAY_BUFFER,
			Globe.indices,
			Renderer.gl.STATIC_DRAW
		);


		// Render the scene
		window.requestAnimationFrame(this.render);
	},


	// Render the scene
	render: function() {
		Renderer.clear();

		// For opaque objects
		Renderer.gl.disable(Renderer.gl.BLEND);
		Renderer.gl.depthMask(true);


		// Camera rotation
		mat4.rotate(
			Renderer.program.matrix.projection,
			Renderer.program.matrix.projection,
			0.01,
			[0, 1, 1]
		);

		Renderer.setUniformMatrix('projection', 4, Renderer.program.matrix.projection);


		// Load the ground buffers
		Renderer.gl.bindBuffer(Renderer.gl.ARRAY_BUFFER, Main.groundBuf.points);

		Renderer.gl.vertexAttribPointer(
			Main.vars.position,
			3,
			Renderer.gl.FLOAT,
			false,
			0,
			0
		);

		Renderer.gl.bindBuffer(Renderer.gl.ARRAY_BUFFER, Main.groundBuf.colors);

		Renderer.gl.vertexAttribPointer(
			Main.vars.color,
			4,
			Renderer.gl.FLOAT,
			false,
			0,
			0
		);

		// Draw the ground
		Renderer.gl.bindBuffer(Renderer.gl.ELEMENT_ARRAY_BUFFER, Main.groundBuf.indices);

		// Renderer.gl.drawElements(
		// 	Renderer.gl.TRIANGLES,
		// 	Ground.indices.length,
		// 	Renderer.gl.UNSIGNED_SHORT,
		// 	0
		// );


		// Load the particle buffers
		Renderer.gl.bindBuffer(Renderer.gl.ARRAY_BUFFER, Main.particleBuf.points);

		Renderer.gl.vertexAttribPointer(
			Main.vars.position,
			3,
			Renderer.gl.FLOAT,
			false,
			0,
			0
		);

		Renderer.gl.bindBuffer(Renderer.gl.ARRAY_BUFFER, Main.particleBuf.colors);

		Renderer.gl.vertexAttribPointer(
			Main.vars.color,
			4,
			Renderer.gl.FLOAT,
			false,
			0,
			0
		);

		// Draw the particles
		Renderer.gl.bindBuffer(Renderer.gl.ARRAY_BUFFER, Main.particleBuf.points);

		Renderer.gl.drawArrays(
			Renderer.gl.TRIANGLES,
			0,
			Particles.count * 3
		);

		Particles.update();
		Gfx.updateBuffer(Renderer.gl, Renderer.gl.ARRAY_BUFFER, Main.particleBuf.points, Particles.points, Renderer.gl.DYNAMIC_DRAW);


		// Load the tree buffers
		Renderer.gl.bindBuffer(Renderer.gl.ARRAY_BUFFER, Main.treeBuf.points);

		Renderer.gl.vertexAttribPointer(
			Main.vars.position,
			3,
			Renderer.gl.FLOAT,
			false,
			0,
			0
		);

		Renderer.gl.bindBuffer(Renderer.gl.ARRAY_BUFFER, Main.treeBuf.colors);

		Renderer.gl.vertexAttribPointer(
			Main.vars.color,
			4,
			Renderer.gl.FLOAT,
			false,
			0,
			0
		);

		// Draw the trees
		Renderer.gl.bindBuffer(Renderer.gl.ELEMENT_ARRAY_BUFFER, Main.treeBuf.indices);

		Renderer.gl.drawElements(
			Renderer.gl.TRIANGLES,
			Trees.indices.length,
			Renderer.gl.UNSIGNED_SHORT,
			0
		);


		// Load the globe buffers
		Renderer.gl.bindBuffer(Renderer.gl.ARRAY_BUFFER, Main.globeBuf.points);

		Renderer.gl.vertexAttribPointer(
			Main.vars.position,
			3,
			Renderer.gl.FLOAT,
			false,
			0,
			0
		);

		Renderer.gl.bindBuffer(Renderer.gl.ARRAY_BUFFER, Main.globeBuf.colors);

		Renderer.gl.vertexAttribPointer(
			Main.vars.color,
			4,
			Renderer.gl.FLOAT,
			false,
			0,
			0
		);

		// Draw the globe
		Renderer.gl.bindBuffer(Renderer.gl.ELEMENT_ARRAY_BUFFER, Main.globeBuf.indices);

		// Bottom half
		Renderer.gl.drawElements(
			Renderer.gl.TRIANGLES,
			Globe.indices.length / 2,
			Renderer.gl.UNSIGNED_SHORT,
			0
		);

		// Transparent objects
		Renderer.gl.enable(Renderer.gl.BLEND);
		Renderer.gl.blendFunc(Renderer.gl.SRC_ALPHA, Renderer.gl.ONE_MINUS_SRC_ALPHA);
		Renderer.gl.depthMask(false);

		// Top half
		Renderer.gl.drawElements(
			Renderer.gl.TRIANGLES,
			Globe.indices.length / 2,
			Renderer.gl.UNSIGNED_SHORT,
			Globe.indices.length
		);

		window.requestAnimationFrame(Main.render);
	}

};
