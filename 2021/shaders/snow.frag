#version 300 es
precision mediump float;

in float age;
in float y_pos;
in vec4 f_color;
out vec4 out_color;

void main() {
	out_color = f_color;
	out_color.a -= max(1.0 - y_pos / 4.0, 0.0);
}
