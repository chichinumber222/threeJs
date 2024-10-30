import * as THREE from "three"
import { initScene, Props as InitSceneProps } from "./bootstrap/bootstrap"
import { stats } from "./utils/stats"
import * as CANNON from "cannon"
import { convertVector } from './utils/convert-vec3-vector3'
import { useCameraCoordinates } from "./utils/camera-coordinates"

interface ActiveObject {
  body: CANNON.Body
  mesh: THREE.Mesh
}

const sceneProps: InitSceneProps = {
  backgroundColor: new THREE.Color('#303030'),
  disableDefaultLights: true,
}

const textureLoader = new THREE.TextureLoader()

// physic material refference
const objectPhysicMaterial = new CANNON.Material('object')
const floorPhysicMaterial = new CANNON.Material('plane')

const objectFloorContactMaterial = new CANNON.ContactMaterial(
  objectPhysicMaterial,
  floorPhysicMaterial,
  {
    friction: 0.2,
    restitution: 0.7,
  }
)
const objectObjectContactMaterial = new CANNON.ContactMaterial(
  objectPhysicMaterial,
  objectPhysicMaterial,
  {
    friction: 0.4,
    restitution: 0.5,
  }
)

const initPhysicsWorld = () => {
  const world = new CANNON.World()
  world.gravity = new CANNON.Vec3(0, -9.81, 0)
  world.addContactMaterial(objectFloorContactMaterial)
  world.addContactMaterial(objectObjectContactMaterial)
  world.broadphase = new CANNON.SAPBroadphase(world)
  world.allowSleep = true
  return world
}

const mountFloor = (scene: THREE.Scene, world: CANNON.World) => {
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

  const renderGeometry = new THREE.BoxGeometry(20, 0.25, 20)
  const renderMaterial =  new THREE.MeshStandardMaterial({ 
    color: 0xdddddd,
    map: colorTexture,
    normalMap: normalTexture,
    aoMap: ambientOcclusionTexture,
    aoMapIntensity: 3,
    roughnessMap: roughnessTexture
  })
  const mesh = new THREE.Mesh(renderGeometry, renderMaterial)
  mesh.receiveShadow = true
  scene.add(mesh)

  const physicShape = new CANNON.Box(new CANNON.Vec3(20 / 2, 0.25 / 2, 20 / 2))
  const body = new CANNON.Body({
    mass: 0,
    shape: physicShape,
    material: floorPhysicMaterial,
  })
  world.addBody(body)
}

const createBlock = (position: CANNON.Vec3, { width, height, depth }: Record<'width'| 'height' | 'depth', number>): ActiveObject => {
  const renderGeometry = new THREE.BoxGeometry(width, height, depth)
  const renderMaterial = new THREE.MeshStandardMaterial({
    map: textureLoader.load('static/textures/block/color.jpg'),
    normalMap: textureLoader.load('static/textures/block/normal.jpg'),
    aoMap: textureLoader.load('static/textures/block/ao.jpg'),
    aoMapIntensity: 5,
    roughnessMap: textureLoader.load('static/textures/block/roughness.jpg'),
    roughness:20
  })
  const mesh = new THREE.Mesh(renderGeometry, renderMaterial)
  mesh.castShadow = true
  mesh.position.copy(position)
  
  const physicShape = new CANNON.Box(new CANNON.Vec3(width / 2, height / 2, depth / 2))
  const body = new CANNON.Body({
    mass: 0.5,
    shape: physicShape,
    material: objectPhysicMaterial
  })
  body.position.copy(position)

  return {
    mesh,
    body
  }
}

const createBlockWall = (scene: THREE.Scene, world: CANNON.World) => {
  const rowsCount = 7, columnsCount = 7
  const blockWidth = 2, blockHeight = 1, blockDepth = 1
  const blocks: ActiveObject[] = []
  for (let r = 0; r < rowsCount; r++) {
    const y = blockHeight * r + (blockHeight / 2) + 0.1
    for (let c = 0; c < columnsCount; c++) {
      const x = (-1) * (columnsCount / 2) * blockWidth + blockWidth * c + 0.1
      const block = createBlock(
        new CANNON.Vec3(x, y, 0), 
        { width: blockWidth, height: blockHeight, depth: blockDepth}
      )
      blocks.push(block)
      scene.add(block.mesh)
      world.addBody(block.body)
    }
  }
  return blocks
}

const useObjects = (scene: THREE.Scene, world: CANNON.World) => {
  const renderGeometry = new THREE.SphereGeometry(1, 20, 20)
  const renderMaterial = new THREE.MeshStandardMaterial({ color: '#998e8e', metalness: 0.3, roughness: 0.1 })
  const physicShape = new CANNON.Sphere(1)
  
  const createShell = ({ position, direction }: Record<'position' | 'direction', CANNON.Vec3>) => {
    const mesh = new THREE.Mesh(renderGeometry, renderMaterial)
    mesh.position.copy(position)
    mesh.castShadow = true
    scene.add(mesh)

    const body = new CANNON.Body({
      mass: 1,
      shape: physicShape,
      material: objectPhysicMaterial,
    })
    body.position.copy(position)
    body.applyLocalForce(direction, position)
    world.addBody(body)

    return {
      mesh,
      body,
    }
  }

  const resetObject = ({ body, mesh }: ActiveObject) => {
    // render clear
    mesh.geometry?.dispose()
    if (!Array.isArray(mesh.material)) {
      mesh.material?.dispose()
    } else {
      mesh.material.forEach((material) => material.dispose())
    }
    scene.remove(mesh)
    // physics clear
    world.remove(body)
  }

  return [createShell, resetObject] as const
}

const useBoundingBox = (size?: number) => {
  const s = size ?? 100
  const currentBox = new THREE.Box3(
    new THREE.Vector3(-s, -s, -s),
    new THREE.Vector3(s, s, s)
  ) 

  const isContainsPoint = (point: THREE.Vector3) => {
    return currentBox.containsPoint(point)
  }

  const isContainsBox = (box: THREE.Box3) => {
    return currentBox.containsBox(box)
  }

  return [isContainsPoint, isContainsBox] as const
}

const mountLights = (scene: THREE.Scene) => {
  const ambientLight = new THREE.AmbientLight(0xffffff, 2)
  scene.add(ambientLight) 

  const directionalLight = new THREE.DirectionalLight(0xffffff, 2)
  directionalLight.position.set(3, 20, 5)
  directionalLight.castShadow = true
  directionalLight.shadow.camera.near = 0.1
  directionalLight.shadow.camera.far = 50
  directionalLight.shadow.camera.right = 30
  directionalLight.shadow.camera.left = -30
  directionalLight.shadow.camera.top = 30
  directionalLight.shadow.camera.bottom = -30
  directionalLight.shadow.mapSize.width = 2048
  directionalLight.shadow.mapSize.height = 2048
  directionalLight.shadow.radius = 2
  directionalLight.shadow.bias = -0.00005
    
  scene.add(directionalLight)
}


initScene(sceneProps)(({ scene, camera, renderer, orbitControls }) => {
  camera.position.set(0, 2, 15)
  
  const world = initPhysicsWorld()

  mountFloor(scene, world)

  mountLights(scene)

  const activeObjects: ActiveObject[] = []

  const blocks = createBlockWall(scene, world)
  activeObjects.push(...blocks)

  const [createShell, resetObject] = useObjects(scene, world)
  const [getCameraPos, getCameraDir] = useCameraCoordinates(camera)

  window.addEventListener('keydown', (event: KeyboardEvent) => {
    if (event.code === "Space") {
      const sphere = createShell(
        {
          position: convertVector(getCameraPos()),
          direction: convertVector(getCameraDir().multiplyScalar(1500))
        }
      )
      activeObjects.push(sphere)
    }
  })
  document.getElementById('shootBtn')?.addEventListener('click', () => {
    const sphere = createShell(
      {
        position: convertVector(getCameraPos()),
        direction: convertVector(getCameraDir().multiplyScalar(1500))
      }
    )
    activeObjects.push(sphere)
  })

  let delta = 0, prevTime = 0
  const clock = new THREE.Clock()
  const [ isContainsPoint ] = useBoundingBox()
  function animate() {
    // times
    const elapsedTime = clock.getElapsedTime()
    delta = elapsedTime - prevTime
    prevTime = elapsedTime

    // update items positions/rotations
    world.step(1 / 60, delta, 3)
    for (let i = activeObjects.length - 1; i >= 0; i--) { // reverse loop for dynamically removing elements from an array (not changes indexes)
      const { body, mesh } = activeObjects[i]   
      if (!isContainsPoint(mesh.position)) {
        resetObject(activeObjects[i])
        activeObjects.splice(i, 1)
        continue
      }
      mesh.position.copy(body.position)
      mesh.quaternion.copy(body.quaternion)
    }

    renderer.render(scene, camera)
    orbitControls?.update()
    stats.update()
    requestAnimationFrame(animate)
  }
  animate()
})
