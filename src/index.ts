import * as THREE from 'three'
import { initScene, Props as InitSceneProps } from './bootstrap/bootstrap'
import { onChangeCursor, onChangeScroll } from './utils/update-coord'
import { createMeshesArrayBasedAnother } from './utils/create-meshes-array-based-another'

const props: InitSceneProps = {
  disableDefaultControls: true,
  canvasElement: document.getElementsByTagName('canvas')[0]
}

const textureLoader = new THREE.TextureLoader()

initScene(props)(({ scene, camera, renderer }) => {
  camera.position.z = 4

  const cameraGroup = new THREE.Group()
  cameraGroup.add(camera)
  scene.add(cameraGroup)

  const gradientTexture = textureLoader.load('./static/textures/gradients/5.jpg')
  gradientTexture.magFilter = THREE.NearestFilter
  const meshMaterial = new THREE.MeshToonMaterial({ color: '#998e8e', gradientMap: gradientTexture })
  const meshesUniq = [
    new THREE.Mesh(
      new THREE.TorusKnotGeometry(1, 0.35, 90, 25, 2, 3),
      meshMaterial
    ),
    new THREE.Mesh(
      new THREE.ConeGeometry(1.3, 3.5, 30, 1),
      meshMaterial
    ),
    new THREE.Mesh(
      new THREE.TorusGeometry(1, 0.4, 20, 30),
      meshMaterial
    ),
    new THREE.Mesh(
      new THREE.DodecahedronGeometry(1.5, 0),
      meshMaterial
    ),
    new THREE.Mesh(
      new THREE.SphereGeometry(2, 30, 15),
      meshMaterial
    )
  ]
  const meshes = createMeshesArrayBasedAnother(meshesUniq, document.getElementsByClassName('section').length, true)
  scene.add(...meshes)

  const observedDistance = -5.5
  meshes.forEach((mesh, i) => mesh.position.set(0, observedDistance * i, 0))

  const scrolls = onChangeScroll()
  const cursor = onChangeCursor()

  const clock = new THREE.Clock()
  function animate() {
    // animate meshes
    const elapsedTime = clock.getElapsedTime()
    meshes.forEach((mesh) => mesh.rotation.set(0.1 * elapsedTime, 0.15 * elapsedTime, 0))
    // camera scroll
    const scrollDistance = (observedDistance * scrolls.y) / window.innerHeight
    camera.position.y = scrollDistance
    // parallax effect
    const distanceX = cursor.x * 0.3
    const distanceY = cursor.y * 0.3
    const distancePartX = (distanceX - cameraGroup.position.x) * 0.02
    const distancePartY = (distanceY - cameraGroup.position.y) * 0.02 
    cameraGroup.position.x += distancePartX
    cameraGroup.position.y += distancePartY

    requestAnimationFrame(animate)
    renderer.render(scene, camera)
  }
  animate()
})

