// import matcapUrl from "../../assets/images/matcap-128px.png"

// import metallicMatcap from "/src/assets/images/metallic-64px.png"
// import brickMatcap from "/src/assets/images/brick-64px.png"
// import glassMatcap from "/src/assets/images/glass-64px.png"
import metallicMatcap from "/src/assets/images/matcap/roof.png"
import brickMatcap from "/src/assets/images/matcap/brick.png"
import glassMatcap from "/src/assets/images/matcap/glass.png"

import darkerBrickMatcap from "/src/assets/images/darkerBrick-128px.png"
import darkRedMatcap from "/src/assets/images/darkRed-128px.png"
import AbstractObject from "../../webgl/Abstract/AbstractObject"

import { Material, Mesh, Object3D, ShaderMaterial, TextureLoader } from "three"
import { MainSceneContext } from "../../webgl/Scenes/VoronoiScene"
import Matcap from "../../webgl/Materials/Matcap"

const materialsAssoc: Record<string, string> = {
  Metal: metallicMatcap,
  Roof: metallicMatcap,
  Brick: brickMatcap,
  Glass: glassMatcap,
  RedBrick: darkRedMatcap,
  DarkerBrick: darkerBrickMatcap,
}

export default class Building extends AbstractObject<MainSceneContext> {
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
        }
        break

      default:
        break
    }
  }
}
