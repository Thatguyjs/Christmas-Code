#version 300 es
precision mediump float;


uniform mat4 proj_mat;
uniform mat4 mv_mat;

in vec4 position;

void main() {
	// TODO: Apply matrix transformations
	gl_Position = position;
}
