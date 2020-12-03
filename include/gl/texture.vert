#version 300 es


in vec4 aVertexPosition;
in vec2 aTexCoord;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

out vec2 vTexCoord;

void main() {
	gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;

	vTexCoord = aTexCoord;
}
