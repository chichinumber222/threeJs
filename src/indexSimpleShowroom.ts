import * as THREE from "three"
import GUI from "lil-gui"
import { initScene, Props as InitSceneProps } from "./bootstrap/bootstrap"
import { stats } from "./utils/stats"
import { initHelpersControls } from "./controls/helper-controls"
import { foreverPlane } from "./bootstrap/floor"
import { onChangeCursor } from "./utils/update-coord"
import gsap from 'gsap'

const props: InitSceneProps = {
  backgroundColor: new THREE.Color(0xffffff),
}

const gui = new GUI()

const getCameraDirection = (camera: THREE.PerspectiveCamera) => {
  const direction = new THREE.Vector3()
  camera.getWorldDirection(direction)
  return direction
}

const mountTestCubes = (scene: THREE.Scene) => {
  const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5)
  const material1 = new THREE.MeshBasicMaterial({ color: '#3a7e57' })
  const material2 = new THREE.MeshBasicMaterial({ color: '#34b5ff' })
  const cube1 = new THREE.Mesh(geometry, material1)
  cube1.position.set(0, 0.5, 0)
  cube1.name = 'cube1'
  const cube2 = new THREE.Mesh(geometry, material2)
  cube2.position.set(4, 0.5, 4)
  cube2.name = 'cube2'
  scene.add(cube1, cube2)
  return [cube1, cube2]
}

initScene(props)(({ scene, camera, renderer, orbitControls }) => {
  camera.position.set(2, 0.8, 2)
  orbitControls!.rotateSpeed = -0.5

  const target = new THREE.Vector3()
  const updateControl = () => {
    target.copy(camera.position).add(getCameraDirection(camera).multiplyScalar(0.5))
    orbitControls!.target.copy(target)
    orbitControls!.update()
  }
  updateControl()

  const plane = foreverPlane(scene, { position: new THREE.Vector3(0, 0, 0)})

  mountTestCubes(scene)

  const mouse = onChangeCursor()
  const raycaster = new THREE.Raycaster()

  window.addEventListener('contextmenu', () => {
    raycaster.setFromCamera(mouse, camera)
    const intersected = raycaster.intersectObject(plane)
    if (intersected.length) {
      const pointVector = intersected[0].point
      gsap.to(camera.position, {
        duration: 1,
        ease: "power2.inOut",
        x: pointVector.x,
        z: pointVector.z,
        onStart: () => {
          orbitControls?.disconnect()
        },
        onComplete: () => {
          orbitControls?.connect()
        }
      })
    }
  })


  function animate() {
    requestAnimationFrame(animate)
    renderer.render(scene, camera)
    updateControl()
    stats.update()
  }
  animate()

  initHelpersControls(gui, scene)
})
