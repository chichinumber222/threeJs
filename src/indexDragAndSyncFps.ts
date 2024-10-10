import * as THREE from 'three'
import GUI from 'lil-gui'
import { DragControls } from 'three/examples/jsm/controls/DragControls'
import { initScene, Props as InitSceneProps } from './bootstrap/bootstrap'
import { stats } from './utils/stats'
import { initHelpersControls } from './controls/helper-controls'
import { foreverFloor } from './bootstrap/floor'
import { initSceneControls } from './controls/scene-controls'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import gsap from 'gsap'

const props: InitSceneProps = {
  backgroundColor: new THREE.Color(0xffffff),
}

const gui = new GUI()

const mountCube = (scene: THREE.Scene) => {
  const geometry = new THREE.BoxGeometry(3, 3, 3)
  const material = new THREE.MeshPhysicalMaterial({ color: '#3a7e57', clearcoat: 1, clearcoatRoughness: 0.2 })
  const cube = new THREE.Mesh(geometry, material)
  cube.castShadow = true
  cube.name = 'cube'
  cube.position.y = -0.5
  scene.add(cube)
  return cube
}

const mountSpotLight = (scene: THREE.Scene) => {
  const light = new THREE.SpotLight(0xffffff, 2)
  light.position.set(4, 6, 2)
  light.decay = 0.5
  light.angle = 0.3
  light.penumbra = 0.5
  light.shadow.mapSize.width = 2048
  light.shadow.mapSize.height = 2048
  light.name = 'spot-light'
  scene.add(light)
  return light
}

const initDragControls = (scene: THREE.Scene, camera: THREE.Camera, renderer: THREE.Renderer, orbitControls?: OrbitControls) => {
  const controls = new DragControls(scene.children, camera, renderer.domElement)
  controls.addEventListener('dragstart', ({ object }) => {
    if (orbitControls) {
      orbitControls.enabled = false
    }
    if (object instanceof THREE.Mesh) {
      object.material.emissive.set(0xffffff)
      object.material.emissiveIntensity = 0.2
    }
  })
  controls.addEventListener('dragend', ({ object }) => {
    if (orbitControls) {
      orbitControls.enabled = true
    }
    if (object instanceof THREE.Mesh) {
      object.material.emissive.set(0x000000)
    } 
  })
  return controls
}

initScene(props)(({ scene, camera, renderer, orbitControls }) => {
  camera.position.set(-7, 2, 5)
  orbitControls?.update()

  foreverFloor(scene, 10)

  const cube = mountCube(scene)

  //* Green sock animation platform (GSAP) делает анимацию прикольную
  // gsap.to(cube.position, { delay: 2, duration: 3, y: 2})

  mountSpotLight(scene)

  initDragControls(scene, camera, renderer, orbitControls)

  //* Чтобы на различным компьютерах с разным fps одинаковая скорость соблюдалась 1 вариант
  // let time = Date.now()
  // function animate() {

  //   const currentTime = Date.now()
  //   const deltaTime = currentTime - time
  //   time = currentTime
    
  //   cube.rotation.y += 0.001 * deltaTime

  //   requestAnimationFrame(animate)
  //   renderer.render(scene, camera)
  //   stats.update()

  //   orbitControls?.update()
  // }
  // animate()
  //*

  //* Чтобы на различным компьютерах с разным fps одинаковая скорость соблюдалась 2 вариант
  const clock  = new THREE.Clock()
  function animate() {
  
    cube.rotation.y = clock.getElapsedTime() * Math.PI * 2

    requestAnimationFrame(animate)
    renderer.render(scene, camera)
    stats.update()

    orbitControls?.update()
  }
  animate()
  //*

  initSceneControls(gui, scene)
  initHelpersControls(gui, scene)
})
