import {
  ExtrudeGeometry,
  ExtrudeGeometryOptions,
  Group,
  Mesh,
  MeshMatcapMaterial,
  MeshNormalMaterial,
  Shape,
  ShapeGeometry,
  Texture,
  TextureLoader,
} from "three"
import { MainSceneContext } from "../../../webgl/Scenes/VoronoiScene"
import matcap from "../../assets/images/matcap-128px.png"

export default class VoronoiShape {
  context: MainSceneContext
  group: Group

  constructor(context: MainSceneContext, shape: Shape) {
    this.context = context
    this.group = new Group()

    const extrudeSettings = {
      depth: 8,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 2,
      bevelSize: 1,
      bevelThickness: 1,
    }

    const mesh = this.getMeshFrom(shape, extrudeSettings)

    this.group.add(mesh)
  }

  getMeshFrom(shape: Shape, extrudeSettings: ExtrudeGeometryOptions) {
    let geometry = new ShapeGeometry(shape)
    geometry = new ExtrudeGeometry(shape, extrudeSettings)
    return new Mesh(geometry, new MeshMatcapMaterial({ matcap: new TextureLoader().load(matcap) }))

    // this.addLineShape(shape, color, x, y, z, rx, ry, rz, s);
  }

  // addLineShape(shape, color, x, y, z, rx, ry, rz, s) {

  //   // lines

  //   shape.autoClose = true;

  //   const points = shape.getPoints();
  //   const spacedPoints = shape.getSpacedPoints(50);

  //   const geometryPoints = new BufferGeometry().setFromPoints(points);
  //   const geometrySpacedPoints = new BufferGeometry().setFromPoints(spacedPoints);

  //   // solid line

  //   let line = new Line(geometryPoints, new LineBasicMaterial({ color: color }));
  //   line.position.set(x, y, z - 25);
  //   line.rotation.set(rx, ry, rz);
  //   line.scale.set(s, s, s);
  //   this.group.add(line);

  //   // line from equidistance sampled points

  //   line = new Line(geometrySpacedPoints, new LineBasicMaterial({ color: color }));
  //   line.position.set(x, y, z + 25);
  //   line.rotation.set(rx, ry, rz);
  //   line.scale.set(s, s, s);
  //   this.group.add(line);

  //   // vertices from real points

  //   let particles = new Points(geometryPoints, new PointsMaterial({ color: color, size: 4 }));
  //   particles.position.set(x, y, z + 75);
  //   particles.rotation.set(rx, ry, rz);
  //   particles.scale.set(s, s, s);
  //   this.group.add(particles);

  //   // equidistance sampled points

  //   particles = new Points(geometrySpacedPoints, new PointsMaterial({ color: color, size: 4 }));
  //   particles.position.set(x, y, z + 125);
  //   particles.rotation.set(rx, ry, rz);
  //   particles.scale.set(s, s, s);
  //   this.group.add(particles);
  // }
}
