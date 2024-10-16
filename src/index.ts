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
  disableDefaultLights: true,
}

const gui = new GUI()
const textureLoader = new THREE.TextureLoader()

const mountSphere = (scene: THREE.Scene, target?: THREE.Vector3) => {
  const geometry = new THREE.SphereGeometry(0.5, 20, 20)
  const material = new THREE.MeshLambertMaterial({ color: 0xb8bcd4 })
  const mesh = new THREE.Mesh(geometry, material)
  mesh.name = 'sphere'
  if (target) {
    mesh.position.set(target.x, target.y + geometry.parameters.radius, target.z)
  }
  scene.add(mesh)
  return mesh
}

const mountFakeShadow = (scene: THREE.Scene, target?: THREE.Vector3) => {
  const geometry = new THREE.PlaneGeometry(1.5, 1.5)
  const shadowTexture = textureLoader.load('./static/simpleShadow.jpg')
  const material = new THREE.MeshBasicMaterial({ color: 'black', alphaMap: shadowTexture, transparent: true })
  const mesh = new THREE.Mesh(geometry, material)
  mesh.rotation.set(-Math.PI * 0.5, 0, 0)
  if (target) {
    mesh.position.set(target.x, target.y + 0.01, target.z)
  }
  mesh.name = 'fake-shadow'
  scene.add(mesh)
  return mesh
}

const mountHemisphereLightWithGUI = (scene: THREE.Scene) => {
  const light = new THREE.HemisphereLight(0x5064e6, 0xd450e6)
  light.intensity = 3
  const helper = new THREE.HemisphereLightHelper(light, 1)
  helper.visible = false
  scene.add(light).add(helper)

  const guiFolder = gui.addFolder('hemisphere-light')
  guiFolder.addColor({ color: light.color.getHex() }, 'color').onChange((value: number) => {
    light.color = new THREE.Color(value)
    helper.update()
  })
  guiFolder.addColor({ groundColor: light.groundColor.getHex() }, 'groundColor').onChange((value: number) => {
    light.groundColor = new THREE.Color(value)
    helper.update()
  })
  guiFolder.add(light, 'intensity', 0, 5, 0.01)
  guiFolder.add(helper, 'visible').name('helper visible')
  guiFolder.close()
  
  return light
}

const mountSmoke = (scene: THREE.Scene, color: number = 0xd450e6, amplitudeY: number = 2, widthXZ: number = 3, speed: number = 4) => {
  const light = new THREE.PointLight(color, 1.5, 4)
  scene.add(light)

  const smokeGeometry = new THREE.SphereGeometry(0.3, 6, 9)
  const smokeMaterial = new THREE.MeshStandardMaterial({ color: color, opacity: 0.05, transparent: true })
  const meshes: THREE.Mesh[] = Array.from({ length: 10 }, () => new THREE.Mesh(smokeGeometry, smokeMaterial))
  scene.add(...meshes)

  const clock = new THREE.Clock()
  let prevTime = 0
  function animate () {
    const elapsedTime = clock.getElapsedTime()

    light.position.x = Math.cos(elapsedTime * speed) * widthXZ
    light.position.z = Math.sin(elapsedTime * speed) * widthXZ
    light.position.y = Math.sin(elapsedTime * amplitudeY)

    if (elapsedTime - prevTime > 0.015) { 
      meshes[0].position.copy(light.position)
      meshes.push(meshes.shift() as THREE.Mesh)
      prevTime = elapsedTime
    }

    requestAnimationFrame(animate)
  }
  animate()

  return meshes
}

initScene(props)(({ scene, camera, renderer }) => {
  camera.position.z = 12

  const planeSize = 10
  const target = new THREE.Vector3(1, -2, 1)
  const sphereJumpSpeed = 3
  const shadowOpacityFactor = 0.3

  foreverPlane(scene, planeSize, target)

  const sphere = mountSphere(scene, target)

  const fakeShadow = mountFakeShadow(scene, target)

  mountHemisphereLightWithGUI(scene)

  mountSmoke(scene, 0xebc6f0)

  mountSmoke(scene, 0xcacde3, 5, 4, -5)

  mountSmoke(scene, 0xe3fdc4, 10, 6, 4)

  const clock = new THREE.Clock()
  const { x: startX, y: startY, z: startZ } = sphere.position

  function animate() {
    const elapsedTime = clock.getElapsedTime()

    sphere.position.x = startX + Math.cos(elapsedTime) * (planeSize * 0.5 - 1)
    sphere.position.z = startZ + Math.sin(elapsedTime) * (planeSize * 0.5 - 1)
    sphere.position.y = startY + Math.abs(Math.sin(elapsedTime * sphereJumpSpeed))

    fakeShadow.position.x = sphere.position.x
    fakeShadow.position.z = sphere.position.z
    fakeShadow.material.opacity = (1 - (sphere.position.y - startY)) * shadowOpacityFactor

    requestAnimationFrame(animate)
    renderer.render(scene, camera)
    stats.update()
  }
  animate()
  
  initSceneControls(gui, scene)
  initHelpersControls(gui, scene)
})
