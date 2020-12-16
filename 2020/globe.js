// Generate a snow-globe type sphere


const Globe = {

	// Point buffer
	_points: null,


	// Index buffer
	_indices: null,


	// Color buffer
	_colors: null,


	// Number of triangles
	_triangleNum: 0,


	// Generate the globe
	generate: function(rings, pointNum) {
		this._triangleNum = (rings * pointNum - pointNum) * 2 + pointNum;
		this._pointNum = rings * pointNum + 1;

		this._points = new Float32Array(this._pointNum * 3);
		this._indices = new Uint16Array(this._triangleNum * 3);
		this._colors = new Float32Array(this._pointNum * 4);

		// Center point
		this._points[0] = 0;
		this._points[1] = 0;
		this._points[2] = -1;

		// Other points
		for(let r = 1; r <= rings; r++) {
			for(let p = 0; p < pointNum; p++) {
				const index = ((r - 1) * pointNum + p) * 3 + 3;
				const point = Gfx.polarToCartesian(r / rings, (Math.PI * 2) / pointNum * p);
				const z = -Math.sqrt(1 - (r / rings) ** 2);

				// x, y, z
				this._points[index] = point.x;
				this._points[index + 1] = point.y;
				this._points[index + 2] = z;
			}
		}

		// Match edges with the ground edges
		const ptNum = Ground.edgePoints.length / 3;
		const edgeOffset = this._pointNum * 3 - pointNum * 3;

		for(let p = 0; p < ptNum; p++) {
			const thisInd = edgeOffset + p * 3; // Local edge index
			const thatInd = p * 3; // Ground edge index

			this._points[thisInd + 2] = Ground.edgePoints[thatInd + 2];
		}

		// Center indices
		for(let i = 1; i <= pointNum; i++) {
			let end = i + 1;
			if(end > pointNum) end = 1;

			const index = (i - 1) * 3;

			this._indices[index] = i;
			this._indices[index + 1] = end;
			this._indices[index + 2] = 0;
		}

		// Outer indices
		for(let r = 0; r < rings - 1; r++) {
			for(let p = 0; p < pointNum; p++) {
				let ir = r * pointNum + p + 1; // Inner-right
				let il = ir + 1; // Inner-left
				if(il > (r + 1) * pointNum) il = r * pointNum + 1;

				let or = (r + 1) * pointNum + p + 1; // Outer-right
				let ol = or + 1; // Outer-left
				if(ol > (r + 2) * pointNum) ol = (r + 1) * pointNum + 1;

				const index = (r * pointNum + p) * 6 + pointNum * 3;

				this._indices[index] = ir;
				this._indices[index + 1] = il;
				this._indices[index + 2] = or;

				this._indices[index + 3] = il;
				this._indices[index + 4] = or;
				this._indices[index + 5] = ol;
			}
		}

		// Color buffer
		for(let i = 0; i < this._pointNum; i++) {
			const z = this._points[i * 3 + 2];
			const col = Math.max(z + 1, 0.1);

			this._colors[i * 4] = col;
			this._colors[i * 4 + 1] = col;
			this._colors[i * 4 + 2] = col;
			this._colors[i * 4 + 3] = 1;
		}
	},


	// Get the point buffer
	get points() {
		return this._points;
	},


	// Get the index buffer
	get indices() {
		return this._indices;
	},


	// Get the color buffer
	get colors() {
		return this._colors;
	},


	// Get the number of triangles
	get triangleCount() {
		return this._triangleNum;
	},


	// Get the number of vertices
	get pointCount() {
		return this._pointNum;
	}

};
