import { OrthographicCamera, PerspectiveCamera, Quaternion, Vector3 } from "three"

const position = new Vector3()
const defaultTarget = new Vector3()
const tempTarget = new Vector3()

function getViewport(
  camera: PerspectiveCamera | OrthographicCamera,
  target: Vector3 | Parameters<Vector3["set"]> = defaultTarget,
  { width, height }: { width: number; height: number } = {
    width: window.innerWidth,
    height: window.innerHeight,
  },
) {
  const aspect = width / height
  if (target instanceof Vector3) tempTarget.copy(target)
  else tempTarget.set(...target)
  camera.updateMatrixWorld()
  const translation = new Vector3()
  const rotation = new Quaternion()
  const scale = new Vector3()
  camera.matrixWorld.decompose(translation, rotation, scale)
  const distance = position.distanceTo(tempTarget)
  if (camera.type === "OrthographicCamera") {
    return {
      width: width / camera.zoom,
      height: height / camera.zoom,
      factor: 1,
      distance,
      aspect,
    }
  } else {
    const fov = (camera.fov * Math.PI) / 180 // convert vertical fov to radians
    const h = 2 * Math.tan(fov / 2) * distance // visible height
    const w = h * (width / height)
    return { width: w, height: h, factor: width / w, distance, aspect }
  }
}

export type Viewport = ReturnType<typeof getViewport>

export default getViewport
