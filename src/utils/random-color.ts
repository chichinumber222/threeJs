import * as THREE from 'three'

export const randomColor = () => {
  const r = Math.random()
  const g = Math.random()
  const b = Math.random()

  return new THREE.Color(r, g, b)
}
