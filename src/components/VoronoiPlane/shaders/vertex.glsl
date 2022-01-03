// varying vec3 vNormal;
varying vec2 vUv;
uniform sampler2D uDisplacementMap;
uniform float uDisplacementScale; 
uniform float uDisplacementOffset;
uniform vec2 uDistanceTarget;

float remap(float value, float start1, float stop1, float start2, float stop2) {
  return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
}
float cremap(float value, float start1, float stop1, float start2, float stop2) {
  return remap(clamp(value, start1, stop1), start1, stop1, start2, stop2);
}

void main() {
  // vNormal = normalize(normalMatrix * normal);
  vUv = uv;

  vec4 texel = texture2D( uDisplacementMap, vUv);
  float offset = texel.x * uDisplacementScale + uDisplacementOffset * (1.-distance(uv, uDistanceTarget));
  vec3 target = normalize(normalMatrix * normal) * offset;
  vec3 transformed = vec3(target);
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position+transformed, 1.0);
}