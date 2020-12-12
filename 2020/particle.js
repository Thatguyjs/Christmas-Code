// Generate the snow particles


const Particles = {

	// Point buffer
	_points: null,
	_numPoints: 0,


	// Color buffer
	_colors: null,


	// Generate the particle buffer
	generate: function(amount) {
		this._numPoints = amount * 3;
		this._points = new Float32Array(amount * 3 * 3);
		this._colors = new Float32Array(amount * 4);

		// Generate in random locations
		for(let i = 0; i < amount; i++) {
			const pos = {
				x: Math.random(),
				y: Math.random(),
				z: Math.random()
			};

			// Positions
			this._points[i * 9] = pos.x - 0.01;
			this._points[i * 9 + 1] = pos.y - 0.01;
			this._points[i * 9 + 2] = pos.z;

			this._points[i * 9 + 3] = pos.x + 0.01;
			this._points[i * 9 + 4] = pos.y - 0.01;
			this._points[i * 9 + 5] = pos.z;

			this._points[i * 9 + 6] = pos.x;
			this._points[i * 9 + 7] = pos.y + 0.01;
			this._points[i * 9 + 8] = pos.z;

			// Colors
			this._colors[i * 4] = 0.9;
			this._colors[i * 4 + 1] = 0.9;
			this._colors[i * 4 + 2] = 0.92;
			this._colors[i * 4 + 3] = 1;
		}
	},


	// Update vertex positions
	update: function() {
		for(let p = 0; p < this._numPoints; p++) {
			if(this._points[p * 9 + 1] < 0) {
				this._points[p * 9 + 1] = 1;
				this._points[p * 9 + 4] = 1;
				this._points[p * 9 + 7] = 1;
			}

			this._points[p * 9 + 1] -= 0.01;
			this._points[p * 9 + 4] -= 0.01;
			this._points[p * 9 + 7] -= 0.01;
		}
	},


	// Get the point buffer
	get points() {
		return this._points;
	},


	// Get the color buffer
	get colors() {
		return this._colors;
	},


	// Particle count
	get count() {
		return this._numPoints / 3;
	}

};
