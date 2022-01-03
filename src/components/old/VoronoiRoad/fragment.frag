precision highp float;
uniform vec3 uBaseColor;
uniform vec3 uLineColor;
uniform float uLineLengthFactor;
varying vec2 vUv;

void main(){
  const float SIDEWALK_SIZE = 0.3;
  const float LINE_LENGTH = 0.4;

  float nearSidewalk = step(0. + SIDEWALK_SIZE, vUv.y);
  float farSidewalk = step(1. - SIDEWALK_SIZE, vUv.y);
  float fullWidthLine = step(fract(vUv.x * 10.), 1. - LINE_LENGTH * uLineLengthFactor);
  float dottedLine = nearSidewalk - farSidewalk - fullWidthLine;
  dottedLine = clamp(dottedLine, 0., 1.); // Prevents colors from going crazy

  vec3 mixed = mix(uBaseColor, uLineColor, dottedLine);

  gl_FragColor = vec4(mixed, 1.);
  // gl_FragColor = vec4(vec3(vec2(vUv.x, 0.), 0.), 1.);
}