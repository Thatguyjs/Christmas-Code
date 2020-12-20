// Generate the trees on the ground


const Trees = {

	// Point buffer (for texture)
	_points: null,


	// Index buffer
	_indices: null,


	// Color buffer
	_colors: null,


	// Number of triangles
	_triangleNum: 0,


	// Generate the trees
	generate: function(amount, sides) {
		this._points = new Float32Array((amount + sides) * 4 * 3);
		this._indices = new Uint16Array((amount + sides) * 6);
		this._colors = new Float32Array((amount + sides) * 4 * 4);

		for(let a = 0; a < amount; a++) {
			const pos = Globe.randomPoint(false);

			for(let s = 0; s < sides; s++) {
				const ptInd = (a + s) * 4 * 3;
				const indInd = (a + s) * 6;
				const colInd = (a + s) * 4 * 4;

				// Points
				let bl = Gfx.polarToCartesian(-0.1, Math.PI / sides * s); // Bottom-left
				let br = Gfx.polarToCartesian(0.1, Math.PI / sides * s); // Bottom-right
				let tl = Gfx.polarToCartesian(-0.1, Math.PI / sides * s); // Top-left
				let tr = Gfx.polarToCartesian(0.1, Math.PI / sides * s); // Top-right

				console.log(bl, br);

				this._points[ptInd] = pos.x + bl.x;
				this._points[ptInd + 1] = pos.y + bl.y;
				this._points[ptInd + 2] = 0;

				this._points[ptInd + 3] = pos.x + br.x;
				this._points[ptInd + 4] = pos.y + br.y;
				this._points[ptInd + 5] = 0;

				this._points[ptInd + 6] = pos.x + tl.x;
				this._points[ptInd + 7] = pos.y + tl.y;
				this._points[ptInd + 8] = 0.4;

				this._points[ptInd + 9] = pos.x + tr.x;
				this._points[ptInd + 10] = pos.y + tr.y;
				this._points[ptInd + 11] = 0.4;

				// Indices
				this._indices[indInd] = ptInd / 3;
				this._indices[indInd + 1] = ptInd / 3 + 1;
				this._indices[indInd + 2] = ptInd / 3 + 2;

				this._indices[indInd + 3] = ptInd / 3 + 1;
				this._indices[indInd + 4] = ptInd / 3 + 2;
				this._indices[indInd + 5] = ptInd / 3 + 3;

				// Colors
				for(let c = 0; c < 4; c++) {
					this._colors[colInd + c * 4] = 0.4;
					this._colors[colInd + c * 4 + 1] = 0;
					this._colors[colInd + c * 4 + 2] = 0;
					this._colors[colInd + c * 4 + 3] = 1;
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
