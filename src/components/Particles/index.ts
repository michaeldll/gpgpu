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
import { getRandomData } from "../../utils"
import AbstractObject from "../../webgl/Abstract/AbstractObject"
import GPGPU from "./GPGPU"

import gpgpuVert from "./GPGPU/gpgpu.vert?raw"
import gpgpuFrag from "./GPGPU/gpgpu.frag?raw"
import pointsVert from "./points.vert?raw"
import pointsFrag from "./points.frag?raw"

export default class Particles extends AbstractObject<any> {
  gpgpuProgram: ShaderMaterial
  gpgpu: GPGPU
  debugPlane: Mesh

  constructor(context: any) {
    super(context)

    const width = 256
    const height = 256

    const amount = width * height
    const geometry = new BufferGeometry()
    const positions = new Float32Array(amount * 3)
    const pixelCoords = new Float32Array(amount * 2)

    //populate a Float32Array of random positions
    const size = 24
    const dataPositions = getRandomData(width, height, size, 4)

    for (let index = 0; index < width * height + height; index++) {
      positions[index * 3 + 0] = Math.random() * 2 - 1
      positions[index * 3 + 1] = Math.random() * 2 - 1
      positions[index * 3 + 2] = Math.random()

      dataPositions[index * 3 + 1] *= 0.5

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
      vertexShader: gpgpuVert,
      fragmentShader: gpgpuFrag,
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
      vertexShader: pointsVert,
      fragmentShader: pointsFrag,
      uniforms: {
        uPointSize: { value: 16 },
        uOpacity: { value: 1 },
        uFbo: { value: gpgpuTexture },
        uDeltaTime: { value: 0 },
      },
      transparent: true,
    })
    this.output = new Points(geometry, pointsMaterial)
    this.output.frustumCulled = false

    // this.debug()
  }

  debug = () => {
    this.debugPlane = new Mesh(
      new PlaneBufferGeometry(),
      new MeshBasicMaterial({ map: this.gpgpu.outputTexture }),
    )
    this.debugPlane.scale.setScalar(9)
    this.context.scene.add(this.debugPlane)
  }

  tick = () => {
    // const dt = this.context.clock.getDelta()
    const time = this.context.clock.getElapsedTime()

    if (!this.gpgpu) return

    this.gpgpuProgram.uniforms.uDeltaTime.value = 0.0001
    this.gpgpuProgram.uniforms.uElapsedTime.value = time * 0.5

    const { outputTexture } = this.gpgpu

    this.gpgpu.render()

    {
      const output = this.output as Points
      const material = output.material as ShaderMaterial
      material.uniforms.uFbo.value = outputTexture
    }

    /* Debug texture */
    if(!this.debugPlane) return
    {
      const material = this.debugPlane.material as MeshBasicMaterial
      material.map = outputTexture
    }
  }
}
