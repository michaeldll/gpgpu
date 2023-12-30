import {
  BufferAttribute,
  BufferGeometry,
  DataTexture,
  FloatType,
  Mesh,
  MeshBasicMaterial,
  NearestFilter,
  PlaneBufferGeometry,
  Points,
  RGBFormat,
  ShaderMaterial,
  Vector2,
} from "three"
import { getRandomData } from "../../../utils"
import AbstractObject from "../../Abstract/AbstractObject"
import GPGPU from "./GPGPU"

type Props = {
  width: number
  height: number
}

export default class Particles extends AbstractObject<any> {
  public points: Points

  private gpgpuProgram: ShaderMaterial
  private gpgpu: GPGPU
  private debugPlane: Mesh

  constructor(context: any, { width, height }: Props) {
    super(context)

    const amount = width * height
    const geometry = new BufferGeometry()
    const positions = new Float32Array(amount * 3)
    const pixelCoords = new Float32Array(amount * 2)

    //populate a Float32Array of random positions
    const scale = 9
    const dataPositions = getRandomData(width, height, scale, 4)

    for (let index = 0; index < width * height + height; index++) {
      pixelCoords[index * 2 + 0] = (index % width) / width
      pixelCoords[index * 2 + 1] = Math.floor(index / height) / height
    }

    geometry.setAttribute("position", new BufferAttribute(positions, 3))
    geometry.setAttribute("pixelCoord", new BufferAttribute(pixelCoords, 2))

    //put it in data texture
    const gpgpuTexture = new DataTexture(dataPositions, width, height, RGBFormat, FloatType)
    gpgpuTexture.magFilter = NearestFilter
    gpgpuTexture.needsUpdate = true

    // GPGPU
    this.gpgpuProgram = new ShaderMaterial({
      vertexShader: /*glsl*/`
      varying vec2 vUv;

      void main() {
        vUv = uv;

        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
      fragmentShader: /*glsl*/`
      uniform sampler2D uFbo;
      uniform sampler2D uInitialTexture;
      uniform float uDeltaTime;
      uniform float uElapsedTime;
      varying vec2 vUv;

      // Simplex 2D noise
      vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

      float snoise(vec2 v){
        const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                -0.577350269189626, 0.024390243902439);
        vec2 i  = floor(v + dot(v, C.yy) );
        vec2 x0 = v -   i + dot(i, C.xx);
        vec2 i1;
        i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;
        i = mod(i, 289.0);
        vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
        + i.x + vec3(0.0, i1.x, 1.0 ));
        vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
          dot(x12.zw,x12.zw)), 0.0);
        m = m*m ;
        m = m*m ;
        vec3 x = 2.0 * fract(p * C.www) - 1.0;
        vec3 h = abs(x) - 0.5;
        vec3 ox = floor(x + 0.5);
        vec3 a0 = x - ox;
        m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
        vec3 g;
        g.x  = a0.x  * x0.x  + h.x  * x0.y;
        g.yz = a0.yz * x12.xz + h.yz * x12.yw;
        return 130.0 * dot(m, g);
      }

      // RNG
      float rand(float n){return fract(sin(n) * 43758.5453123);}

      vec3 getVelocity(vec3 position){
        vec3 velocity = vec3(0.);

        return velocity;
      }

      float rand(vec2 co){
        return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
      }

      float remap(float value, float low1, float high1, float low2, float high2) {
        return low2 + (value - low1) * (high2 - low2) / (high1 - low1);
      }

      void main() {
          // Sample it
          vec4 init = texture2D( uInitialTexture, vUv );
          vec4 data = texture2D( uFbo, vUv );

          // Randomized lifespan
          float lifeSpan = remap(rand(vUv) * 0.01, 0., 1., 0.01, 1.);
          float lifeTime = data.a + uDeltaTime / lifeSpan;

          // Reset it
          if(lifeTime > 1.){
            lifeTime = 0.;
            data.rgb = init.rgb;
          }else {
            // Move it
            data.g += 0.02;
          }

          gl_FragColor = vec4(data.rgb, lifeTime);
      }
      `,
      uniforms: {
        uFbo: { value: null },
        uInitialTexture: { value: gpgpuTexture },
        uDeltaTime: { value: 0 },
        uElapsedTime: { value: 0 },
      },
    })
    const generalPurposeComputationOnGraphicProcessingUnits = new GPGPU({
      renderer: context.renderer,
      size: new Vector2(width, height),
      shader: this.gpgpuProgram,
      initTexture: gpgpuTexture,
    })

    this.gpgpu = generalPurposeComputationOnGraphicProcessingUnits

    // Points
    const pointsMaterial = new ShaderMaterial({
      vertexShader: /*glsl*/`
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
          gl_PointSize = uPointSize / -mvPosition.z; //
        }
      `,
      fragmentShader: /*glsl*/`
        uniform sampler2D uFbo;
        varying vec2 vUv;

        float remap(float value, float low1, float high1, float low2, float high2) {
          return low2 + (value - low1) * (high2 - low2) / (high1 - low1);
        }

        void main() {
          vec4 texel = texture2D(uFbo, vUv);

          // https://www.desultoryquest.com/blog/drawing-anti-aliased-circular-points-using-opengl-slash-webgl/
          // float r = 0.0;
          // vec2 cxy = 2.0 * gl_PointCoord - 1.0;
          // r = dot(cxy, cxy);
          // if (r > 1.0) {
          //     discard;
          // }

          gl_FragColor = vec4(vec3(1.), sin((1. - texel.a) * 3.14159));
          // gl_FragColor = vec4(vec3(1.), 1. - texel.a);
        }
      `,
      uniforms: {
        uPointSize: { value: 16 },
        uOpacity: { value: 1 },
        uFbo: { value: gpgpuTexture },
        uDeltaTime: { value: 0 },
      },
      transparent: true,
    })
    this.points = new Points(geometry, pointsMaterial)
    this.points.frustumCulled = false

    // this.addDebugDataTexture()
  }

  private addDebugDataTexture = () => {
    this.debugPlane = new Mesh(
      new PlaneBufferGeometry(),
      new MeshBasicMaterial({ map: this.gpgpu.outputTexture }),
    )
    this.debugPlane.scale.setScalar(9)
    this.context.scene.add(this.debugPlane)
  }

  public tick = () => {
    // const dt = this.context.clock.getDelta()
    const time = this.context.clock.getElapsedTime()

    if (!this.gpgpu) return

    this.gpgpuProgram.uniforms.uDeltaTime.value = 0.0001
    this.gpgpuProgram.uniforms.uElapsedTime.value = time * 0.5

    const { outputTexture } = this.gpgpu

    this.gpgpu.render()

    {
      const output = this.points
      const material = output.material as ShaderMaterial
      material.uniforms.uFbo.value = outputTexture
    }

    /* Debug texture */
    if (!this.debugPlane) return
    {
      const material = this.debugPlane.material as MeshBasicMaterial
      material.map = outputTexture
    }
  }
}
