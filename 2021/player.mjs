import Ground from "./ground.mjs";


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

	pos: { x: 0, y: 0, z: 0 },
	camera_pos: { x: 0, y: 0, z: 0 }, // Loop camera x and z
	vel: { x: 0, y: 0, z: 0, scale: 0.1, slow: 0.8 },
	rot: { x: 0, y: 0, scale: 0.1 * Math.PI / 180, min_y: -90 * Math.PI / 180, max_y: 90 * Math.PI / 180 },

	keys: 0, // Key bitmap

	init() {
		register_movement_keys({
			'KeyW': Player.FORWARD,
			'KeyS': Player.BACKWARD,
			'KeyA': Player.LEFT,
			'KeyD': Player.RIGHT
		});

		window.addEventListener('mousemove', (ev) => {
			this.rot.x = (this.rot.x - ev.movementX * this.rot.scale) % (Math.PI * 2);
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

		const mag = Math.max(Math.sqrt(this.vel.x ** 2 + this.vel.z ** 2), 1);

		this.vel.y = ground_y - (this.pos.y - 2);

		this.pos.x += this.vel.x * this.vel.scale / mag;
		this.pos.y += this.vel.y * this.vel.scale;
		this.pos.z += this.vel.z * this.vel.scale / mag;

		this.camera_pos.x = this.pos.x % 1;
		this.camera_pos.y = this.pos.y;
		this.camera_pos.z = this.pos.z % 1;

		this.vel.x *= this.vel.slow;
		this.vel.z *= this.vel.slow;
	}
};


export default Player;
