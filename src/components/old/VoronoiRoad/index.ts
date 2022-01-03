import { PlaneBufferGeometry, ShaderMaterial, Mesh, Color } from "three";
import vertexShader from './vertex.vert?raw'
import fragmentShader from './fragment.frag?raw'
import { MainSceneContext } from "../../webgl/Scenes/VoronoiScene";

export default class VoronoiRoad {
  context: MainSceneContext
  output: Mesh

  constructor(context: MainSceneContext, length: number) {
    this.context = context
    const geometry = new PlaneBufferGeometry()
    const uniforms = {
      uBaseColor: { value: new Color('#000') },
      uLineColor: { value: new Color('#fff') },
      uLineLengthFactor: { value: 1 - (length * 0.02) }
    }
    const program = new ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms
    })
    this.output = new Mesh(geometry, program)
  }
}