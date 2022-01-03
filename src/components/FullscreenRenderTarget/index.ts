import {
  Mesh,
  OrthographicCamera,
  PlaneBufferGeometry,
  Scene,
  ShaderMaterial,
  WebGLRenderTarget,
} from "three"
import { MainSceneContext } from "../../webgl/Scenes/VoronoiScene"
import AbstractObject from "../../webgl/Abstract/AbstractObject"

export default class FullscreenRenderTarget extends AbstractObject<MainSceneContext> {
  public width = window.innerWidth
  public height = window.innerHeight
  public target: WebGLRenderTarget
  private scene = new Scene()
  private camera: OrthographicCamera

  constructor(context: MainSceneContext, material: ShaderMaterial) {
    super(context)
    this.context = context

    const geometry = new PlaneBufferGeometry(2, 2, 1, 1)
    const mesh = new Mesh(geometry, material)

    this.camera = new OrthographicCamera()
    this.camera.position.z = 1
    this.scene.add(mesh)
    this.scene.add(this.camera)

    this.target = new WebGLRenderTarget(this.width, this.height)
  }

  tick = () => {
    this.context.renderer.setRenderTarget(this.target)
    this.context.renderer.render(this.scene, this.camera)
    this.context.renderer.setRenderTarget(null)
  }
}
