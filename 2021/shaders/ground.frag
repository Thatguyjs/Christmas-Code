#version 300 es
precision mediump float;

in vec3 f_pos;
in vec3 f_color;
in float vert_dist;

uniform float fog_dist;
uniform vec3 fog_color;

out vec4 out_color;


// rand() and noise() from https://gist.github.com/patriciogonzalezvivo/670c22f3966e662d2f83
float rand(vec2 n) { 
	return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
}

float noise(vec2 p) {
	vec2 ip = floor(p);
	vec2 u = fract(p);
	u = u * u * (3.0 - 2.0 * u);

	float res = mix(
		mix(rand(ip), rand(ip + vec2(1.0, 0.0)), u.x),
		mix(rand(ip + vec2(0.0, 1.0)), rand(ip + vec2(1.0, 1.0)), u.x),
		u.y
	);

	return res * res;
}


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

	if(noise(f_pos.xz * 50.0) + f_pos.y / 24.0 > 0.9) {
		out_color.rgb *= 1.0 + 0.4 * min(pow(vert_dist, 2.0) / 20.0, 1.0);
	}
}
