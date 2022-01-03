attribute vec2 pixelCoord;
uniform float uPointSize; 
uniform sampler2D uFbo;
varying vec2 vUv;

void main() { 
  vec3 offset = texture2D(uFbo, pixelCoord).xyz;
  vec4 mvPosition = modelViewMatrix * vec4(position + offset, 1.0);
  vUv = pixelCoord;
  gl_Position = projectionMatrix * mvPosition;
  gl_PointSize = uPointSize;
  gl_PointSize = uPointSize / -mvPosition.z;
}