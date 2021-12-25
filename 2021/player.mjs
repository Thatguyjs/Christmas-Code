function constrain(value, min, max) {
	if(value < min) return min;
	if(value > max) return max;
	return value;
}


function register_movement_keys(key_map) {
	window.addEventListener('keydown', (ev) => {
		if(key_map[ev.code])
			Player.keys |= key_map[ev.code];
	});

	window.addEventListener('keyup', (ev) => {
		if(key_map[ev.code])
			Player.keys &= ~key_map[ev.code];
	});
}


const Player = {
	FORWARD: 1,
	BACKWARD: 2,
	LEFT: 4,
	RIGHT: 8,
	UP: 16,
	DOWN: 32,

	pos: { x: 0, y: 0, z: 0 },
	vel: { x: 0, y: 0, z: 0, scale: 0.065, slow: 0.8 },
	rot: { x: 0, y: 0, scale: 0.1 * Math.PI / 180, min_y: -90 * Math.PI / 180, max_y: 90 * Math.PI / 180 },

	freeroam: false, // 'F' to fly around freely

	keys: 0, // Key bitmap

	init() {
		register_movement_keys({
			'KeyW': Player.FORWARD,
			'KeyS': Player.BACKWARD,
			'KeyA': Player.LEFT,
			'KeyD': Player.RIGHT,
			'KeyE': Player.UP,
			'Space': Player.UP,
			'KeyQ': Player.DOWN,
			'ShiftLeft': Player.DOWN
		});

		window.addEventListener('keydown', (ev) => {
			if(ev.code === 'KeyF')
				Player.freeroam = !Player.freeroam;
		});

		window.addEventListener('mousemove', (ev) => {
			this.rot.x -= ev.movementX * this.rot.scale;
			this.rot.x %= Math.PI * 2;
			this.rot.y -= ev.movementY * this.rot.scale;
			this.rot.y = constrain(this.rot.y, this.rot.min_y, this.rot.max_y);
		});
	},

	update(ground_y) {
		let vel_dir = { x: Math.cos(this.rot.x), z: Math.sin(this.rot.x) };

		if(this.keys & Player.FORWARD) {
			this.vel.x += vel_dir.x;
			this.vel.z += vel_dir.z;
		}
		if(this.keys & Player.BACKWARD) {
			this.vel.x -= vel_dir.x;
			this.vel.z -= vel_dir.z;
		}
		if(this.keys & Player.LEFT) {
			this.vel.x -= vel_dir.z;
			this.vel.z += vel_dir.x;
		}
		if(this.keys & Player.RIGHT) {
			this.vel.x += vel_dir.z;
			this.vel.z -= vel_dir.x;
		}
		if(this.freeroam && this.keys & Player.UP) {
			this.vel.y += 0.2;
		}
		if(this.freeroam && this.keys & Player.DOWN) {
			this.vel.y -= 0.2;
		}

		const mag = Math.max(Math.sqrt(this.vel.x ** 2 + this.vel.z ** 2), 1);

		if(!this.freeroam)
			this.vel.y = (ground_y - (this.pos.y - 2)) / 1.5;

		this.pos.x += this.vel.x * this.vel.scale / mag;
		this.pos.y += this.vel.y * this.vel.scale;
		this.pos.z += this.vel.z * this.vel.scale / mag;

		this.vel.x *= this.vel.slow;
		this.vel.z *= this.vel.slow;
		if(this.freeroam) this.vel.y *= this.vel.slow;
	}
};


export default Player;
