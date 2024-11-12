import * as THREE from 'three'
import GUI from 'lil-gui'
import { initScene } from './bootstrap/bootstrap'
import { stats } from './utils/stats'
import { initHelpersControls } from './controls/helper-controls'
import testVertexShader from './shaders/test/vertex.glsl'
import testFragmentShader from './shaders/test/fragment.glsl'

const gui = new GUI()

const mountTestPlane = (scene: THREE.Scene) => {
  const geometry = new THREE.PlaneGeometry(5, 5, 32, 32)
  const material = new THREE.RawShaderMaterial({
    vertexShader: testVertexShader,
    fragmentShader: testFragmentShader,
  })
  const mesh = new THREE.Mesh(geometry, material)
  mesh.rotation.y = -Math.PI / 10
  mesh.receiveShadow = true
  mesh.name = 'plane'
  scene.add(mesh)
  return mesh
}

initScene({})(({ scene, camera, renderer }) => {
  camera.position.z = 5

  mountTestPlane(scene)

  function animate() {
    requestAnimationFrame(animate)
    renderer.render(scene, camera)
    stats.update()
  }
  animate()

  initHelpersControls(gui, scene)
})

