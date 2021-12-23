#version 300 es
precision mediump float;

in vec4 position;
in vec4 color;

uniform mat4 world_mat;
uniform mat4 mv_mat;
uniform mat4 proj_mat;

out vec4 f_color;

void main() {
	gl_Position = proj_mat * world_mat * mv_mat * position;
	f_color = color;
}
