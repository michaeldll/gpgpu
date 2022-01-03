uniform sampler2D uDisplacementMap;
varying vec2 vUv;

void main() {
  vec4 texel = texture2D( uDisplacementMap, vUv);
  gl_FragColor = texel;
}
