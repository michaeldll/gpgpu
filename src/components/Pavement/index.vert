uniform float uLogDepthBufFC;

varying vec2 vHighPrecisionZW;
varying vec2 vUv;

#define EPSILON 1e-6

void main() {
  vec3 transformed = vec3( position );
  vec4 mvPosition = vec4( transformed, 1.0 );

  mvPosition = viewMatrix * modelMatrix * mvPosition;
  gl_Position = projectionMatrix * mvPosition;

  // THREEJS DEPTH MATERIAL https://github.com/mrdoob/three.js/blob/master/src/renderers/shaders/ShaderLib/depth.glsl.js
  gl_Position.z = log2( max( EPSILON, gl_Position.w + 1.0 ) ) * uLogDepthBufFC - 1.0;
  gl_Position.z *= gl_Position.w;
	vHighPrecisionZW = gl_Position.zw;
  vUv = uv;
}