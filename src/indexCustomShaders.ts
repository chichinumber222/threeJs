// import * as THREE from 'three'
import GUI from 'lil-gui'
import { initScene } from './bootstrap/bootstrap'
import { stats } from './utils/stats'
import { initHelpersControls } from './controls/helper-controls'

const gui = new GUI()

initScene({})(({ scene, camera, renderer }) => {
  camera.position.z = 3

  function animate() {
    requestAnimationFrame(animate)
    renderer.render(scene, camera)
    stats.update()
  }
  animate()

  initHelpersControls(gui, scene)
})

