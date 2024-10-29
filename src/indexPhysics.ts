import * as THREE from "three"
import GUI from "lil-gui"
import { initScene, Props as InitSceneProps } from "./bootstrap/bootstrap"
import { stats } from "./utils/stats"
import { initHelpersControls } from "./controls/helper-controls"
import * as CANNON from "cannon"
import { convertVector } from './utils/convert-vec3-vector3'
import { useCameraCoordinates } from "./utils/camera-coordinates"

interface ActiveItem {
  body: CANNON.Body
  mesh: THREE.Mesh
}

const sceneProps: InitSceneProps = {
  backgroundColor: new THREE.Color('#303030'),
}

const gui = new GUI()
const textureLoader = new THREE.TextureLoader()

// geometry/materials refference
const shellRenderGeometry = new THREE.SphereGeometry(1, 20, 20)
const shellRenderMaterial = new THREE.MeshStandardMaterial({ color: '#998e8e', metalness: 0.3, roughness: 0.1 })
const shellPhysicShape = new CANNON.Sphere(1)
const shellPhysicMaterial = new CANNON.Material('shell')

const floorRenderGeometry = new THREE.BoxGeometry(30, 0.25, 30)
const floorRenderMaterial =  new THREE.MeshStandardMaterial({ color: 0xdddddd })
const floorPhysicShape = new CANNON.Box(new CANNON.Vec3(30 / 2, 0.25 / 2, 30 / 2))
const floorPhysicMaterial = new CANNON.Material('plane')

const shellPlaneContactMaterial = new CANNON.ContactMaterial(
  shellPhysicMaterial,
  floorPhysicMaterial,
  {
    friction: 0.2,
    restitution: 0.7,
  }
)

const initPhysicsWorld = () => {
  const world = new CANNON.World()
  world.gravity = new CANNON.Vec3(0, -9.81, 0)
  world.addContactMaterial(shellPlaneContactMaterial)
  world.broadphase = new CANNON.SAPBroadphase(world)
  world.allowSleep = true
  return world
}

const mountFloor = (scene: THREE.Scene, world: CANNON.World) => {
  const colorTexture = textureLoader.load('static/textures/grass/color.jpg')
  colorTexture.wrapS = THREE.RepeatWrapping
  colorTexture.wrapT = THREE.RepeatWrapping
  colorTexture.repeat.set(10, 10)
  floorRenderMaterial.map = colorTexture
  const normalTexture = textureLoader.load('static/textures/grass/normal.jpg')
  normalTexture.wrapS = THREE.RepeatWrapping
  normalTexture.wrapT = THREE.RepeatWrapping
  normalTexture.repeat.set(10, 10)
  floorRenderMaterial.normalMap = normalTexture
  const ambientOcclusionTexture = textureLoader.load('static/textures/grass/ambientOcclusion.jpg')
  ambientOcclusionTexture.wrapS = THREE.RepeatWrapping
  ambientOcclusionTexture.wrapT = THREE.RepeatWrapping
  ambientOcclusionTexture.repeat.set(10, 10)
  floorRenderMaterial.aoMap = ambientOcclusionTexture
  floorRenderMaterial.aoMapIntensity = 3
  const roughnessTexture = textureLoader.load('static/textures/grass/roughness.jpg')
  roughnessTexture.wrapS = THREE.RepeatWrapping
  roughnessTexture.wrapT = THREE.RepeatWrapping
  roughnessTexture.repeat.set(10, 10)
  floorRenderMaterial.roughnessMap = roughnessTexture

  const mesh = new THREE.Mesh(
    floorRenderGeometry,
    floorRenderMaterial
  )
  mesh.position.y = -2
  mesh.receiveShadow = true
  scene.add(mesh)

  const body = new CANNON.Body({
    mass: 0,
    shape: floorPhysicShape,
    material: floorPhysicMaterial,
  })
  body.position.y = -2
  world.addBody(body)
}

const useShell = (scene: THREE.Scene, world: CANNON.World) => {
  const reset = ({ body, mesh }: ActiveItem) => {
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

  const create = ({ position, direction }: Record<'position' | 'direction', CANNON.Vec3>) => {
    const mesh = new THREE.Mesh(shellRenderGeometry, shellRenderMaterial)
    mesh.position.copy(position)
    mesh.castShadow = true
    scene.add(mesh)

    const body = new CANNON.Body({
      mass: 1,
      shape: shellPhysicShape,
      material: shellPhysicMaterial,
    })
    body.position.copy(position)
    body.applyLocalForce(direction, position)
    world.addBody(body)

    return {
      mesh,
      body,
    }
  }

  return [create, reset] as const
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

initScene(sceneProps)(({ scene, camera, renderer, orbitControls }) => {
  camera.position.z = 9

  const world = initPhysicsWorld()

  mountFloor(scene, world)

  const [createShell, resetShell] = useShell(scene, world)
  const [getCameraPos, getCameraDir] = useCameraCoordinates(camera)
  
  const activeItems: ActiveItem[] = []

  window.addEventListener('keydown', (event: KeyboardEvent) => {
    if (event.code === "Space") {
      const sphere = createShell(
        {
          position: convertVector(getCameraPos()),
          direction: convertVector(getCameraDir().multiplyScalar(1000))
        }
      )
      activeItems.push(sphere)
    }
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
    for (let i = activeItems.length - 1; i >= 0; i--) {
      const { body, mesh } = activeItems[i]   
      if (!isContainsPoint(mesh.position)) {
        resetShell(activeItems[i])
        activeItems.splice(i, 1)
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

  initHelpersControls(gui, scene)
})
