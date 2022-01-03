import AbstractObject from "../../webgl/Abstract/AbstractObject"
import metallicMatcap from "/src/assets/images/matcap/roof.png"
import glassMatcap from "/src/assets/images/matcap/glass.png"

import { Material, Mesh, Object3D, ShaderMaterial, TextureLoader, UniformsLib } from "three"
import { MainSceneContext } from "../../webgl/Scenes/VoronoiScene"
import Matcap from "../../webgl/Materials/Matcap"

const materialsAssoc: Record<string, string> = {
  Metal: metallicMatcap,
  Glass: glassMatcap,
}

export default class StreetLight extends AbstractObject<MainSceneContext> {
  constructor(context: MainSceneContext, scene: Object3D) {
    super(context)
    this.output = scene

    this.output.traverse((object) => {
      this.parseMaterial(object)
    })
  }

  parseMaterial = (object: Object3D) => {
    switch (object.type) {
      case "Mesh": // Scene can also contain Groups and Object3Ds
        {
          const mesh = object as Mesh // .traverse() type...
          const material = mesh.material as Material & { name: string } // Exported materials from blender get a `name` prop
          const texUrl = materialsAssoc[material.name]

          if (texUrl == undefined) return

          const program = new Matcap(this.context, texUrl).material

          mesh.material = program
          mesh.onBeforeRender = () => {
            ; (window as any).a = UniformsLib
          }
        }
        break

      default:
        break
    }
  }
}
