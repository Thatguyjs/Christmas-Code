#version 300 es
precision highp float;


uniform sampler2D uImage;
in vec2 vTexCoord;

out vec4 outColor;


void main() {
	outColor = texture(uImage, vTexCoord);
}
