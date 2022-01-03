import vertexShader from "./index.vert?raw"
import fragmentShader from "./index.frag?raw"

import * as THREE from "three"

export default class Matcap {
  public material: THREE.ShaderMaterial
  constructor(matcap: string) {
    const texture = new THREE.TextureLoader().load(matcap)

    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        ...THREE.UniformsLib["fog"],
        uMatcap: { value: texture },
      },
      fog: true,
    })
  }
}
