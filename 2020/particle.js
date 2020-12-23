// Generate the snow particles


const Particles = {

	// Point buffer
	_points: null,
	_numPoints: 0,


	// Color buffer
	_colors: null,


	// Particle data (rotation)
	_particles: null,


	// Simulation settings
	_size: 0.01,
	_fallSpeed: 0.004,
	_rotSpeed: 0.01,


	// Generate the particle buffer
	generate: function(amount) {
		this._numPoints = amount * 3;

		this._points = new Float32Array(amount * 3 * 3);
		this._colors = new Float32Array(amount * 4);
		this._particles = new Float32Array(amount * 4);

		// Generate in random locations
		for(let i = 0; i < amount; i++) {
			const pos = Globe.randomPoint(0, 0.95, true);

			// Positions
			this._points[i * 9] = pos.x - this._size;
			this._points[i * 9 + 1] = pos.y - this._size;
			this._points[i * 9 + 2] = pos.z;

			this._points[i * 9 + 3] = pos.x + this._size;
			this._points[i * 9 + 4] = pos.y - this._size;
			this._points[i * 9 + 5] = pos.z;

			this._points[i * 9 + 6] = pos.x;
			this._points[i * 9 + 7] = pos.y + this._size;
			this._points[i * 9 + 8] = pos.z;

			// Colors
			this._colors[i * 4] = 0.9;
			this._colors[i * 4 + 1] = 0.9;
			this._colors[i * 4 + 2] = 0.92;
			this._colors[i * 4 + 3] = 1;

			// Other data
			this._particles[i * 4] = 0; // Rotation
			this._particles[i * 4 + 1] = pos.x; // Initial x
			this._particles[i * 4 + 2] = pos.y; // Initial y
			this._particles[i * 4 + 3] = pos.z; // Initial z
		}
	},


	// Update vertex positions
	update: function() {
		for(let p = 0; p < this._numPoints / 3; p++) {
			if(this._points[p * 9 + 2] <= 0) {
				const newPos = Globe.randomPoint(0, 0.95, false);
				this._particles[p * 4 + 1] = newPos.x;
				this._particles[p * 4 + 2] = newPos.y;
				this._particles[p * 4 + 3] = newPos.z;

				const top = Globe.getTopPoint(this._particles[p * 4 + 1], this._particles[p * 4 + 2]).z;

				// x
				this._points[p * 9] = newPos.x - this._size;
				this._points[p * 9 + 3] = newPos.x + this._size;
				this._points[p * 9 + 6] = newPos.x;

				// y
				this._points[p * 9 + 1] = newPos.y - this._size;
				this._points[p * 9 + 4] = newPos.y - this._size;
				this._points[p * 9 + 7] = newPos.y + this._size;

				// z
				this._points[p * 9 + 2] = top;
				this._points[p * 9 + 5] = top;
				this._points[p * 9 + 8] = top;
			}

			// Height
			this._points[p * 9 + 2] -= this._fallSpeed;
			this._points[p * 9 + 5] -= this._fallSpeed;
			this._points[p * 9 + 8] -= this._fallSpeed;

			// Rotation
			this._particles[p * 4] = (this._particles[p * 4] + Math.random() * this._rotSpeed) % 1;
			const p1 = Gfx.polarToCartesian(this._size, this._particles[p * 4] * (Math.PI * 2));
			const p2 = Gfx.polarToCartesian(this._size, (this._particles[p * 4] + 0.33) * (Math.PI * 2));
			const p3 = Gfx.polarToCartesian(this._size, (this._particles[p * 4] - 0.33) * (Math.PI * 2));

			this._points[p * 9] = this._particles[p * 4 + 1] + p1.x;
			this._points[p * 9 + 1] = this._particles[p * 4 + 2] + p1.y;

			this._points[p * 9 + 3] = this._particles[p * 4 + 1] + p2.x;
			this._points[p * 9 + 4] = this._particles[p * 4 + 2] + p2.y;

			this._points[p * 9 + 6] = this._particles[p * 4 + 1] + p3.x;
			this._points[p * 9 + 7] = this._particles[p * 4 + 2] + p3.y;
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
