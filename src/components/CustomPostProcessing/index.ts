import { WebGLAppContext } from "../../webgl"
import AbstractObjectWithSize from "../../webgl/Abstract/AbstractObjectWithSize"
import fragmentShader from "./index.frag?raw"
import vertexShader from "./index.vert?raw"

import water from "/src/assets/images/watercolor3_grayscale.jpg"
import paper from "/src/assets/images/paper.png"
import {
  DepthTexture,
  Mesh,
  PerspectiveCamera,
  PlaneBufferGeometry,
  RawShaderMaterial,
  RepeatWrapping,
  Scene,
  TextureLoader,
  Vector2,
  WebGLMultisampleRenderTarget,
  WebGLRenderTarget,
} from "three"

export default class CustomPostProcessing extends AbstractObjectWithSize {
  private mainRenderTarget: WebGLRenderTarget
  // private depthRenderTarget: RenderTarget
  private camera: PerspectiveCamera
  private uniforms: Record<string, { value: any }>

  constructor(context: WebGLAppContext) {
    super(context)
    this.mainRenderTarget = new WebGLMultisampleRenderTarget(
      this.windowSize.state.width,
      this.windowSize.state.height,
      { depthTexture: new DepthTexture(this.windowSize.state.width, this.windowSize.state.height) },
    )
    this.camera = new PerspectiveCamera()

    const params = {
      fbmScale: {
        min: 15,
        max: 25,
      },
    }
    this.uniforms = {
      uMap: { value: this.mainRenderTarget.texture },
      uDepth: { value: this.mainRenderTarget.depthTexture },
      uResolution: {
        value: new Vector2(this.windowSize.state.width, this.windowSize.state.height),
      },
      uWatercolor: {
        value: new TextureLoader().load(water),
      },
      uFbmScale: {
        value: new Vector2(params.fbmScale.min, params.fbmScale.max),
      },
      uFbmAmount: {
        value: 0.0015,
      },
      uPaper: {
        value: new TextureLoader().load(paper, (texture) => {
          texture.wrapS = RepeatWrapping
          texture.wrapT = RepeatWrapping
        }),
      },
      uWatercolorOpacity: { value: 0.3 },
    }

    const postFolder = this.context.gui.addFolder({ title: "Postprocessing" })
    postFolder
      .addInput(params, "fbmScale", { label: "Fbm Scale", min: 2, max: 50 })
      .on("change", ({ value: { min, max } }) => {
        this.uniforms.uFbmScale.value.set(min, max)
      })
    postFolder.addInput(this.uniforms.uFbmAmount, "value", { label: "Fbm Amount" })
    postFolder.addInput(this.uniforms.uWatercolorOpacity, "value", {
      label: "Watercolor opacity",
      min: 0,
      max: 3,
    })

    // this.uniforms = {
    //   uMap: { value: this.mainRenderTarget.texture },
    //   uDepth: { value: this.mainRenderTarget.depthTexture },
    //   uResolution: {
    //     value: new Vector2(this.windowSize.state.width, this.windowSize.state.height),
    //   },
    //   uTime: { value: 0 },
    //   uWatercolorOne: {
    //     value: new TextureLoader().load(water),
    //   },
    //   uPaper: {
    //     value: new TextureLoader().load(paper, (texture) => {
    //       texture.wrapS = this.context.renderer.getContext().REPEAT
    //       texture.wrapT = this.context.renderer.getContext().REPEAT
    //     }),
    //   },
    // }
    this.output = new Mesh(
      new PlaneBufferGeometry(2, 2),
      new RawShaderMaterial({ fragmentShader, vertexShader, uniforms: this.uniforms }),
    )
  }

  protected onResize(width, height) {
    this.uniforms.uResolution.value.set(width, height)
    this.mainRenderTarget.setSize(width, height)
  }

  public tick(time: number) {
    // this.uniforms.uTime.value = time
  }

  public render(scene: { scene: Scene; camera: PerspectiveCamera }) {
    this.context.renderer.setRenderTarget(this.mainRenderTarget)
    this.context.renderer.render(scene.scene, scene.camera)
    this.context.renderer.setRenderTarget(null)
    // this.uniforms.uDepth.value = this.mainRenderTarget.depthTexture
    this.context.renderer.render(this.output, this.camera)
  }
}
