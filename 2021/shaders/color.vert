#version 300 es
precision mediump float;

in vec4 position;
in vec4 color;

uniform mat4 world_mat;

out vec4 f_color;

void main() {
	gl_Position = position * world_mat;
	f_color = color;
}
