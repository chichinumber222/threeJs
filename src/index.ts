import * as THREE from 'three'
import GUI from 'lil-gui'
import { initScene, Props as InitSceneProps } from './bootstrap/bootstrap'
import { stats } from './utils/stats'
import { initHelpersControls } from './controls/helper-controls'
import { foreverPlane } from './bootstrap/floor'
import { initSceneControls } from './controls/scene-controls'

const props: InitSceneProps = {
  backgroundColor: new THREE.Color(0xffffff),
  disableShadows: true,
}

const gui = new GUI()
const textureLoader = new THREE.TextureLoader()
const matcapTexture =  textureLoader.load('./static/matcap/3.png')
const shadowTexture = textureLoader.load('./static/simpleShadow.jpg')

const mountSphere = (scene: THREE.Scene, plane: THREE.Mesh) => {
  const geometry = new THREE.SphereGeometry(0.5, 20, 20)
  const material = new THREE.MeshMatcapMaterial({ matcap: matcapTexture })
  const mesh = new THREE.Mesh(geometry, material)
  mesh.name = 'sphere'
  mesh.position.set(plane.position.x, plane.position.y + geometry.parameters.radius, plane.position.z)
  scene.add(mesh)
  return mesh
}

const mountFakeShadow = (scene: THREE.Scene, sphere: THREE.Mesh, plane: THREE.Mesh) => {
  const geometry = new THREE.PlaneGeometry(1.5, 1.5)
  const material = new THREE.MeshBasicMaterial({ color: 'black', alphaMap: shadowTexture, transparent: true })
  const mesh = new THREE.Mesh(geometry, material)
  mesh.rotation.set(plane.rotation.x, plane.rotation.y, plane.rotation.z)
  mesh.position.set(sphere.position.x, plane.position.y + 0.01, sphere.position.z)
  mesh.name = 'fake-shadow'
  scene.add(mesh)
  return mesh
}

initScene(props)(({ scene, camera, renderer }) => {
  camera.position.z = 5

  const plane = foreverPlane(scene, 5, new THREE.Vector3(1, -2 , 1))

  const sphere = mountSphere(scene, plane)

  const fakeShadow = mountFakeShadow(scene, sphere, plane)

  const clock = new THREE.Clock()
  const { x: startX, y: startY, z: startZ } = sphere.position

  function animate() {
    const elapsedTime = clock.getElapsedTime()

    sphere.position.x = startX + Math.cos(elapsedTime) * 1.5
    sphere.position.z = startZ + Math.sin(elapsedTime) * 1.5
    sphere.position.y = startY + Math.abs(Math.sin(elapsedTime * 3))

    fakeShadow.position.x = sphere.position.x
    fakeShadow.position.z = sphere.position.z
    fakeShadow.material.opacity = (1 - (sphere.position.y - startY)) * 0.3

    requestAnimationFrame(animate)
    renderer.render(scene, camera)
    stats.update()
  }
  animate()
  
  initSceneControls(gui, scene)
  initHelpersControls(gui, scene)
})
