// Generate the trees on the ground


const Trees = {

	// A face of the tree
	_pointsPerFace: 21,
	_indicesPerFace: 45,
	_pointFace: new Float32Array([
		0.5 - 1 / 16, 0,
		0.5 + 1 / 16, 0,
		0.5 - 1 / 16, 1 / 6,
		0.5 + 1 / 16, 1 / 6,
		0.5 - 1 / 16, 1 / 6,
		1 / 3.8, 1 / 6,
		0.45 - 1 / 16, 2 / 6,
		1 / 3.6, 2 / 6,
		0.475 - 1 / 16, 3 / 6,
		1 / 3.2, 3 / 6,
		0.5 - 1 / 16, 4 / 6,
		1 / 2.7, 4 / 6,
		0.5, 5 / 6,
		1 - 1 / 2.7, 4 / 6,
		0.5 + 1 / 16, 4 / 6,
		1 - 1 / 3.2, 3 / 6,
		0.525 + 1 / 16, 3 / 6,
		1 - 1 / 3.6, 2 / 6,
		0.55 + 1 / 16, 2 / 6,
		1 - 1 / 3.8, 1 / 6,
		0.5 + 1 / 16, 1 / 6
	]),


	// Point buffer
	_points: null,


	// Index buffer
	_indices: null,


	// Color buffer
	_colors: null,


	// Number of points
	_pointNum: 0,


	// Generate the trees
	generate: function(amount, sides, scale) {
		this._pointNum = this._pointsPerFace * sides * amount;

		this._points = new Float32Array(this._pointNum * 3); // x, y, z
		this._indices = new Uint16Array(this._indicesPerFace * sides * amount);
		this._colors = new Float32Array(this._pointNum * 4); // r, g, b, a

		for(let a = 0; a < amount; a++) {
			const ptInd = sides * a * this._pointsPerFace * 3;
			const indPtInd = sides * a * this._pointsPerFace;
			const indInd = sides * a * this._indicesPerFace;
			const colInd = sides * a * this._pointsPerFace * 4;

			let pos = Globe.randomPoint(0, 0.8, false);
			pos.z = Ground.noiseAt(pos.x, pos.y) - 0.05;

			for(let s = 0; s < sides; s++) {
				const ptOffset = ptInd + s * this._pointsPerFace * 3;
				const indPtOffset = indPtInd + s * this._pointsPerFace;
				const indOffset = indInd + s * this._indicesPerFace;
				const colOffset = colInd + s * this._pointsPerFace * 4;

				// Points
				for(let p = 0; p < this._pointsPerFace; p++) {
					const point = Gfx.polarToCartesian(this._pointFace[p * 2] - 0.5, Math.PI / sides * s);

					this._points[ptOffset + p * 3] = pos.x + point.x * scale;
					this._points[ptOffset + p * 3 + 1] = pos.y + point.y * scale;
					this._points[ptOffset + p * 3 + 2] = pos.z + this._pointFace[p * 2 + 1] * scale;
				}

				// Indices
				this._indices[indOffset] = indPtOffset;
				this._indices[indOffset + 1] = indPtOffset + 1;
				this._indices[indOffset + 2] = indPtOffset + 2;

				this._indices[indOffset + 3] = indPtOffset + 1;
				this._indices[indOffset + 4] = indPtOffset + 2;
				this._indices[indOffset + 5] = indPtOffset + 3;

				for(let i = 0; i < 3; i++) {
					// Left side
					this._indices[indOffset + i * 3 + 6] = indPtOffset + i * 2 + 4;
					this._indices[indOffset + i * 3 + 7] = indPtOffset + i * 2 + 5;
					this._indices[indOffset + i * 3 + 8] = indPtOffset + i * 2 + 6;

					// Right side
					this._indices[indOffset + i * 3 + 15] = indPtOffset + i * 2 + 14;
					this._indices[indOffset + i * 3 + 16] = indPtOffset + i * 2 + 15;
					this._indices[indOffset + i * 3 + 17] = indPtOffset + i * 2 + 16;

					// Center
					this._indices[indOffset + i * 6 + 27] = indPtOffset + i * 2 + 4;
					this._indices[indOffset + i * 6 + 28] = indPtOffset + i * 2 + 6;
					this._indices[indOffset + i * 6 + 29] = indPtOffset + 20 - i * 2;

					this._indices[indOffset + i * 6 + 30] = indPtOffset + i * 2 + 6;
					this._indices[indOffset + i * 6 + 31] = indPtOffset + 18 - i * 2;
					this._indices[indOffset + i * 6 + 32] = indPtOffset + 20 - i * 2;
				}

				this._indices[indOffset + 24] = indPtOffset + 11;
				this._indices[indOffset + 25] = indPtOffset + 12;
				this._indices[indOffset + 26] = indPtOffset + 13;

				// Colors
				for(let i = 0; i < 4; i++) {
					this._colors[colOffset + i * 4] = 110 / 255;
					this._colors[colOffset + i * 4 + 1] = 75 / 255;
					this._colors[colOffset + i * 4 + 2] = 45 / 255;
					this._colors[colOffset + i * 4 + 3] = 1;
				}

				for(let i = 4; i < this._pointsPerFace; i++) {
					this._colors[colOffset + i * 4] = 10 / 255;
					this._colors[colOffset + i * 4 + 1] = (100 + Math.random() * 30) / 255;
					this._colors[colOffset + i * 4 + 2] = (50 + Math.random() * 10) / 255;
					this._colors[colOffset + i * 4 + 3] = 1;
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


	// Get the number of points
	get pointCount() {
		return this._pointNum;
	}

};
