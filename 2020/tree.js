// Generate the trees on the ground


const Trees = {

	// Point buffer (for texture)
	_points: null,


	// Index buffer
	_indices: null,


	// Color buffer
	_colors: null,


	// Number of points
	_pointNum: 0,


	// Number of triangles
	_triangleNum: 0,


	// Generate the trees
	generate: function(amount, sides) {
		this._pointNum = 4 * sides * amount;

		this._points = new Float32Array(this._pointNum * 3); // x, y, z
		this._indices = new Uint16Array(6 * sides * amount);
		this._colors = new Float32Array(this._pointNum * 4); // r, g, b, a

		for(let a = 0; a < amount; a++) {
			const pos = Globe.randomPoint(false);

			const ptInd = sides * a * 4 * 3;
			const indInd = sides * a * 6;
			const colInd = sides * a * 4 * 4;

			for(let s = 0; s < sides; s++) {
				const ptOffset = ptInd + s * 4 * 3;
				const indOffset = indInd + s * 6;
				const colOffset = colInd + s * 4 * 4;

				// Points
				let left = Gfx.polarToCartesian(-0.1, Math.PI / sides * s);
				let right = Gfx.polarToCartesian(0.1, Math.PI / sides * s);

				// console.log(bl, br);

				this._points[ptOffset] = pos.x + left.x;
				this._points[ptOffset + 1] = pos.y + left.y;
				this._points[ptOffset + 2] = 0;

				this._points[ptOffset + 3] = pos.x + right.x;
				this._points[ptOffset + 4] = pos.y + right.y;
				this._points[ptOffset + 5] = 0;

				this._points[ptOffset + 6] = pos.x + left.x;
				this._points[ptOffset + 7] = pos.y + left.y;
				this._points[ptOffset + 8] = 0.4;

				this._points[ptOffset + 9] = pos.x + right.x;
				this._points[ptOffset + 10] = pos.y + right.y;
				this._points[ptOffset + 11] = 0.4;

				// Indices
				this._indices[indOffset] = ptOffset / 3;
				this._indices[indOffset + 1] = ptOffset / 3 + 1;
				this._indices[indOffset + 2] = ptOffset / 3 + 2;

				this._indices[indOffset + 3] = ptOffset / 3 + 1;
				this._indices[indOffset + 4] = ptOffset / 3 + 2;
				this._indices[indOffset + 5] = ptOffset / 3 + 3;

				// Colors
				for(let c = 0; c < 4; c++) {
					this._colors[colOffset + c * 4] = 0.4;
					this._colors[colOffset + c * 4 + 1] = 0;
					this._colors[colOffset + c * 4 + 2] = 0;
					this._colors[colOffset + c * 4 + 3] = 1;
				}
			}
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
	}

};
