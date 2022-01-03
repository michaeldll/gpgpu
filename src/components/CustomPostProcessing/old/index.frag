precision highp float;
// Default uniform for previous pass is 'tMap'.
// Can change this using the 'textureUniform' property
// when adding a pass.
uniform sampler2D uMap;
uniform sampler2D uDepth;
uniform sampler2D uWatercolorOne;
uniform sampler2D uPaper;
uniform float uTime;
uniform vec2 uResolution;

varying vec2 vUv;

float exponentialIn(float t) {
  return t == 0.0 ? t : pow(2.0, 10.0 * (t - 1.0));
}

vec2 rotateUV(vec2 uv, float rotation) {
    float mid = 0.5;
    float cosAngle = cos(rotation);
    float sinAngle = sin(rotation);
    return vec2(cosAngle * (uv.x - mid) + sinAngle * (uv.y - mid) + mid, cosAngle * (uv.y - mid) - sinAngle * (uv.x - mid) + mid);
}

vec2 rotateUV(vec2 uv, float rotation, vec2 mid) {
    float cosAngle = cos(rotation);
    float sinAngle = sin(rotation);
    return vec2(cosAngle * (uv.x - mid.x) + sinAngle * (uv.y - mid.y) + mid.x, cosAngle * (uv.y - mid.y) - sinAngle * (uv.x - mid.x) + mid.y);
}

vec2 rotateUV(vec2 uv, float rotation, float mid) {
    float cosAngle = cos(rotation);
    float sinAngle = sin(rotation);
    return vec2(cosAngle * (uv.x - mid) + sinAngle * (uv.y - mid) + mid, cosAngle * (uv.y - mid) - sinAngle * (uv.x - mid) + mid);
}

// Simplex 2D noise
//
vec3 permute(vec3 x) {
    return mod(((x * 34.0) + 1.0) * x, 289.0);
}
float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod(i, 289.0);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
    m = m * m;
    m = m * m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
}
float getNoise(float frequency, float amplitude) {
    return snoise(vec2(gl_FragCoord.x, gl_FragCoord.y) * frequency * uTime) * amplitude;
}

// Screen blend mode
//
float blendScreen(float base, float blend) {
    return 1.0 - ((1.0 - base) * (1.0 - blend));
}
vec3 blendScreen(vec3 base, vec3 blend) {
    return vec3(blendScreen(base.r, blend.r), blendScreen(base.g, blend.g), blendScreen(base.b, blend.b));
}
vec3 blendScreen(vec3 base, vec3 blend, float opacity) {
    return (blendScreen(base, blend) * opacity + base * (1.0 - opacity));
}

vec4 watercolor(vec4 inputFrame, sampler2D tex, vec2 uv, float noise) {
    float colorAverage = (inputFrame.x + inputFrame.y + inputFrame.z) / 3.;
    vec2 rotatedUv = rotateUV(uv, colorAverage * 10.);
    rotatedUv.x += colorAverage * 0.1;
    rotatedUv.y += colorAverage * 0.1;

    // vec4 texel = texture2D(tex, rotatedUv);
    vec4 texel = texture2D(tex, uv);
    vec3 blended = blendScreen(texel.xyz, inputFrame.xyz);
    // vec3 noiseBlended = blendScreen(blended.xyz, vec3(noise));

    return vec4(blended, 1.);
}

float getEdge(sampler2D texture, vec2 uv) {
  vec2 texel = vec2( 0.5 / uResolution.x, 0.5 / uResolution.y );
  // kernel definition (in glsl matrices are filled in column-major order)
  const mat3 Gx = mat3( -1, -2, -1, 0, 0, 0, 1, 2, 1 ); // x direction kernel
  const mat3 Gy = mat3( -1, 0, 1, -2, 0, 2, -1, 0, 1 ); // y direction kernel
  // fetch the 3x3 neighbourhood of a fragment
  // first column
  float tx0y0 = exponentialIn(1.5 * texture2D( texture, uv + texel * vec2( -1, -1 ) ).r);
  float tx0y1 = exponentialIn(1.5 * texture2D( texture, uv + texel * vec2( -1,  0 ) ).r);
  float tx0y2 = exponentialIn(1.5 * texture2D( texture, uv + texel * vec2( -1,  1 ) ).r);
  // second column
  float tx1y0 = exponentialIn(1.5 * texture2D( texture, uv + texel * vec2(  0, -1 ) ).r);
  float tx1y1 = exponentialIn(1.5 * texture2D( texture, uv + texel * vec2(  0,  0 ) ).r);
  float tx1y2 = exponentialIn(1.5 * texture2D( texture, uv + texel * vec2(  0,  1 ) ).r);
  // third column
  float tx2y0 = exponentialIn(1.5 * texture2D( texture, uv + texel * vec2(  1, -1 ) ).r);
  float tx2y1 = exponentialIn(1.5 * texture2D( texture, uv + texel * vec2(  1,  0 ) ).r);
  float tx2y2 = exponentialIn(1.5 * texture2D( texture, uv + texel * vec2(  1,  1 ) ).r);
  // gradient value in x direction
  float valueGx = Gx[0][0] * tx0y0 + Gx[1][0] * tx1y0 + Gx[2][0] * tx2y0 +
    Gx[0][1] * tx0y1 + Gx[1][1] * tx1y1 + Gx[2][1] * tx2y1 +
    Gx[0][2] * tx0y2 + Gx[1][2] * tx1y2 + Gx[2][2] * tx2y2;
  // gradient value in y direction
  float valueGy = Gy[0][0] * tx0y0 + Gy[1][0] * tx1y0 + Gy[2][0] * tx2y0 +
    Gy[0][1] * tx0y1 + Gy[1][1] * tx1y1 + Gy[2][1] * tx2y1 +
    Gy[0][2] * tx0y2 + Gy[1][2] * tx1y2 + Gy[2][2] * tx2y2;
  // magnitute of the total gradient
  return sqrt( ( valueGx * valueGx ) + ( valueGy * valueGy ) );
}

void main() {
  float G = getEdge(uDepth, vUv);
  vec4 raw = texture2D(uMap, vUv);
  vec2 screenUv = (gl_FragCoord.xy / uResolution.x) * 10.;
  vec3 watercolor = watercolor(raw, uWatercolorOne, vUv, getNoise(0.3, 0.8)).rgb;
  vec3 paperColor = texture2D(uPaper, screenUv).rgb;
  vec3 color = watercolor;
  color = mix(color, vec3(0.), G);
  color *= paperColor;
  // Split screen in half to show side-by-side comparison
  // gl_FragColor = mix(raw, watercolor, step(0.5, vUv.x));
  gl_FragColor = vec4(color, 1.);
  // gl_FragColor = vec4(vec3(G), 1.);

  // vec4 texel = texture2D(uWatercolorOne, vUv);
  // gl_FragColor = texel;
  // Darken left side a tad for clarity
  // gl_FragColor -= step(vUv.x, 0.5) * 0.1;
}