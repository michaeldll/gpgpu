import Voronoi from 'voronoi'
import VoronoiRoad from "../VoronoiRoad"
import Wall from "../Wall"
import { polarToCartesian } from "../../utils/math/fromPolar"
import { BoxBufferGeometry, Group, Mesh, MeshBasicMaterial, MeshNormalMaterial, PlaneBufferGeometry, Shape, Vector3 } from "three"
import { MainSceneContext } from '../../webgl/Scenes/VoronoiScene'
import VoronoiShape from '../VoronoiShape'

type Point = [Vector3, Vector3]

type Site = { x: number, y: number, voronoiId: number }

type HalfEdge = {
  angle: number,
  edge: any,
  site: Site,
  getStartpoint: () => { x: number, y: number },
  getEndpoint: () => { x: number, y: number }
}

type Cell = {
  closeMe: boolean,
  halfedges: HalfEdge[],
  site: Site
}

type Diagram = {
  cells: Cell[]
  edges: any[]
  execTime: number
  site: any
  vertices: { x: number, y: number }[]
}

export default class VoronoiGenerator {
  context: MainSceneContext
  voronoi = new Voronoi()
  diagram: Diagram
  group: Group

  constructor(context: MainSceneContext) {
    this.context = context
    this.diagram = { cells: [], edges: [], execTime: 0, site: {}, vertices: [] }
    this.group = new Group()
    const mesh = new Mesh(new PlaneBufferGeometry(), new MeshBasicMaterial({ color: "#EFEFEE" }))
    mesh.scale.set(1.44 * 35, 35, 1)
    mesh.position.add(new Vector3(-5, -2, 0))

    this.group.add(mesh)
  }

  generate = (count = 7) => {
    const { width, height } = this.context.viewport

    const boundingBox = { xl: -width / 2.5, xr: width / 2.5, yt: -height / 2.5, yb: height / 2.5 }; // xl is x-left, xr is x-right, yt is y-top, and yb is y-bottom

    // Random :
    const sites = new Array(count).fill({ x: 0, y: 0 }).map(() => ({
      x: this.context.rng.next(0, 0.5) * width - width / 4,
      y: this.context.rng.next(0, 0.5) * height - height / 4
    }));

    // Debugging :
    // const sites = new Array(count).fill({ x: 0, y: 0 }).map((side, i) => ({
    //   x: i * 0.3 * width - width / 2.5,
    //   y: i * 0.2 * height - height / 2.5
    // }));

    this.diagram = this.voronoi.compute(sites, boundingBox);

    for (let index = 0; index < this.diagram.cells.length; index++) {
      this.buildCell(this.diagram.cells[index])
    }

    // const cell = this.diagram.cells[0]
    // console.log(cell);
    // this.buildCell(cell)

    this.context.scene.add(this.group)
  }

  buildCell(cell: Cell) {
    // Shapes
    const points: { start: Vector3, end: Vector3 }[] = []

    for (let index = 0; index < cell.halfedges.length; index++) {
      const halfedge = cell.halfedges[index];

      let startPoint = halfedge.getStartpoint();
      let endPoint = halfedge.getEndpoint();

      const point = {
        start: new Vector3(startPoint.x, startPoint.y, 0),
        end: new Vector3(endPoint.x, endPoint.y, 0)
      }

      points.push(point)
    }

    const shapePoints: { start: Vector3, end: Vector3 }[] = []

    shapePoints.push(points[0])

    for (let index = 1; index < points.length; index++) {
      const point = points[index];
      shapePoints.push(point)
    }

    const shape = new Shape().moveTo(shapePoints[0].start.x, shapePoints[0].start.y)

    for (const shapePoint of shapePoints) {
      shape.lineTo(shapePoint.start.x, shapePoint.start.y)
    }

    const voronoiShape = new VoronoiShape(this.context, shape)
    voronoiShape.group.scale.multiplyScalar(0.8)
    const direction = new Vector3(cell.site.x, cell.site.y, 0).sub(voronoiShape.group.position)
    voronoiShape.group.position.add(direction.multiplyScalar(0.5))
    this.group.add(voronoiShape.group)

    // Cell centers
    // const geometry = new BoxBufferGeometry()
    // const material = new MeshNormalMaterial()
    // const box = new Mesh(geometry, material)

    // box.scale.set(box.scale.x * 0.5, box.scale.x * 0.5, box.scale.x * 0.5)
    // box.position.set(cell.site.x, cell.site.y, 0)
    // this.group.add(box)

    // for (let index = 0; index < cell.halfedges.length; index++) {
    //   const halfedge = cell.halfedges[index];

    //   let startPoint = halfedge.getStartpoint();
    //   let endPoint = halfedge.getEndpoint();

    //   const point: Point = [
    //     new Vector3(startPoint.x, startPoint.y, 0),
    //     new Vector3(endPoint.x, endPoint.y, 0)
    //   ]

    //   // Roads
    //   const road = this.getCellRoad(point)
    //   road.output.position.z += index * 0.01 // Z-fighting
    //   this.group.add(road.output)
    // }
  }

  placeAtMiddle(points: Point, component: VoronoiRoad | Wall) {
    component.output.position.set(points[0].x, points[0].y, 0)

    // Point at next cell
    const direction = new Vector3(points[1].x - component.output.position.x, points[1].y - component.output.position.y, 0)
    const angle = Math.atan2(direction.y, direction.x)
    component.output.rotation.z = angle

    // Put in between
    direction.multiplyScalar(0.5)
    component.output.position.add(direction)
  }

  placeAtSides(cellIndex: number, points: Point, components: VoronoiRoad[] | Wall[]) {
    const length = points[0].distanceTo(points[1])

    for (let index = 0; index < components.length; index++) {
      const component = components[index];

      component.output.position.set(points[0].x, points[0].y, 0)

      // Point at next cell
      const direction = new Vector3(points[1].x - component.output.position.x, points[1].y - component.output.position.y, 0)
      let angle = Math.atan2(direction.y, direction.x)
      component.output.rotation.z = angle

      // Put in between
      component.output.position.add(direction.multiplyScalar(0.5))

      // angle += Math.PI / 2
      angle = -angle

      if (index % 2) {
        const [x, y] = polarToCartesian(1, angle)
        component.output.position.x += x
        component.output.position.y += y
      } else {
        const [x, y] = polarToCartesian(1, angle + Math.PI)
        component.output.position.x += x
        component.output.position.y += y
      }

      component.output.scale.set(length - 4, 1, 2)
      component.output.position.z += component.output.scale.z / 2
    }
  }

  getCellRoad(points: Point) {
    const length = points[0].distanceTo(points[1])
    const road = new VoronoiRoad(this.context, length)

    this.placeAtMiddle(points, road)

    road.output.scale.set(length, 1, 1)

    return road
  }

  getCellWalls(index: number, points: Point) {
    const walls = [new Wall(this.context), new Wall(this.context)]
    this.placeAtSides(index, points, walls)
    return walls
  }

  nudgeWall = (wall: Wall, points: Point) => {
    // Point at next cell
    const direction = new Vector3(points[1].x - wall.output.position.x, points[1].y - wall.output.position.y, 0)

    const angle = -Math.atan2(direction.y, direction.x)
    const [x, y] = polarToCartesian(1, angle)
    wall.output.position.x += x
    wall.output.position.y += y
  }
}