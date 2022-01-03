uniform sampler2D uTexture;

varying vec2 vUv;

void main() {
  vec4 texture = texture2D( uTexture, vUv);
  vec3 color = texture.rgb;
  // vec3 color = vec3(0);

  gl_FragColor = vec4(color, 1.);
}