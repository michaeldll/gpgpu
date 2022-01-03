import vertexShader from './vertex.vert?raw'
import fragmentShader from './frag.frag?raw'

import { BoxBufferGeometry, Color, Mesh, ShaderMaterial } from 'three'
import { MainSceneContext } from '../../webgl/Scenes/VoronoiScene'

export default class Wall {
  output: Mesh
  constructor(context: MainSceneContext) {
    const geometry = new BoxBufferGeometry()
    const uniforms = {
      uColor: { value: new Color("green") }
    }
    const program = new ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
    })
    this.output = new Mesh(geometry, program)
  }
}