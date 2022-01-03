import vertexShader from "./index.vert?raw"
import fragmentShader from "./index.frag?raw"

import * as THREE from "three"

export default class MatcapNoise {
  public material: THREE.ShaderMaterial
  constructor(matcap: string) {
    const texture = new THREE.TextureLoader().load(matcap)

    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        ...THREE.UniformsLib["fog"],
        uMatcap: { value: texture },
        uAmplitude: { value: 10 },
        uFrequency: { value: 10 },
        uStrength: { value: 0 },
        uOpacity: { value: 0 }
      },
      fog: true,
      transparent: true
    })
  }
}
