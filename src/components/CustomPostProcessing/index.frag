precision highp float;
// Default uniform for previous pass is 'tMap'.
// Can change this using the 'textureUniform' property
// when adding a pass.
uniform sampler2D uMap;
uniform sampler2D uDepth;
uniform sampler2D uWatercolor;
uniform sampler2D uPaper;
uniform vec2 uResolution;
uniform vec2 uFbmScale;
uniform float uFbmAmount;
uniform float uWatercolorOpacity;

varying vec2 vUv;

float random (in vec2 st) {
  return fract(sin(dot(st.xy,
                        vec2(12.9898,78.233)))*
      43758.5453123);
}

// Based on Morgan McGuire @morgan3d
// https://www.shadertoy.com/view/4dS3Wd
float noise (in vec2 st) {
  vec2 i = floor(st);
  vec2 f = fract(st);

  // Four corners in 2D of a tile
  float a = random(i);
  float b = random(i + vec2(1.0, 0.0));
  float c = random(i + vec2(0.0, 1.0));
  float d = random(i + vec2(1.0, 1.0));

  vec2 u = f * f * (3.0 - 2.0 * f);

  return mix(a, b, u.x) +
          (c - a)* u.y * (1.0 - u.x) +
          (d - b) * u.x * u.y;
}

#define OCTAVES 6
float fbm (in vec2 st) {
  // Initial values
  float value = 0.0;
  float amplitude = .5;
  float frequency = 0.;
  //
  // Loop of octaves
  for (int i = 0; i < OCTAVES; i++) {
      value += amplitude * noise(st);
      st *= 2.;
      amplitude *= .5;
  }
  return value;
}

float blendScreen(float base, float blend) {
    return 1.0 - ((1.0 - base) * (1.0 - blend));
}
vec3 blendScreen(vec3 base, vec3 blend) {
    return vec3(blendScreen(base.r, blend.r), blendScreen(base.g, blend.g), blendScreen(base.b, blend.b));
}
vec3 blendScreen(vec3 base, vec3 blend, float opacity) {
    return (blendScreen(base, blend) * opacity + base * (1.0 - opacity));
}


   
float blendOverlay(float base, float blend) {
	return base<0.5?(2.0*base*blend):(1.0-2.0*(1.0-base)*(1.0-blend));
}

vec3 blendOverlay(vec3 base, vec3 blend) {
	return vec3(blendOverlay(base.r,blend.r),blendOverlay(base.g,blend.g),blendOverlay(base.b,blend.b));
}

vec3 blendOverlay(vec3 base, vec3 blend, float opacity) {
	return (blendOverlay(base, blend) * opacity + base * (1.0 - opacity));
}


float remap(float value, float low1, float high1, float low2, float high2) {
  return low2 + (value - low1) * (high2 - low2) / (high1 - low1);
}
float exponentialIn(float t) {
  return t == 0.0 ? t : pow(2.0, 10.0 * (t - 1.0));
}

void main() {
  float d = texture2D(uDepth, vUv).r;
  float noiseScale = remap(d, 0.3, 1., uFbmScale.x, uFbmScale.y);
  // uFbmScale : 20
  float x = remap(fbm(vUv * noiseScale), 0., 1., - uFbmAmount / 2., uFbmAmount / 2.);
  float y = remap(fbm(vUv * noiseScale), 0., 1., - uFbmAmount / 2., uFbmAmount / 2.);
  // uFbmAmount : 0.015
  vec4 raw = texture2D(uMap, vUv + vec2(x, y));

  vec2 screenUv = (gl_FragCoord.xy / uResolution.x) * 6.;
  vec3 paperColor = texture2D(uPaper, screenUv).rgb;
  vec3 watercolor = texture2D(uWatercolor, vUv).rgb;
  // vec3 color = blendScreen(watercolor, raw.rgb);
  vec3 color = raw.rgb;
  color = blendOverlay(color, watercolor, uWatercolorOpacity);
  // vec3 color = raw.rgb * (texture2D(uWatercolor, vUv).rgb + 0.5);

  color *= paperColor;
  // color = vec3(d);
  gl_FragColor = vec4(color, 1.);
}