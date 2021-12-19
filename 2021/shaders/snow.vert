#version 300 es
precision mediump float;

in vec4 position;
in vec4 color;

uniform mat4 world_mat;
uniform mat4 mv_mat;
uniform mat4 proj_mat;

uniform float fog_dist;
uniform vec2 player_pos;

out vec4 f_color;

void main() {
	float player_dist = sqrt(pow(player_pos.x - position.x, 2.0) + pow(player_pos.y - position.z, 2.0));

	vec4 res_position = proj_mat * world_mat * mv_mat * position;
	gl_Position = res_position;
	gl_PointSize = 5.0 - player_dist / 1.5;

	f_color = color - player_dist / fog_dist;
}
