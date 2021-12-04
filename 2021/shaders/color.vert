#version 300 es
precision mediump float;

in vec4 position;
in vec4 color;

out vec4 f_color;

void main() {
	gl_Position = position;
	f_color = color;
}
