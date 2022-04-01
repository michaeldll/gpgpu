import { ListApi, Pane } from "tweakpane"
import * as EssentialsPlugin from "@tweakpane/plugin-essentials"
import { Clock, Color, WebGLRenderer } from "three"
import Prando from "prando"
import MainScene from "./Scenes/MainScene"

export default class WebGLApp {
  private renderer: WebGLRenderer
  private parisScene: MainScene
  private currentScene: MainScene

  private clock: THREE.Clock
  private gui: Pane
  private rng: Prando
  private globalUniforms = { uRenderDepth: { value: false } }

  constructor(htmlElement: HTMLCanvasElement) {
    this.setupRenderer(htmlElement)
    this.clock = new Clock(true)
    this.gui = new Pane({ title: "Tweaks" })
    this.gui.registerPlugin(EssentialsPlugin)

    const sceneBlade = this.gui.addBlade({
      view: "list",
      label: "Scene",
      options: [{ text: "parisScene", value: "parisScene" }],
      value: "parisScene",
    }) as ListApi<string>
    sceneBlade.on("change", ({ value }) => (this.currentScene = this[value]))

    this.rng = new Prando(/*<- seed*/)

    this.parisScene = new MainScene(this.genContext())

    this.currentScene = this[sceneBlade.value]
  }

  private genContext = () => ({
    clock: this.clock,
    renderer: this.renderer,
    globalUniforms: this.globalUniforms,
    gui: this.gui,
    rng: this.rng,
  })

  private setupRenderer(htmlElement: HTMLCanvasElement) {
    this.renderer = new WebGLRenderer({ canvas: htmlElement, antialias: true })
    this.renderer.setPixelRatio(1)
    this.renderer.setClearColor(new Color("#FAF8EE"))

    const resize = () => {
      this.renderer.setSize(window.innerWidth, window.innerHeight)
    }
    resize()
    window.addEventListener("resize", resize)
  }

  public tick() {
    this.currentScene.tick(0, 0)
    this.renderer.render(this.currentScene.scene, this.currentScene.camera)
  }
}

export type WebGLAppContext = ReturnType<WebGLApp["genContext"]>
