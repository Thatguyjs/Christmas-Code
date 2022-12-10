#version 300 es
precision mediump float;


uniform mat4 proj_mat;
uniform mat4 model_mat;
uniform mat4 view_mat;

in vec4 position;

in vec4 color;
out vec4 f_color;

void main() {
	gl_Position = proj_mat * view_mat * model_mat * position;
	f_color = color;
}
