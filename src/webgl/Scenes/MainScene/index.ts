import { PerspectiveCamera, Scene, FogExp2, Color } from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import { WebGLAppContext } from "../.."
import { getViewport } from "../../../utils"
import AbstractObject from "../../Abstract/AbstractObject"
import Particles from "../../components/Particles"

export default class MainScene extends AbstractObject {
  public scene: Scene
  public camera: PerspectiveCamera

  private orbit: OrbitControls

  private particles: Particles
  private tickingObjects: AbstractObject[] = []

  constructor(context: WebGLAppContext) {
    super(context)
    this.setCamera()
    this.setObjects()
  }

  private genContext = () => ({
    ...this.context,
    camera: this.camera,
    scene: this.scene,
    viewport: getViewport(this.camera),
  })

  protected onResize() {
    //https://threejs.org/manual/#en/responsive
    const canvas = this.context.renderer.domElement
    // const pixelRatio = Math.max(window.devicePixelRatio, 2)
    const pixelRatio = 0.5
    const width = (canvas.clientWidth * pixelRatio) | 0
    const height = (canvas.clientHeight * pixelRatio) | 0
    const needResize = canvas.width !== width || canvas.height !== height
    this.camera.aspect = window.innerWidth / window.innerHeight
    this.camera.updateProjectionMatrix()
    if (needResize) {
      this.context.renderer.setSize(width, height, false)
    }
  }

  private setCamera() {
    this.camera = new PerspectiveCamera(48.5, window.innerWidth / window.innerHeight, 0.1, 1000)
    this.camera.position.z = 20
    this.onResize()
    this.orbit = new OrbitControls(this.camera, this.context.renderer.domElement)
    this.orbit.enabled = true

    this.context.gui.addInput(this.orbit, "enabled", { label: "Gerb-o-tron" })
  }

  private setObjects() {
    this.scene = new Scene()
    this.scene.fog = new FogExp2(0xffffff, 0.02)
    this.scene.background = new Color(0x000000)

    this.particles = new Particles(this.genContext(), { width: 128, height: 128 })
    this.scene.add(this.particles.points)
    this.tickingObjects.push(this.particles)

    // this.particles.output.position.y += 15
  }

  public tick(...params: Parameters<AbstractObject["tick"]>) {
    this.orbit.update()
    for (const obj of this.tickingObjects) {
      obj.tick(...params)
    }
  }
}
