// import { Post, Vec2, TextureLoader, OGLRenderingContext } from "ogl-typescript"
// import fragment from "./fragment.frag?raw"
// import water from "/src/assets/images/watercolor3_grayscale.jpg"
// import paper from "/src/assets/images/paper.png"

// export default class PostProcessing extends Post {
//   uniformResolution: { value: Vec2 }
//   uniformTime: { value: number }

//   constructor(gl: OGLRenderingContext) {
//     super(gl)
//     // Create uniform for pass
//     this.uniformResolution = { value: new Vec2() }
//     this.uniformTime = { value: performance.now() }

//     // Add pass like you're creating a Program. Then use the 'enabled'
//     // property to toggle the pass.
//     this.addPass({
//       // If not passed in, pass will use the default vertex/fragment
//       // shaders found within the class.
//       fragment,
//       uniforms: {
//         uResolution: this.uniformResolution,
//         uWatercolorOne: {
//           value: TextureLoader.load(gl, { src: water }),
//         },
//         uPaper: {
//           value: TextureLoader.load(gl, {
//             src: paper,
//             wrapS: gl.REPEAT,
//             wrapT: gl.REPEAT,
//           }),
//         },
//         uTime: this.uniformTime,
//       },
//     })
//   }

//   update = () => {
//     this.uniformTime.value = performance.now()
//   }
// }
