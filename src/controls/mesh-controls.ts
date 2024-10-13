import * as THREE from 'three'
import GUI from 'lil-gui'
import gsap from 'gsap'

type AvailableMaterial = THREE.MeshBasicMaterial | THREE.MeshLambertMaterial | THREE.MeshStandardMaterial | THREE.MeshPhysicalMaterial | THREE.MeshPhongMaterial

export const initMeshControls = (mesh: THREE.Mesh, gui: GUI) => {
  const material = mesh.material as AvailableMaterial
  const defaultHexColor = '#ffffff'
  const props = {
    ...(material?.color ? { color: material.color.getHex?.() || defaultHexColor } : {}),
    spinX: () => gsap.to(mesh.rotation, { duration: 1, x: mesh.rotation.x + 10 }),
    spinY: () => gsap.to(mesh.rotation, { duration: 1, y: mesh.rotation.y + 10 }),
    spinZ: () => gsap.to(mesh.rotation, { duration: 1, z: mesh.rotation.z + 10 }),
  }

  const folder = gui.addFolder(mesh.name || 'Mesh')
  folder.add(mesh.position, 'x', -10, 10, 0.01).name('PositionX')
  folder.add(mesh.position, 'y', -10, 10, 0.01).name('PositionY')
  folder.add(mesh.position, 'z', -10, 10, 0.01).name('PositionZ')
  folder.add(mesh.rotation, 'x', -2, 2, 0.01).name('RotationX')
  folder.add(mesh.rotation, 'y', -2, 2, 0.01).name('RotationY')
  folder.add(mesh.rotation, 'z', -2, 2, 0.01).name('RotationZ')
  if (material?.color?.setHex) {
    folder.addColor(props, 'color').onChange((newHexColor: number) => material.color.setHex(newHexColor))
  }
  folder.add(props, 'spinX')
  folder.add(props, 'spinY')
  folder.add(props, 'spinZ')
  folder.close()
}
