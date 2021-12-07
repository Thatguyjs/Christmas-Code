import Ground from "./ground.mjs";


function polar_to_cart(radius, angle) {
	return [
		Math.cos(angle) * radius,
		Math.sin(angle) * radius
	];
}


const canvas = document.getElementById('cnv');
const gl = canvas.getContext('webgl2');

twgl.resizeCanvasToDisplaySize(canvas);

const uniforms = {
	proj_mat: twgl.m4.perspective(70 * Math.PI / 180, canvas.width / canvas.height, 0.01, 100),
	model_mat: twgl.m4.identity()
};

// twgl.m4.translate(uniforms.proj_mat, [0, 0, -5], uniforms.proj_mat);
twgl.m4.translate(uniforms.model_mat, [0, 0, -5], uniforms.model_mat);

await Ground.init(gl, 2, 2);

let rotation = 0;
let p_rotation = 0;
let speed = 0.1;
let keys = { forward: false, backward: false, left: false, right: false, up: false, down: false };

gl.clearColor(0.01, 0.01, 0.01, 1);
gl.enable(gl.DEPTH_TEST);
gl.enable(gl.BLEND);
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

function render() {
	twgl.resizeCanvasToDisplaySize(canvas);
	gl.viewport(0, 0, canvas.width, canvas.height);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);



	// apply_movement();
	Ground.update(gl);
	Ground.render(gl, uniforms);

	twgl.m4.rotateY(uniforms.model_mat, 0.01, uniforms.model_mat);

	window.requestAnimationFrame(render);
}

window.requestAnimationFrame(render);


window.addEventListener('click', () => {
	canvas.requestPointerLock();
});

window.addEventListener('mousemove', (ev) => {
	rotation += ev.movementX;
	// twgl.m4.rotateY(uniforms.model_mat, (rotation - p_rotation) * Math.PI / 180, uniforms.model_mat);
	p_rotation = rotation;
});

function apply_movement() {
	if(keys.forward)
		twgl.m4.translate(uniforms.proj_mat, [0, 0, speed], uniforms.proj_mat);
	if(keys.backward)
		twgl.m4.translate(uniforms.proj_mat, [0, 0, -speed], uniforms.proj_mat);
	if(keys.left)
		twgl.m4.translate(uniforms.proj_mat, [-speed, 0, 0], uniforms.proj_mat);
	if(keys.right)
		twgl.m4.translate(uniforms.proj_mat, [speed, 0, 0], uniforms.proj_mat);

	if(keys.up)
		twgl.m4.translate(uniforms.proj_mat, [0, speed, 0], uniforms.proj_mat);
	if(keys.down)
		twgl.m4.translate(uniforms.proj_mat, [0, -speed, 0], uniforms.proj_mat);
}

window.addEventListener('keydown', (ev) => {
	switch(ev.code) {
		case 'KeyW':
			keys.forward = true;
			break;
		case 'KeyS':
			keys.backward = true;
			break;
		case 'KeyA':
			keys.left = true;
			break;
		case 'KeyD':
			keys.right = true;
			break;
		case 'Space':
			keys.up = true;
			break;
		case 'ControlLeft':
			keys.down = true;
			break;
	}
});

window.addEventListener('keyup', (ev) => {
	switch(ev.code) {
		case 'KeyW':
			keys.forward = false;
			break;
		case 'KeyS':
			keys.backward = false;
			break;
		case 'KeyA':
			keys.left = false;
			break;
		case 'KeyD':
			keys.right = false;
			break;
		case 'Space':
			keys.up = false;
			break;
		case 'ControlLeft':
			keys.down = false;
			break;
	}
});
