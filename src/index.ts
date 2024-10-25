import * as THREE from 'three'
import GUI from 'lil-gui'
import { initScene, Props as InitSceneProps } from './bootstrap/bootstrap'
import { initHelpersControls } from './controls/helper-controls'
import { onChangeCursor, onChangeScroll } from './utils/update-coord'

const props: InitSceneProps = {
  disableDefaultControls: true,
  canvasElement: document.getElementsByTagName('canvas')[0]
}

const gui = new GUI()
const textureLoader = new THREE.TextureLoader()

initScene(props)(({ scene, camera, renderer }) => {
  camera.position.z = 4

  const cameraGroup = new THREE.Group()
  cameraGroup.add(camera)
  scene.add(cameraGroup)

  const gradientTexture = textureLoader.load('./static/textures/gradients/5.jpg')
  gradientTexture.magFilter = THREE.NearestFilter
  const meshMaterial = new THREE.MeshToonMaterial({ color: '#998e8e', gradientMap: gradientTexture })
  const meshes = [
    new THREE.Mesh(
      new THREE.TorusKnotGeometry(1, 0.35, 90, 25, 2, 3),
      meshMaterial
    ),
    new THREE.Mesh(
      new THREE.ConeGeometry(1, 3, 30, 1),
      meshMaterial
    ),
    new THREE.Mesh(
      new THREE.TorusGeometry(1, 0.4, 20, 30),
      meshMaterial
    ),
  ]
  scene.add(...meshes)

  const observedDistance = 5.5
  meshes.forEach((mesh, i) => mesh.position.set(0, -observedDistance * i, 0))

  const scrolls = onChangeScroll()
  const cursor = onChangeCursor()

  const clock = new THREE.Clock()
  function animate() {
    const elapsedTime = clock.getElapsedTime()
    meshes.forEach((mesh) => mesh.rotation.set(0.1 * elapsedTime, 0.15 * elapsedTime, 0))

    // camera scroll
    camera.position.y = (-observedDistance * scrolls.y) / window.innerHeight
    // parallax effect
    cameraGroup.position.x = cursor.x * 0.3
    cameraGroup.position.y = cursor.y * 0.3

    requestAnimationFrame(animate)
    renderer.render(scene, camera)
  }
  animate()

  initHelpersControls(gui, scene)
})

