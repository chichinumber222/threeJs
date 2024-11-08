import * as THREE from "three"
import { initScene, Props as InitSceneProps } from "./bootstrap/bootstrap"
import { stats } from "./utils/stats"
import * as CANNON from "cannon"
import { convertVector } from './utils/convert-vec3-vector3'
import { useCameraCoordinates } from "./utils/camera-coordinates"
import { GLTFLoader, GLTF } from 'three/examples/jsm/loaders/GLTFLoader'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
import * as _ from 'lodash'

interface ActiveObject {
  physic: CANNON.Body
  render: THREE.Group<THREE.Object3DEventMap> | THREE.Mesh
}

const sceneProps: InitSceneProps = {
  backgroundColor: new THREE.Color('#303030'),
  disableDefaultLights: true,
  canvasElement: document.getElementsByTagName('canvas')[0],
}

console.log('import.meta.url', import.meta.url)

const initMusic = () => {
  const music = new Audio("./static/music/Five Nights at Freddy's - 8 Bit lofi Hip Hop.mp3")
  music.loop = true
  music.volume = 0.02
  document.querySelector('.button.location_left')?.addEventListener('click', () => {
    if (music.paused) {
      music.play()
      return
    }
    music.pause()
  })
}
initMusic()

const textureLoader = new THREE.TextureLoader()
// texture load
//* floor
const floorTextures = {
  color: textureLoader.load('static/textures/grass/color.jpg'),
  normal: textureLoader.load('static/textures/grass/normal.jpg'),
  ao: textureLoader.load('static/textures/grass/ambientOcclusion.jpg'),
  rough: textureLoader.load('static/textures/grass/roughness.jpg')
}
//* objects
const objectsTextures = {
  color: textureLoader.load('static/textures/block/color.jpg'),
  normal: textureLoader.load('static/textures/block/normal.jpg'),
  ao: textureLoader.load('static/textures/block/ao.jpg'),
  rough: textureLoader.load('static/textures/block/roughness.jpg')
}

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

const gltfLoader = new GLTFLoader()
const drakoLoader = new DRACOLoader()
drakoLoader.setDecoderPath('./static/libs/draco/')
gltfLoader.setDRACOLoader(drakoLoader)
// model load
const modelLoadPromise = new Promise<GLTF>((resolve) => {
  gltfLoader.load('./static/gltf/hamburger/hambergerFinal.glb', (gltf) => {
    resolve(gltf)
  })
})

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
  const { color, normal, ao, rough } = floorTextures
  color.wrapS = THREE.RepeatWrapping
  color.wrapT = THREE.RepeatWrapping
  color.repeat.set(10, 10)
  normal.wrapS = THREE.RepeatWrapping
  normal.wrapT = THREE.RepeatWrapping
  normal.repeat.set(10, 10)
  ao.wrapS = THREE.RepeatWrapping
  ao.wrapT = THREE.RepeatWrapping
  ao.repeat.set(10, 10)
  rough.wrapS = THREE.RepeatWrapping
  rough.wrapT = THREE.RepeatWrapping
  rough.repeat.set(10, 10)

  const renderGeometry = new THREE.BoxGeometry(20, 0.25, 20)
  const renderMaterial = new THREE.MeshStandardMaterial({
    color: 0x8d9862,
    map: color,
    normalMap: normal,
    aoMap: ao,
    aoMapIntensity: 3,
    roughnessMap: rough
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

const createModel = (scene: THREE.Scene, world: CANNON.World, activeObjects: ActiveObject[]) => {
  modelLoadPromise.then((gltf) => {
    const model = new THREE.Group().copy(gltf.scene)
    model.scale.set(0.3, 0.3, 0.3)
    const boundingBox = new THREE.Box3().setFromObject(model)
    const startPosition = new CANNON.Vec3(
      0, 
      (boundingBox.max.y - boundingBox.min.y) / 2 + 0.26,
      6,
    )
    model.position.copy(startPosition)
    scene.add(model)

    const physicShape = new CANNON.Box(new CANNON.Vec3(
      (boundingBox!.max.x - boundingBox!.min.x) / 2,
      (boundingBox!.max.y - boundingBox!.min.y) / 2,
      (boundingBox!.max.z - boundingBox!.min.z) / 2,
    ))
    const physicBody = new CANNON.Body({
      shape: physicShape,
      mass: 1.5,
      material: objectPhysicMaterial
    })
    physicBody.position.copy(startPosition)
    world.addBody(physicBody)

    activeObjects.push({
      render: model,
      physic: physicBody,
    })
  })
}

const useBlock = ({ width, height, depth }: Record<'width'| 'height' | 'depth', number>) => {
  const { color, normal, ao, rough } = objectsTextures
  const renderGeometry = new THREE.BoxGeometry(width, height, depth)
  const renderMaterial = new THREE.MeshStandardMaterial({
    map: color,
    normalMap: normal,
    aoMap: ao,
    aoMapIntensity: 5,
    roughnessMap: rough,
    roughness: 20
  })

  const physicShape = new CANNON.Box(new CANNON.Vec3(width / 2, height / 2, depth / 2))

  return (position: CANNON.Vec3) => {
    const mesh = new THREE.Mesh(renderGeometry, renderMaterial)
    mesh.castShadow = true
    mesh.position.copy(position)

    const body = new CANNON.Body({
      mass: 0.5,
      shape: physicShape,
      material: objectPhysicMaterial
    })
    body.position.copy(position)

    return {
      render: mesh,
      physic: body
    }
  }
}


const createBlockWall = (scene: THREE.Scene, world: CANNON.World) => {
  const rowsCount = 7, columnsCount = 7
  const blockWidth = 2, blockHeight = 1, blockDepth = 1
  const createBlock = useBlock({ width: blockWidth, height: blockHeight, depth: blockDepth })
  const blocks: ActiveObject[] = []
  const positionVec3 = new CANNON.Vec3(0, 0, 0)
  for (let r = 0; r < rowsCount; r++) {
    const y = blockHeight * r + (blockHeight / 2) + 0.1
    for (let c = 0; c < columnsCount; c++) {
      const x = (-1) * (columnsCount / 2) * blockWidth + blockWidth * c + 0.1
      positionVec3.set(x, y, 0)
      const block = createBlock(positionVec3)
      blocks.push(block)
      scene.add(block.render)
      world.addBody(block.physic)
    }
  }
  return blocks
}

const useShell = (scene: THREE.Scene, world: CANNON.World) => {
  const renderGeometry = new THREE.SphereGeometry(1, 20, 20)
  const renderMaterial = new THREE.MeshStandardMaterial({ color: '#998e8e', metalness: 0.3, roughness: 0.1 })
  const physicShape = new CANNON.Sphere(1)

  return ({ position, direction }: Record<'position' | 'direction', CANNON.Vec3>) => {
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
      render: mesh,
      physic: body,
    }
  }
}

const useReset = (scene: THREE.Scene, world: CANNON.World) => {
  const resetMesh = (mesh: THREE.Mesh) => {
    mesh.geometry?.dispose()
    if (!Array.isArray(mesh.material)) {
      mesh.material?.dispose()
    } else {
      mesh.material.forEach((material) => material.dispose())
    }
  }

  return ({ physic, render }: ActiveObject) => {
    render.traverse((elem) => {
      if (elem instanceof THREE.Mesh) {
        resetMesh(elem)
      }
    })
    scene.remove(render)
    world.remove(physic)
  }
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
  const world = initPhysicsWorld()
  mountFloor(scene, world)
  mountLights(scene)

  const activeObjects: ActiveObject[] = []

  const createShell = useShell(scene, world)
  const resetObject = useReset(scene, world)
  const [getCameraPos, getCameraDir] = useCameraCoordinates(camera)

  const runShell = _.throttle(() => {
    const shell = createShell(
      {
        position: convertVector(getCameraPos()),
        direction: convertVector(getCameraDir().multiplyScalar(1500))
      }
    )
    activeObjects.push(shell)
  }, 100)
  window.addEventListener('keydown', (event: KeyboardEvent) => {
    if (event.code === "Space") runShell()
  })
  document.querySelector('.button.location_right')?.addEventListener('click', runShell)

  let isGameGoing = false
  const runGame = () => {
    if (activeObjects.length) {
      activeObjects.forEach((object) => resetObject(object))
      activeObjects.length = 0
    }
    orbitControls?.reset()
    camera.position.set(0, 2, 15)
    const blocks = createBlockWall(scene, world)
    activeObjects.push(...blocks)
    createModel(scene, world, activeObjects)
    isGameGoing = true
  }
  runGame()

  const times = {
    delta: 0,
    prevTime: 0,
    deltaPaused: 0,
    pausedTime: 0,
    pauseCount: 10
  }
  const mutableElements = {
    congratulation: {
      container: document.getElementById('congratulation')!,
      count: document.querySelector('.countdown .count')!
    },
    crosshair: {
      container: document.getElementById('crosshair')!,
    },
  }
  const clock = new THREE.Clock()
  const [isContainsPoint] = useBoundingBox()
  function animate() {
    // times
    const elapsedTime = clock.getElapsedTime()
    times.delta = elapsedTime - times.prevTime
    times.prevTime = elapsedTime

    // update items positions/rotations
    world.step(1 / 60, times.delta, 3)
    //* reverse loop for dynamically removing elements from an array (not changes indexes)
    for (let i = activeObjects.length - 1; i >= 0; i--) {
      const { physic, render } = activeObjects[i]   
      if (!isContainsPoint(render.position)) {
        resetObject(activeObjects[i])
        activeObjects.splice(i, 1)
        continue
      }
      render.position.copy(physic.position)
      render.quaternion.copy(physic.quaternion)
    }

    // win process
    if (activeObjects.length === 0 && isGameGoing === true) {
      isGameGoing = false
      times.pausedTime = elapsedTime
      mutableElements.crosshair.container.style.display = 'none'
      mutableElements.congratulation.container.style.display = 'flex'
    }
    if (isGameGoing === false) {
      times.deltaPaused = elapsedTime - times.pausedTime
      mutableElements.congratulation.count.innerHTML = `${Math.round(times.pauseCount - times.deltaPaused)}`
      if (times.deltaPaused > times.pauseCount) {
        mutableElements.congratulation.container.style.display = 'none'
        mutableElements.crosshair.container.style.display = 'flex'
        times.pausedTime = 0
        times.deltaPaused = 0
        runGame()
        isGameGoing = true
      }
    }

    renderer.render(scene, camera)
    orbitControls?.update()
    stats.update()
    requestAnimationFrame(animate)
  }
  animate()
})
