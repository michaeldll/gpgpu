import {
  BufferAttribute,
  BufferGeometry,
  DataTexture,
  FloatType,
  Mesh,
  NearestFilter,
  Points,
  RGBFormat,
  ShaderMaterial,
  TextureLoader,
  Vector2,
} from "three"
import { getRandomData } from "../../utils"
import AbstractObject from "../../webgl/Abstract/AbstractObject"
import { MainSceneContext } from "../../webgl/Scenes/VoronoiScene"
import GPGPU from "./GPGPU"

import gpgpuVert from "./GPGPU/gpgpu.vert?raw"
import gpgpuFrag from "./GPGPU/gpgpu.frag?raw"
import pointsVert from "./points.vert?raw"
import pointsFrag from "./points.frag?raw"

export default class Particles extends AbstractObject<MainSceneContext> {
  gpgpuProgram: ShaderMaterial
  generalPurposeComputationOnGraphicProcessingUnits: GPGPU
  debugPlane: Mesh

  constructor(context: MainSceneContext) {
    super(context)

    const width = 256
    const height = 256

    const amount = width * height
    const geometry = new BufferGeometry()
    const positions = new Float32Array(amount * 3)
    const pixelCoords = new Float32Array(amount * 2)

    for (let index = 0; index < width * height + height; index++) {
      positions[index * 3 + 0] = Math.random() * 2 - 1
      positions[index * 3 + 1] = Math.random() * 2 - 1
      positions[index * 3 + 2] = Math.random()

      pixelCoords[index * 2 + 0] = (index % width) / width
      pixelCoords[index * 2 + 1] = Math.floor(index / height) / height
    }

    geometry.setAttribute("position", new BufferAttribute(positions, 3))
    geometry.setAttribute("pixelCoord", new BufferAttribute(pixelCoords, 2))

    //populate a Float32Array of random positions
    const dataPositions = getRandomData(width, height, 60)

    //put it in data texture
    const positionsTexture = new DataTexture(dataPositions, width, height, RGBFormat, FloatType)
    positionsTexture.magFilter = NearestFilter
    positionsTexture.needsUpdate = true

    // GPGPU
    this.gpgpuProgram = new ShaderMaterial({
      vertexShader: gpgpuVert,
      fragmentShader: gpgpuFrag,
      uniforms: {
        uFbo: { value: null },
        uInitialTexture: { value: positionsTexture },
        uDeltaTime: { value: 0 },
        uElapsedTime: { value: 0 },
      },
    })
    const gpgpu = new GPGPU({
      renderer: context.renderer,
      size: new Vector2(width, height),
      shader: this.gpgpuProgram,
      initTexture: positionsTexture,
    })

    this.generalPurposeComputationOnGraphicProcessingUnits = gpgpu

    // Points
    const pointsMaterial = new ShaderMaterial({
      vertexShader: pointsVert,
      fragmentShader: pointsFrag,
      uniforms: {
        uPointSize: { value: 28 },
        uOpacity: { value: 1 },
        uFbo: { value: positionsTexture },
        uDeltaTime: { value: 0 },
      },
      transparent: true,
    })
    this.output = new Points(geometry, pointsMaterial)
    this.output.frustumCulled = false

    /* Debug texture */
    // this.debugPlane = new Mesh(new PlaneBufferGeometry(), new MeshBasicMaterial({ map: positionsTexture }))
    // this.debugPlane = new Mesh(new PlaneBufferGeometry(), new MeshBasicMaterial({ map: gpgpu.outputTexture }))
    // context.scene.add(this.debugPlane)
  }

  tick = () => {
    // const dt = this.context.clock.getDelta()
    const time = this.context.clock.getElapsedTime()

    if (!this.generalPurposeComputationOnGraphicProcessingUnits) return

    this.gpgpuProgram.uniforms.uDeltaTime.value = 0.0001
    this.gpgpuProgram.uniforms.uElapsedTime.value = time * 0.5

    const { outputTexture } = this.generalPurposeComputationOnGraphicProcessingUnits

    this.generalPurposeComputationOnGraphicProcessingUnits.render()

    /* Debug texture */
    // {
    //   const material = this.debugPlane.material as MeshBasicMaterial
    //   material.map = outputTexture
    // }

    {
      const output = this.output as Points
      const material = output.material as ShaderMaterial
      material.uniforms.uFbo.value = outputTexture
    }
  }
}
