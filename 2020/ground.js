// Generate the island that the scene is on


const Ground = {

	// Point buffer
	_points: null,


	// Index buffer
	_indices: null,


	// Number of triangles
	_triangleNum: 0,


	// Convert polar coordinates to cartesian coordinates
	polarToCartesian: function(dist, rot) {
		return {
			x: dist * Math.cos(rot),
			y: dist * Math.sin(rot)
		};
	},


	// Generate points
	init: function() {
		// Todo
	},


	// Generate a ground plane
	generate: function(rings, pointNum) {
		this._triangleNum = (rings * pointNum - pointNum) * 2 + pointNum;
		this._points = new Float32Array(this._triangleNum * 3 * 6);
		this._indices = new Uint16Array(this._triangleNum * 3);

		// Distance unit
		const distUnit = 1 / rings;

		// Rotation unit
		const rotUnit = (Math.PI * 2) / pointNum;

		// Center points
		for(let p = 0; p < pointNum; p++) {
			this._points[p * 3] = 0;
			this._points[p * 3 + 1] = 0;
			this._points[p * 3 + 2] = 0;
		}

		// Outer points
		for(let r = 1; r <= rings; r++) {
			for(let p = 0; p < pointNum; p++) {
				const index = ((r - 1) * pointNum + p) * (3 * 6) + pointNum * 3;
				const point = this.polarToCartesian(distUnit * r, rotUnit * p);

				// Each point (besides first ring) is used by 6 triangles
				for(let i = 0; i < 6; i++) {
					this._points[index + i * 3] = point.x;
					this._points[index + i * 3 + 1] = point.y;
					this._points[index + i * 3 + 2] = 0;
				}
			}
		}

		console.log(this._points);
	},


	// Get the point buffer
	get points() {
		return this._points;
	},


	// Get the index buffer
	get indices() {
		return this._indices;
	},


	// Get the number of triangles
	get triangleCount() {
		return this._triangleNum;
	}

}
