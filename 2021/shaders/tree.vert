#version 300 es
precision mediump float;

in vec4 position;
in vec4 color;

uniform mat4 world_mat;
uniform mat4 mv_mat;
uniform mat4 proj_mat;

uniform vec2 player_pos;

out vec3 f_color;
out float vert_dist;

float dist(vec2 v1, vec2 v2) {
	return sqrt(pow(v1.x - v2.x, 2.0) + pow(v1.y - v2.y, 2.0));
}

void main() {
	gl_Position = proj_mat * world_mat * mv_mat * position;

	f_color = color.rgb;
	vert_dist = dist(player_pos, position.xz);
}
