// Generate the trees on the ground


const Trees = {

	// Point buffer (for texture)
	_points: new Float32Array(
		0, 0, 0,
		0, 0, 1,
		1, 0, 1,

		0, 0, 0,
		1, 0, 1,
		1, 1, 0
	),


	// Index buffer
	_indices: null,


	// Color buffer
	_colors: null,


	// Number of triangles
	_triangleNum: 0,


	// Generate the trees
	generate: function(amount, sideScale) {
		this._indices = new Float32Array(6); // Temp

		this._indices[0] = 0;
		this._indices[0] = 1;
		this._indices[0] = 2;

		this._indices[0] = 3;
		this._indices[0] = 4;
		this._indices[0] = 5;
	}

};
