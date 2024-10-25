import * as THREE from 'three'

export const createMeshesArrayBasedAnother = <T extends THREE.Object3D = THREE.Object3D>(arr: T[], count: number, withRandom: boolean = false) => {
  const result = Array.from({ length: count }, (_, i) => {
    const index = i % arr.length
    return arr[index]?.clone()
  })
  return withRandom ? result.sort(() => Math.random() - 0.5) : result
}
