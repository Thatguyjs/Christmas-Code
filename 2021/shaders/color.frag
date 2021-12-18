#version 300 es
precision mediump float;

in vec4 f_color;
in float vert_dist;

uniform float fog_dist;
uniform float viewport_width;

out vec4 out_color;

void main() {
	float fog_offset = abs(gl_FragCoord.x / viewport_width - 0.5);
	out_color = vec4(f_color.rgb * (f_color.a - (vert_dist + fog_offset * 10.0) / fog_dist), 1.0);

	// out_color = f_color;
}
