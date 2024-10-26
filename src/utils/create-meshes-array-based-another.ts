import * as THREE from 'three'

export interface Parameters<T> {
  basedMeshesArray: T[]
  outputLength: number
  withRandom?: boolean
}

export const createMeshesArrayBasedAnother = <T extends THREE.Object3D = THREE.Object3D>({ basedMeshesArray, outputLength, withRandom = false }: Parameters<T>) => {
  const result = Array.from({ length: outputLength }, (_, i) => {
    const index = i % basedMeshesArray.length
    return basedMeshesArray[index]?.clone()
  })
  return withRandom ? result.sort(() => Math.random() - 0.5) : result
}
