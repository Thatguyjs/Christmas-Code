#version 300 es
precision mediump float;

in vec4 position;
in vec4 color;
in float age;

uniform mat4 world_mat;
uniform mat4 mv_mat;
uniform mat4 proj_mat;

uniform float fog_dist;
uniform vec2 player_pos;

out vec4 f_color;
out float y_pos;

void main() {
	float player_dist = sqrt(pow(player_pos.x - position.x, 2.0) + pow(player_pos.y - position.z, 2.0));

	gl_Position = proj_mat * world_mat * mv_mat * position;
	gl_PointSize = 5.0 - player_dist / 1.5;

	f_color = color - player_dist / fog_dist;
	f_color.a = min(age / 200.0, 1.0);
	y_pos = position.y;
}
