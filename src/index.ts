import * as THREE from 'three'
import GUI from 'lil-gui'
import { initScene, Props as InitSceneProps } from './bootstrap/bootstrap'
import { stats } from './utils/stats'
import { initHelpersControls } from './controls/helper-controls'

const props: InitSceneProps = {
  backgroundColor: new THREE.Color(0x262837),
  disableDefaultLights: true,
}

const gui = new GUI()
const textureLoader = new THREE.TextureLoader()

const createFloor = () => {
  const colorTexture = textureLoader.load('static/textures/grass/color.jpg')
  colorTexture.wrapS = THREE.RepeatWrapping
  colorTexture.wrapT = THREE.RepeatWrapping
  colorTexture.repeat.set(10, 10)
  const normalTexture = textureLoader.load('static/textures/grass/normal.jpg')
  normalTexture.wrapS = THREE.RepeatWrapping
  normalTexture.wrapT = THREE.RepeatWrapping
  normalTexture.repeat.set(10, 10)
  const ambientOcclusionTexture = textureLoader.load('static/textures/grass/ambientOcclusion.jpg')
  ambientOcclusionTexture.wrapS = THREE.RepeatWrapping
  ambientOcclusionTexture.wrapT = THREE.RepeatWrapping
  ambientOcclusionTexture.repeat.set(10, 10)
  const roughnessTexture = textureLoader.load('static/textures/grass/roughness.jpg')
  roughnessTexture.wrapS = THREE.RepeatWrapping
  roughnessTexture.wrapT = THREE.RepeatWrapping
  roughnessTexture.repeat.set(10, 10)
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(30, 0.25, 30),
    new THREE.MeshStandardMaterial({
      color: 0xdddddd,
      map: colorTexture,
      normalMap: normalTexture,
      aoMap: ambientOcclusionTexture,
      aoMapIntensity: 3,
      roughnessMap: roughnessTexture,
    })
  )
  mesh.geometry.setAttribute('uv2', new THREE.Float32BufferAttribute(mesh.geometry.attributes.uv.array, 2))
  mesh.receiveShadow = true
  mesh.name = 'floor'
  return mesh
}

const createWalls = () => {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(5, 3, 5),
    new THREE.MeshStandardMaterial({
      color: '#bd2f32',
      map: textureLoader.load('static/textures/bricks/color.jpg'),
      aoMap: textureLoader.load('static/textures/bricks/ambientOcclusion.jpg'),
      aoMapIntensity: 2,
      normalMap: textureLoader.load('static/textures/bricks/normal.jpg'),
      roughnessMap: textureLoader.load('static/textures/bricks/roughness.jpg'),
    })
  )
  mesh.geometry.setAttribute('uv2', new THREE.Float32BufferAttribute(mesh.geometry.attributes.uv.array, 2))
  mesh.position.set(0, 1.5, 0)
  mesh.name = 'walls'
  return mesh
}

const createRoof = () => {
  const colorTexture = textureLoader.load('static/textures/roof/color.jpg')
  colorTexture.rotation = Math.PI - 0.03
  colorTexture.repeat.set(13, 5)
  colorTexture.wrapS = THREE.RepeatWrapping
  colorTexture.wrapT = THREE.RepeatWrapping
  const normalTexture = textureLoader.load('static/textures/roof/normal.jpg')
  normalTexture.rotation = Math.PI - 0.03
  normalTexture.repeat.set(13, 5)
  normalTexture.wrapS = THREE.RepeatWrapping
  normalTexture.wrapT = THREE.RepeatWrapping
  const roughnessTexture = textureLoader.load('static/textures/roof/roughness.jpg')
  roughnessTexture.rotation = Math.PI - 0.03
  roughnessTexture.repeat.set(13, 5)
  roughnessTexture.wrapS = THREE.RepeatWrapping
  roughnessTexture.wrapT = THREE.RepeatWrapping
  const aoTexture = textureLoader.load('static/textures/roof/ao.jpg')
  aoTexture.rotation = Math.PI - 0.03
  aoTexture.repeat.set(13, 5)
  aoTexture.wrapS = THREE.RepeatWrapping
  aoTexture.wrapT = THREE.RepeatWrapping
  const mesh = new THREE.Mesh(
    new THREE.ConeGeometry(4.5, 2, 4, 100),
    new THREE.MeshStandardMaterial({
      color: '#94264f',
      map: colorTexture,
      normalMap: normalTexture,
      roughnessMap: roughnessTexture,
      aoMap: aoTexture,
      aoMapIntensity: 5
    })
  )
  mesh.geometry.setAttribute('uv2', new THREE.Float32BufferAttribute(mesh.geometry.attributes.uv.array, 2))
  mesh.position.set(0, 4, 0)
  mesh.rotation.y = Math.PI * 0.25
  mesh.name = 'roof'
  return mesh
}

const createDoor = () => {
  const geometry = new THREE.PlaneGeometry(2.5, 2.5, 100, 100)
  const material = new THREE.MeshStandardMaterial({
    color: '#ff9c9d',
    map: textureLoader.load('./static/textures/door/color.jpg'),
    alphaMap: textureLoader.load('./static/textures/door/alpha.jpg'),
    transparent: true,
    aoMap: textureLoader.load('./static/textures/door/ambientOcclusion.jpg'),
    aoMapIntensity: 2.5,
    displacementMap: textureLoader.load('./static/textures/door/height.jpg'),
    displacementScale: 0.05,
    roughnessMap: textureLoader.load('./static/textures/door/roughness.jpg'),
    metalnessMap: textureLoader.load('./static/textures/door/metalness.jpg'),
    normalMap: textureLoader.load('./static/textures/door/normal.jpg')
  })
  const mesh = new THREE.Mesh(geometry, material)
  mesh.geometry.setAttribute('uv2', new THREE.Float32BufferAttribute(mesh.geometry.attributes.uv.array, 2))
  mesh.position.set(0, 1.25, 2.5 + 0.01)
  mesh.name = 'door'
  return mesh
}

const createDoorLight = () => {
  const pointLight = new THREE.PointLight('#fffeba', 3, 12)
  pointLight.position.set(0, 2.75, 3.3)
  pointLight.castShadow = true
  return pointLight
}

const createBushes = () => {
  const material = new THREE.MeshStandardMaterial({ color: '#329429' })
  const bush1 = new THREE.Mesh(new THREE.SphereGeometry(0.7), material)
  bush1.position.set(1.9, 0.3, 3.1)
  bush1.castShadow = true
  bush1.name = 'bush1'
  const bush2 = new THREE.Mesh(new THREE.SphereGeometry(1), material)
  bush2.position.set(2.3, 0.3, 2.3)
  bush2.castShadow = true
  bush1.name = 'bush2'
  const bush3 = new THREE.Mesh(new THREE.SphereGeometry(0.5), material)
  bush3.position.set(2.8, 0.3, 3.3)
  bush3.castShadow = true
  bush1.name = 'bush3'
  const bush4 = new THREE.Mesh(new THREE.SphereGeometry(0.8), material)
  bush4.position.set(-2.6, 0.4, 2.6)
  bush4.castShadow = true
  bush1.name = 'bush4'
  return [bush1, bush2, bush3, bush4]
}

const createGraves = () => {
  const graves: THREE.Group[] = []
  const material = new THREE.MeshLambertMaterial({ color: '#969996' })
  const geometryBase = new THREE.BoxGeometry(0.4, 0.7, 0.1)
  const geometryCover = new THREE.CylinderGeometry(0.2, 0.2, 0.1, undefined, undefined, undefined, undefined, Math.PI)
  for (let i = 0; i < 100; i++) {
    // create grave
    const grave = new THREE.Group()
    const base = new THREE.Mesh(geometryBase, material)
    base.position.set(0, 0.3, 0)
    base.castShadow = true
    const cover = new THREE.Mesh(geometryCover, material)
    cover.position.set(0, 0.605, 0)
    cover.rotation.set(0, Math.PI * 0.5, Math.PI * 0.5)
    cover.castShadow = true
    grave.add(base, cover)
    grave.name = `grave${i}`
    // move grave
    const angle = Math.random() * Math.PI * 2
    const distance = Math.random() * 8 + 6
    grave.position.set(Math.sin(angle) * distance, 0, Math.cos(angle) * distance)
    const angleMiniY = (Math.random() - 0.5) * Math.PI * 0.25
    const angleMiniZ = (Math.random() - 0.5) * Math.PI * 0.1
    grave.rotation.set(0, angleMiniY, angleMiniZ)
    graves.push(grave)
  }
  return graves
}

const mountLight = (scene: THREE.Scene) => {
  const ambientLight = new THREE.AmbientLight('#b9d5ff', 0.3)
  scene.add(ambientLight)
  const moonLight = new THREE.DirectionalLight('#b9d5ff', 0.5)
  moonLight.position.set(4, 7, -2)
  moonLight.castShadow = true
  moonLight.shadow.mapSize.width = 512
  moonLight.shadow.mapSize.height = 512
  moonLight.shadow.camera.far = 20
  scene.add(moonLight)
}

interface SmokeParameters {
  scene: THREE.Scene,
  color?: number | string
  frequency?: number
  speed?: number
  areaXZ?: number
  areaY?: number
}

const mountGhost = ({ scene, color = 0xd450e6, frequency = 2, areaXZ = 3, areaY = 1, speed = 4 }: SmokeParameters) => {
  const light = new THREE.PointLight(color, 1.5, 6)
  scene.add(light)

  const trailSegmentGeometry = new THREE.SphereGeometry(0.3, 6, 9)
  const trailSegmentMaterial = new THREE.MeshStandardMaterial({ color, opacity: 0.03, transparent: true })
  const trail: THREE.Mesh[] = Array.from({ length: 10 }, () => new THREE.Mesh(trailSegmentGeometry, trailSegmentMaterial))
  scene.add(...trail)

  const clock = new THREE.Clock()
  let prevTime = 0
  function animate() {
    const elapsedTime = clock.getElapsedTime()

    light.position.x = 2 + Math.cos(elapsedTime * speed) * areaXZ
    light.position.y = 2 + Math.abs(Math.sin(elapsedTime * frequency)) * areaY
    light.position.z = 2 + Math.sin(elapsedTime * speed) * areaXZ

    if (elapsedTime - prevTime > 0.015) {
      trail[0].position.copy(light.position)
      trail.push(trail.shift() as THREE.Mesh)
      prevTime = elapsedTime
    }

    requestAnimationFrame(animate)
  }
  animate()
}


initScene(props)(({ scene, camera, renderer }) => {
  camera.position.set(3, 2, 9)

  scene.fog = new THREE.Fog(0x262837, 1, 17)

  const floor = createFloor()
  scene.add(floor)

  const house = new THREE.Group()

  const walls = createWalls()
  const roof = createRoof()
  const door = createDoor()
  const doorLIght = createDoorLight()

  house.add(walls, roof, door, doorLIght)
  scene.add(house)

  const bushes = createBushes()
  scene.add(...bushes)

  const graves = createGraves()
  scene.add(...graves)

  mountLight(scene)

  mountGhost({ scene, color: 0xe3fdc4, frequency: 1, areaXZ: 5, areaY: 2, speed: 1 })
  mountGhost({ scene, color: 0xe3fdc4, frequency: 1, areaXZ: 7, areaY: 4, speed: -1 })

  function animate() {
    requestAnimationFrame(animate)
    renderer.render(scene, camera)
    stats.update()
  }
  animate()

  initHelpersControls(gui, scene)
})
