import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

export const initOrbitControls = (camera: THREE.Camera, renderer: THREE.Renderer) => {
  const controller = new OrbitControls(camera, renderer.domElement)
  controller.enableDamping = true
  controller.dampingFactor = 0.05
  controller.minDistance = 0.5
  controller.maxDistance = 100
  controller.minPolarAngle = Math.PI / 4
  controller.maxPolarAngle = (3 * Math.PI) / 4

  return controller
}

export { OrbitControls }
