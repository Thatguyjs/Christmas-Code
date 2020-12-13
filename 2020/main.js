const Main = {

	// Shader variables
	vars: {},


	// Vertex buffer
	vertexBuf: null,


	// Color buffer
	colorBuf: null,


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

		// Colors
		const groundColors = new Float32Array(Ground.pointCount * 4);

		for(let i = 0; i < Ground.pointCount; i++) {
			const z = Ground.points[i * 3 + 2];
			const col = Math.min((z * 2) + 0.55, 1);

			groundColors[i * 4] = col;
			groundColors[i * 4 + 1] = col;
			groundColors[i * 4 + 2] = col;
			groundColors[i * 4 + 3] = 1;
		}


		// Particles
		Particles.generate(1);


		// Add everything to the vertex buffer
		this.vertexBuf = new Float32Array(Ground.points.length + Particles.points.length);
		this.vertexBuf.set(Ground.points, 0);
		this.vertexBuf.set(Particles.points, Ground.points.length);


		// Add everything to the color buffer
		this.colorBuf = new Float32Array(groundColors.length + Particles.colors.length);
		this.colorBuf.set(groundColors, 0);
		this.colorBuf.set(Particles.colors, groundColors.length);


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
		// Renderer.gl.bindBuffer(Renderer.gl.ARRAY_BUFFER, Main.groundBuf.points);
		//
		// Renderer.gl.vertexAttribPointer(
		// 	Main.vars.position,
		// 	3,
		// 	Renderer.gl.FLOAT,
		// 	false,
		// 	0,
		// 	0
		// );
		// Renderer.gl.enableVertexAttribArray(Main.vars.position);
		//
		// Renderer.gl.bindBuffer(Renderer.gl.ARRAY_BUFFER, Main.groundBuf.colors);
		//
		// Renderer.gl.vertexAttribPointer(
		// 	Main.vars.colors,
		// 	4,
		// 	Renderer.gl.FLOAT,
		// 	false,
		// 	0,
		// 	0
		// );
		// Renderer.gl.enableVertexAttribArray(Main.vars.color);
		//
		// // Draw the ground
		// Renderer.gl.bindBuffer(Renderer.gl.ELEMENT_ARRAY_BUFFER, Main.groundBuf.indices);
		//
		// Renderer.gl.drawElements(
		// 	Renderer.gl.TRIANGLES,
		// 	Ground.indices.length,
		// 	Renderer.gl.UNSIGNED_SHORT,
		// 	0
		// );

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
