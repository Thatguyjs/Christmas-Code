#version 300 es
precision mediump float;

in vec4 position;
in vec4 color;

uniform mat4 proj_mat;
uniform mat4 model_mat;

out vec4 f_color;

void main() {
	gl_Position = position * proj_mat * model_mat;
	f_color = color;
}
