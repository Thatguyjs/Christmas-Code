#version 300 es
precision mediump float;


in vec4 f_color;
out vec4 color;

void main() {
	if(int(gl_FragCoord.x) % 3 == 0 && int(gl_FragCoord.y) % 3 == 0) {
		vec4 mod_color = vec4(f_color.rgb * 14.0, 14.0);
		ivec4 dithered = ivec4(mod_color);

		color = vec4(dithered) / 14.0;
	}
	else {
		color = f_color;
	}
}
