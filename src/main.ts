import "./styles/reset.css"
import "./styles/style.css"
import WebGLApp from "./webgl"
import Stats from "stats.js"
import DOMController from "./DOM"

const canvas = document.querySelector<HTMLCanvasElement>("canvas")!
const app = new WebGLApp(canvas)
const stats = new Stats()
stats.showPanel(0) // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom)

const dom = new DOMController()
setTimeout(() => {
  dom.initIntro()
}, 2000);

const raf = () => {
  stats.begin()
  app.tick()
  stats.end()
  requestAnimationFrame(raf)
}
raf()
