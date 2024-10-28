import * as THREE from "three"
import GUI from "lil-gui"
import { initScene, Props as InitSceneProps } from "./bootstrap/bootstrap"
import { stats } from "./utils/stats"
import { initHelpersControls } from "./controls/helper-controls"
// import * as CANNON from "cannon"
import { foreverPlane } from "./bootstrap/floor"

const props: InitSceneProps = {
  backgroundColor: new THREE.Color('#303030'),
}

const gui = new GUI()

// const initPhysicsWorld = () => {
//   const world = new CANNON.World()
//   world.gravity = new CANNON.Vec3(0, 9.81, 0)
//   return world
// }

// const createAndMountShell = (scene: THREE.Scene, world: CANNON.World) => {

// }


initScene(props)(({ scene, camera, renderer, orbitControls }) => {
  camera.position.z = 9

  foreverPlane(scene, { size: 20 })

  // const world = initPhysicsWorld()

  function animate() {
    requestAnimationFrame(animate)
    renderer.render(scene, camera)
    orbitControls?.update()
    stats.update()
  }
  animate()

  initHelpersControls(gui, scene)
})
