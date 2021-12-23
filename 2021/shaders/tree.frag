#version 300 es
precision mediump float;

in vec3 f_color;
in float vert_dist;

uniform float fog_dist;
uniform vec3 fog_color;

out vec4 out_color;


float lerp(float start, float stop, float amt) {
	return (stop - start) * amt + start;
}

vec3 lerp3(vec3 start, vec3 stop, float amt) {
	return vec3(
		lerp(start.x, stop.x, amt),
		lerp(start.y, stop.y, amt),
		lerp(start.z, stop.z, amt)
	);
}


void main() {
	out_color = vec4(lerp3(f_color, fog_color, min(pow(vert_dist / fog_dist, 4.0), 1.0)), 1.0);
}
