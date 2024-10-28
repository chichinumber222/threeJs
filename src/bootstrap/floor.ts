import * as THREE from 'three'

export interface Options {
  size?: number
  position?: THREE.Vector3
  rotation?: THREE.Euler
}

export const foreverPlane = (scene: THREE.Scene, { size, position, rotation }: Options = {}) => {
  const s = size ?? 250
  const geometry = new THREE.PlaneGeometry(s, s)
  const material = new THREE.MeshLambertMaterial({ color: 0xdddddd })
  const mesh = new THREE.Mesh(geometry, material)
  mesh.position.copy(position || new THREE.Vector3(0, -2, 0))
  mesh.rotation.copy(rotation || new THREE.Euler(Math.PI / -2, 0, 0))
  mesh.receiveShadow = true
  mesh.name = 'forever-plane'
  scene.add(mesh)
  return mesh
}

export const foreverFloor = (scene: THREE.Scene, { size, position, rotation }: Options = {}) => {
  const s = size ?? 6
  const geometry = new THREE.BoxGeometry(s, 0.25, s)
  const material = new THREE.MeshStandardMaterial({ color: 0xdddddd })
  const mesh = new THREE.Mesh(geometry, material)
  mesh.position.copy(position || new THREE.Vector3(0, -2, -1))
  mesh.rotation.copy(rotation || new THREE.Euler(0, 0, 0))
  mesh.receiveShadow = true
  mesh.name = 'floating-floor'
  scene.add(mesh)
  return mesh
}