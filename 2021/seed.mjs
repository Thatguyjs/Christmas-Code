export default {
	seed: 0,

	set_seed(value) {
		if(this.seed === value) return;
		this.seed = value;

		noise.seed(this.seed);
	},

	get_seed() {
		return this.seed;
	},

	is_seed(value) {
		return this.seed === value;
	}
};
