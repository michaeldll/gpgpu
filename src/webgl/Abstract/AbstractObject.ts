import { WebGLAppContext } from ".."
import { Object3D } from "three"

// @LeonBaudouin
export default abstract class AbstractObject<T extends WebGLAppContext = WebGLAppContext> {
  protected context: T
  private unbinders: (() => void)[] = []
  public output: Object3D

  constructor(context: T) {
    this.context = context
  }

  protected toUnbind(...unbinders: (() => void)[]) {
    this.unbinders.push(...unbinders)
  }

  public tick(time: number, delta: number) { }

  public destroy() {
    for (const unbinder of this.unbinders) unbinder()
  }
}
