// import * as THREE from 'three'
// import GUI from 'lil-gui'
// import { initScene, Props as InitSceneProps } from './bootstrap/bootstrap'
// import { stats } from './utils/stats'
// import { initHelpersControls } from './controls/helper-controls'
// import { foreverFloor } from './bootstrap/floor'
// import { initSceneControls } from './controls/scene-controls'

// const props: InitSceneProps = {
//   backgroundColor: new THREE.Color(0xffffff),
//   disableDefaultControls: true,
// }

// const gui = new GUI()

// const mountCube = (scene: THREE.Scene) => {
//   const geometry = new THREE.BoxGeometry(0.5,0.5,0.5)
//   const material = new THREE.MeshPhysicalMaterial({ color: '#3a7e57', clearcoat: 1, clearcoatRoughness: 0.2 })
//   const cube = new THREE.Mesh(geometry, material)
//   cube.castShadow = true
//   cube.name = 'cube'
//   scene.add(cube)
//   return cube
// }

// const initCursorMovement = () => {
//     const cursor = {
//         x: 0,
//         y: 0,
//     }
//     window.addEventListener('mousemove', (event) => {
//         cursor.x = event.clientX / window.innerWidth - 0.5
//         cursor.y = -(event.clientY / window.innerHeight - 0.5)
//     })
//     return cursor
// }

// initScene(props)(({ scene, camera, renderer }) => {
//   camera.position.z = 3

//   foreverFloor(scene, 10)

//   const cube = mountCube(scene)

//   const cursor = initCursorMovement()

//   function animate() {
//     camera.position.x = Math.sin(cursor.x * Math.PI * 2) * 3
//     camera.position.z = Math.cos(cursor.x * Math.PI * 2) * 3
//     camera.position.y = cursor.y * 10
//     camera.lookAt(cube.position)

//     requestAnimationFrame(animate)
//     renderer.render(scene, camera)
//     stats.update()
//   }
//   animate()

//   initSceneControls(gui, scene)
//   initHelpersControls(gui, scene)
// })

import * as THREE from 'three'
import GUI from 'lil-gui'
import { initScene, Props as InitSceneProps } from './bootstrap/bootstrap'
import { stats } from './utils/stats'
import { initHelpersControls } from './controls/helper-controls'
import { foreverPlane } from './bootstrap/floor'
import { initSceneControls } from './controls/scene-controls'
import { initPointerControls } from './controller/pointer'

const props: InitSceneProps = {
  backgroundColor: new THREE.Color(0xffffff),
  disableDefaultControls: true,
}

const guiContainer = document.getElementById('GUI-output') || undefined
const gui = new GUI({ container: guiContainer, title: 'Control Panel' });
// пока так
['click', 'dblclick', 'mousedown', 'mouseup', 'touchstart', 'touchend'].forEach((eventType) => {
  gui.domElement.addEventListener(eventType, function(event) {
    event.stopPropagation()
  })
})

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
 
  foreverPlane(scene)

  mountCube(scene)

  initPointerControls(camera, renderer.domElement)

  function animate() {
    requestAnimationFrame(animate)
    renderer.render(scene, camera)
    stats.update()
  }
  animate()

  initSceneControls(gui, scene)
  initHelpersControls(gui, scene)
})

