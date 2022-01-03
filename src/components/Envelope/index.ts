import AbstractObject from "../../webgl/Abstract/AbstractObject"
import cardTexture from "/src/assets/images/white-blender.jpeg"
import envelopeTexture from "/src/assets/images/metallic-64px.png"

import {
  DoubleSide,
  Mesh,
  Object3D,
  AnimationMixer,
  AnimationAction,
  LoopOnce,
  ShaderMaterial,
  MeshMatcapMaterial,
  TextureLoader,
  MeshStandardMaterial,
  Color,
  MeshBasicMaterial,
  Material,
  PlaneBufferGeometry,
} from "three"
import { MainSceneContext } from "../../webgl/Scenes/VoronoiScene"
import MatcapNoise from "../../webgl/Materials/MatcapNoise"
import { GLTF } from "three/examples/jsm/loaders/GLTFLoader"
import Matcap from "../../webgl/Materials/Matcap"
import gsap, { Cubic } from "gsap"
import VoronoiPlane from "../VoronoiPlane"

export default class Envelope extends AbstractObject<MainSceneContext> {
  private mixer: AnimationMixer
  private actions: AnimationAction[] = []
  private envelope: Mesh
  private card: Mesh
  private voronoiPlane: VoronoiPlane

  constructor(context: MainSceneContext, gltf: GLTF, voronoiPlane: VoronoiPlane) {
    super(context)
    this.voronoiPlane = voronoiPlane
    const { scene, animations } = gltf
    this.output = scene
    this.output.traverse((object) => {
      this.parseMaterial(object)
    })

    this.mixer = new AnimationMixer(scene)
    this.mixer.timeScale = 0.5

    for (const animation of animations) {
      const action = this.mixer.clipAction(animation)
      action.setLoop(LoopOnce, 0)
      action.clampWhenFinished = true
      this.actions.push(action)
    }

    setTimeout(() => {
      this.send()
    }, 1000)
  }

  send = () => {
    // const material = this.envelope.material as ShaderMaterial
    // gsap.to(material.uniforms.uOpacity, { value: 1, ease: Cubic.easeInOut, duration: 1 })
    for (const action of this.actions) {
      action.play()
    }
  }

  parseMaterial = (object: Object3D) => {
    switch (object.type) {
      case "Mesh": // Scene can also contain Groups, Object3Ds, SkinnedMeshes...
        {
          const mesh = object as Mesh
          let program: Material
          switch (mesh.name) {
            case "Card":
              program = new Matcap(envelopeTexture).material
              program.side = DoubleSide
              this.envelope = mesh

              // const geometry = new PlaneBufferGeometry(3, 2, 100, 100)
              // mesh.geometry = geometry
              // program = this.voronoiPlane.material
              // program.side = DoubleSide
              // this.envelope = mesh
              break

            default:
              program = new Matcap(cardTexture).material
              program.side = DoubleSide
              break
          }
          program.side = DoubleSide
          mesh.material = program
        }
        break

      case "SkinnedMesh": {
        {
          const mesh = object as Mesh
          let program = new MeshMatcapMaterial({
            matcap: new TextureLoader().load(cardTexture),
          })
          program.side = DoubleSide
          mesh.material = program
        }
        break
      }
      default:
        break
    }
  }

  public tick(time: number, delta: number): void {
    if (!this.mixer) return

    // this.envelope.rotation.x = 1.6
    this.output.position.y = Math.sin(this.context.clock.getElapsedTime()) * 0.1 + 0.5
    this.mixer.update(0.016)
  }
}
