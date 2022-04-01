import { PerspectiveCamera } from "three";

export const getViewport = (camera: PerspectiveCamera) => {
  const fovRadians = camera.fov * (Math.PI / 180);
  const height = 2 * Math.tan(fovRadians / 2) * camera.position.z;
  const width = height * camera.aspect;

  return {
    height,
    width,
  };
};

//returns an array of random 3D coordinates
export function getRandomData(width: number, height: number, size: number, shape:number) {
  var len = width * height * shape;
  var data = new Float32Array(len);
  while (len--) data[len] = (Math.random() - .5) * size;
  return data;
}

/**
 * Returns an approximate centroid for a concave polygon
 * @param  {array}      array of points of the polygon
 * @return {point}      The centroid
 */
export function getCentroid(points) {
  var l = points.length;

  return points.reduce(function (center, p, i) {
    center.x += p.x;
    center.y += p.y;

    if (i === l - 1) {
      center.x /= l;
      center.y /= l;
    }

    return center;
  }, { x: 0, y: 0 });
};