import {
  Mesh,
  ShaderMaterial,
  Vector2,
  Color,
  PlaneBufferGeometry,
  IcosahedronBufferGeometry,
} from "three"
import { MainSceneContext } from "../../webgl/Scenes/VoronoiScene"
import AbstractObject from "../../webgl/Abstract/AbstractObject"
import FullscreenRenderTarget from "../FullscreenRenderTarget"

import vertexShader from "./shaders/vertex.glsl?raw"
import fragmentShader from "./shaders/fragment.glsl?raw"

import renderTargetVertex from "./shaders/renderTargetVertex.glsl?raw"
import renderTargetFragment from "./shaders/renderTargetFragment.glsl?raw"

export type VoronoiParameters = {
  scale: Vector2
  color: Color
  borderColor: Color
  distanceTarget: Vector2
  displacementOffset: number
  displacementScale: number
  timeScalar: number
}

export default class VoronoiPlane extends AbstractObject<MainSceneContext> {
  public material: ShaderMaterial
  public renderTargetMaterial: ShaderMaterial
  public renderTarget: FullscreenRenderTarget
  private parameters: VoronoiParameters

  constructor(context: MainSceneContext, parameters: VoronoiParameters) {
    super(context)
    this.parameters = parameters

    this.renderTargetMaterial = new ShaderMaterial({
      vertexShader: renderTargetVertex,
      fragmentShader: renderTargetFragment,
      uniforms: {
        uTime: { value: 0 },
        uUvScale: { value: parameters.scale },
        uColor: { value: parameters.color },
        uBorderColor: { value: parameters.borderColor },
      },
    })
    this.renderTarget = new FullscreenRenderTarget(context, this.renderTargetMaterial)

    const scaleFactor = 0.35

    const geometry = new PlaneBufferGeometry(
      this.context.viewport.width * scaleFactor,
      this.context.viewport.height * scaleFactor,
      100,
      100,
    )
    // const geometry = new IcosahedronBufferGeometry(0.1, 100)
    this.material = new ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uDisplacementMap: { value: this.renderTarget.target.texture },
        uTime: { value: 0 },
        uDisplacementOffset: { value: parameters.displacementOffset },
        uDisplacementScale: { value: parameters.displacementScale },
        uDistanceTarget: { value: parameters.distanceTarget },
      },
    })
    this.output = new Mesh(geometry, this.material)
  }

  tick = () => {
    this.renderTarget.tick()
    this.renderTargetMaterial.uniforms.uTime.value =
      this.context.clock.getElapsedTime() * this.parameters.timeScalar
  }
}
