import * as THREE from 'three'

export const foreverPlane = (scene: THREE.Scene, size?: number, position?: THREE.Vector3, rotation?: THREE.Vector3) => {
  const s = size ?? 250
  const geometry = new THREE.PlaneGeometry(s, s)
  const material = new THREE.MeshLambertMaterial({ color: 0xdddddd })
  const mesh = new THREE.Mesh(geometry, material)
  // positions
  mesh.position.x = position?.x ?? 0
  mesh.position.y = position?.y ?? -2
  mesh.position.z = position?.z ?? 0
  // rotations
  mesh.rotation.x = rotation?.x ?? Math.PI / -2
  mesh.rotation.y = rotation?.y ?? 0
  mesh.rotation.z = rotation?.z ?? 0
  mesh.receiveShadow = true
  mesh.name = 'forever-plane'
  scene.add(mesh)
  return mesh
}

export const foreverFloor = (scene: THREE.Scene, size?: number, position?: THREE.Vector3, rotation?: THREE.Vector3) => {
  const s = size ?? 6
  const geometry = new THREE.BoxGeometry(s, 0.25, s)
  const material = new THREE.MeshStandardMaterial({ color: 0xdddddd })
  const mesh = new THREE.Mesh(geometry, material)
  // positions
  mesh.position.x = position?.x ?? 0
  mesh.position.y = position?.y ?? -2
  mesh.position.z = position?.z ?? -1
  // rotations
  mesh.rotation.x = rotation?.x ?? 0
  mesh.rotation.y = rotation?.y ?? 0
  mesh.rotation.z = rotation?.z ?? 0
  mesh.receiveShadow = true
  mesh.name = 'floating-floor'
  scene.add(mesh)
  return mesh
}