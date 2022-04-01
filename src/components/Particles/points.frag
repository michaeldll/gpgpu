uniform float uOpacity;
uniform sampler2D uFbo;
varying vec2 vUv;

void main() {
  vec4 texel = texture2D(uFbo, vUv);
  // float dist = distance(vUv, vec2(0.5));
  // gl_FragColor = vec4(vec3(dist), dist);

  // https://www.desultoryquest.com/blog/drawing-anti-aliased-circular-points-using-opengl-slash-webgl/
  float r = 0.0, delta = 0.0, alpha = 1.0;
  vec2 cxy = 2.0 * gl_PointCoord - 1.0;
  r = dot(cxy, cxy);
  if (r > 1.0) {
      discard;
  }

  gl_FragColor = vec4(vec3(1.), texel.a);
}