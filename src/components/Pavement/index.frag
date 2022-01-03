precision highp float;

uniform sampler2D uTexture;
uniform bool uRenderDepth;

varying vec2 vHighPrecisionZW;
varying vec2 vUv;

void main() {
  vec2 scaled = vec2(15.);
  vec4 texture = texture2D( uTexture, vUv * scaled );
	float fragCoordZ = 0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5;
  vec3 depth = vec3(1.0 - fragCoordZ );
  vec3 mat = texture.rgb;

  gl_FragColor = vec4(uRenderDepth ? depth : mat, 1.);
}