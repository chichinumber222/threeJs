import * as THREE from 'three'
import GUI from 'lil-gui'
import { initScene, Props as InitSceneProps } from './bootstrap/bootstrap'
import { stats } from './utils/stats'
import { initHelpersControls } from './controls/helper-controls'

const props: InitSceneProps = {
  disableDefaultControls: true,
}

const gui = new GUI()

const mountCube = (scene: THREE.Scene) => {
  const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5)
  const material = new THREE.MeshPhysicalMaterial({ color: '#3a7e57', clearcoat: 1, clearcoatRoughness: 0.2 })
  const cube = new THREE.Mesh(geometry, material)
  cube.castShadow = true
  cube.name = 'cube'
  scene.add(cube)
  return cube
}

initScene(props)(({ scene, camera, renderer }) => {
  camera.position.z = 3

  mountCube(scene)

  function animate() {
    requestAnimationFrame(animate)
    renderer.render(scene, camera)
    stats.update()
  }
  animate()

  initHelpersControls(gui, scene)
})

