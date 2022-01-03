import tuple from "../types/tuple"

export function fromPolarX(radius: number, angle: number) {
  return radius * Math.sin(angle)
}

export function fromPolarY(radius: number, angle: number) {
  return radius * Math.cos(angle)
}

export function polarToCartesian(radius: number, angle: number) {
  return tuple(radius * Math.sin(angle), radius * Math.cos(angle))
}