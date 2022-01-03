import vertexShader from "./index.vert?raw"
import fragmentShader from "./index.frag?raw"
import AbstractObject from "../../webgl/Abstract/AbstractObject"
import greyTiles from '../../assets/images/grey-tiles.jpg'
import { Mesh, Object3D, RepeatWrapping, ShaderMaterial, TextureLoader } from "three"
import { MainSceneContext } from "../../webgl/Scenes/VoronoiScene"

export default class Pavement extends AbstractObject<MainSceneContext> {
  constructor(context: MainSceneContext, scene: Object3D) {
    super(context)
    this.output = scene

    this.parseMaterial(scene)
  }

  parseMaterial = (scene: Object3D) => {
    const mesh = scene as Mesh // .traverse() type...
    const texture = new TextureLoader().load(greyTiles)
    texture.wrapS = RepeatWrapping
    texture.wrapT = RepeatWrapping
    const program = new ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTexture: { value: texture },
        // THREEJS RENDERER https://github.com/mrdoob/three.js/blob/master/src/renderers/WebGLRenderer.js#L1557
        uLogDepthBufFC: { value: 2.0 / (Math.log(this.context.camera.far + 1.0) / Math.LN2) },
        ...this.context.globalUniforms,
      },
    })

    mesh.material = program
  }
}
