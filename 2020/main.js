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

		// Positions
		Ground.generate(8, 16);

		this.groundBuf.points = Gfx.createBuffer(
			Renderer.gl,
			Renderer.gl.ARRAY_BUFFER,
			Ground.points,
			Renderer.gl.STATIC_DRAW
		);

		// Colors
		let colBuf = new Float32Array(Ground.pointCount * 4);

		for(let i = 0; i < Ground.pointCount; i++) {
			const z = Ground.points[i * 3 + 2];
			const col = Math.min((z * 2) + 0.55, 1);

			colBuf[i * 4] = col;
			colBuf[i * 4 + 1] = col;
			colBuf[i * 4 + 2] = col;
			colBuf[i * 4 + 3] = 1;
		}

		// Create & bind the buffer
		this.groundBuf.colors = Gfx.createBuffer(
			Renderer.gl,
			Renderer.gl.ARRAY_BUFFER,
			colBuf,
			Renderer.gl.STATIC_DRAW
		);

		// Indices
		this.groundBuf.indices = Gfx.createBuffer(
			Renderer.gl,
			Renderer.gl.ELEMENT_ARRAY_BUFFER,
			Ground.indices,
			Renderer.gl.STATIC_DRAW
		);


		// Particles
		Particles.generate(1);
		

		// Set up vars
		Renderer.gl.enableVertexAttribArray(this.vars.position);
		Renderer.gl.enableVertexAttribArray(this.vars.color);

		// Render the scene
		window.requestAnimationFrame(this.render);
	},


	// Render the scene
	render: function() {
		Renderer.clear();

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
		Renderer.gl.enableVertexAttribArray(Main.vars.position);

		Renderer.gl.bindBuffer(Renderer.gl.ARRAY_BUFFER, Main.groundBuf.colors);

		Renderer.gl.vertexAttribPointer(
			Main.vars.colors,
			4,
			Renderer.gl.FLOAT,
			false,
			0,
			0
		);
		Renderer.gl.enableVertexAttribArray(Main.vars.color);

		// Draw the ground
		Renderer.gl.bindBuffer(Renderer.gl.ELEMENT_ARRAY_BUFFER, Main.groundBuf.indices);

		Renderer.gl.drawElements(
			Renderer.gl.TRIANGLES,
			Ground.indices.length,
			Renderer.gl.UNSIGNED_SHORT,
			0
		);

		// Load the particle buffers
		// Renderer.gl.bindBuffer(Renderer.gl.ARRAY_BUFFER, Main.particleBuf.points);
		//
		// Renderer.gl.vertexAttribPointer(
		// 	Main.vars.position,
		// 	3,
		// 	Renderer.gl.FLOAT,
		// 	false,
		// 	0,
		// 	0
		// );
		//
		// Renderer.gl.bindBuffer(Renderer.gl.ARRAY_BUFFER, Main.particleBuf.colors);
		//
		// Renderer.gl.vertexAttribPointer(
		// 	Main.vars.colors,
		// 	4,
		// 	Renderer.gl.FLOAT,
		// 	false,
		// 	0,
		// 	0
		// );
		//
		// // Draw the particles
		// Renderer.gl.bindBuffer(Renderer.gl.ARRAY_BUFFER, Main.particleBuf.points);
		//
		// Renderer.gl.drawArrays(
		// 	Renderer.gl.TRIANGLES,
		// 	0,
		// 	Particles.count
		// );

		window.requestAnimationFrame(Main.render);
	}

};
