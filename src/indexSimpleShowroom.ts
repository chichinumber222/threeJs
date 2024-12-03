import * as THREE from "three"
import { initScene, Props as InitSceneProps } from './bootstrap/bootstrap'
import { stats } from "./utils/stats"
import { onChangeCursor } from "./utils/update-coord"
import gsap from 'gsap'
import { OrbitControls } from "./controller/orbit"
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import _ from 'lodash'
import { mobileCheck } from "./utils/mobile-check"
import plinthVertexShader from './shaders/showroom/plinth/vertex.glsl'
import plinthFragmentShader from './shaders/showroom/plinth/fragment.glsl'
import clockText from './static/texts/clock.txt'
import dartBoard from './static/texts/dartBoard.txt'
import pictureText from './static/texts/pictureText.txt'
import cameraText from './static/texts/cameraText.txt'

interface ActionParams {
  camera: THREE.PerspectiveCamera
  point: THREE.Vector3
  orbitControls?: OrbitControls
  markers?: (THREE.Mesh | THREE.Group)[]
  enableEventHandlers: (value: boolean) => void
}

interface HoverEnabledParams {
  enable: true
  markers: (THREE.Mesh | THREE.Group)[]
  point: THREE.Vector3
}

interface HoverDisabledParams {
  enable: false
  markers: (THREE.Mesh | THREE.Group)[]
}

type HoverParams = HoverEnabledParams | HoverDisabledParams

interface Actions {
  leftClick?: (params: ActionParams) => void
  rightClick?: (params: ActionParams) => void
  hover?: (params: HoverParams) => void
}

type ActionsMap = Map<string, Actions>
type BoxesMap = Map<string, THREE.Object3D>

interface Positions {
  start: THREE.Vector3,
  last: THREE.Vector3
}

interface Quaternions {
  start: THREE.Quaternion
  last: THREE.Quaternion
}

interface DescriptionOptionsTopBottom {
  text: string
  position: 'top' | 'bottom'
  height?: string
}

interface DescriptionOptionsLeftRight {
  text: string
  position: 'left' | 'right'
  width?: string
}

type DescriptionOptions = DescriptionOptionsTopBottom | DescriptionOptionsLeftRight

const props: InitSceneProps = {
  disableDefaultLights: true,
  canvasElement: <HTMLCanvasElement>document.getElementById('webgl'),
}

const isMobile = mobileCheck()
const textureLoader = new THREE.TextureLoader()
const gltfLoader = new GLTFLoader()
const raycaster = new THREE.Raycaster()
const mouse = onChangeCursor()
const floorWidth = 10
const floorLength = 10
const wallHeight = 3.33
const plinthHeight = 0.1
const plinthDepth = 0.03
const offset = 0.1
const floorOffset = 0.9
const positions: Positions = {
  start: new THREE.Vector3(1, 1.5, 3),
  last: new THREE.Vector3(1, 1.5, 3),
}
const quaternions: Quaternions = {
  start: new THREE.Quaternion(0, 0, 0),
  last: new THREE.Quaternion(0, 0, 0),
}

const useCameraDirection = (camera: THREE.PerspectiveCamera) => {
  const direction = new THREE.Vector3()
  return () => {
    camera.getWorldDirection(direction)
    return direction
  }
}

const useControl = (camera: THREE.PerspectiveCamera, orbitControls?: OrbitControls) => {
  const getCameraDirection = useCameraDirection(camera)
  const cameraEyes = new THREE.Vector3()
  return () => {
    cameraEyes.copy(camera.position).add(getCameraDirection().multiplyScalar(0.5))
    orbitControls?.target.copy(cameraEyes)
    orbitControls?.update()
  }
}

const getRepeatableTexture = (texture: THREE.Texture, repeatCountX: number = 5, repeatCountY: number = 5) => {
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(repeatCountX, repeatCountY)
  return texture
}

const descriptionModeAnimation = (
  actionParams: ActionParams,
  stopPosition: THREE.Vector3,
  stopQuaternion: THREE.Quaternion,
  descriptionOptions: DescriptionOptions,
) => {
  const { enableEventHandlers, orbitControls, camera } = actionParams
  positions.last?.copy(camera.position)
  quaternions.last?.copy(camera.quaternion)
  enableEventHandlers(false)
  if (orbitControls) orbitControls.enabled = false
  const timeline = gsap.timeline({
    onComplete: () => {
      let textElement: HTMLElement | null = null
      let exitButtonElement: HTMLElement | null = null
      switch (descriptionOptions.position) {
        case 'left': {
          textElement = <HTMLElement>document.getElementsByClassName('text_left')[0]
          exitButtonElement = <HTMLElement>document.getElementsByClassName('exit_left')[0]
          textElement.style.width = descriptionOptions?.width || '35%'
          break
        }
        case 'right': {
          textElement = <HTMLElement>document.getElementsByClassName('text_right')[0]
          exitButtonElement = <HTMLElement>document.getElementsByClassName('exit_right')[0]
          textElement.style.width = descriptionOptions?.width || '35%'
          break
        }
        case 'top': {
          textElement = <HTMLElement>document.getElementsByClassName('text_top')[0]
          exitButtonElement = <HTMLElement>document.getElementsByClassName('exit_top')[0]
          textElement.style.height = descriptionOptions?.height || '25%'
          break
        }
        case 'bottom': {
          textElement = <HTMLElement>document.getElementsByClassName('text_bottom')[0]
          exitButtonElement = <HTMLElement>document.getElementsByClassName('exit_bottom')[0]
          textElement.style.height = descriptionOptions?.height || '25%'
          break
        }
      }
      textElement.innerHTML = `${descriptionOptions.text}`
      const exit = (event: MouseEvent) => {
        event.stopPropagation()
        camera.position.copy(positions.last || positions.start)
        camera.quaternion.copy(quaternions.last || quaternions.start)
        enableEventHandlers(true)
        if (orbitControls) orbitControls.enabled = true
        textElement.classList.add('no_visible')
        exitButtonElement.classList.add('no_visible')
        textElement.innerHTML = ``
        exitButtonElement.removeEventListener('click', exit)
      }
      exitButtonElement.addEventListener('click', exit)
      textElement.classList.remove('no_visible')
      exitButtonElement.classList.remove('no_visible')
    }
  })
  timeline.addLabel("start", 0)
  const startQuaternion = camera.quaternion.clone()
  const endQuaternion = stopQuaternion.clone()
  timeline.to({ t: 0 }, {
    duration: 1.5,
    t: 1,
    ease: "none",
    onUpdate: function () {
      const t = this.targets()[0].t
      camera.quaternion.slerpQuaternions(startQuaternion, endQuaternion, t)
    }
  }, "start")
  timeline.to(camera.position, {
    duration: 1.5,
    ease: "none",
    x: stopPosition.x,
    z: stopPosition.z,
    y: stopPosition.y,
  }, "start")
}

const createWoodFloor = (scene: THREE.Scene) => {
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(floorWidth, floorLength),
    new THREE.MeshStandardMaterial({
      color: 0xcccccc,
      map: getRepeatableTexture(textureLoader.load('static/textures/wood-floor/color.jpg'), 10, 10),
      normalMap: getRepeatableTexture(textureLoader.load('static/textures/wood-floor/normal.jpg'), 10, 10),
      roughnessMap: getRepeatableTexture(textureLoader.load('static/textures/wood-floor/rough.jpg'), 10, 10),
    })
  )
  mesh.rotation.x = - Math.PI * 0.5
  mesh.geometry.setAttribute('uv2', new THREE.Float32BufferAttribute(mesh.geometry.attributes.uv.array, 2))
  mesh.name = 'wood-floor'
  scene.add(mesh)
}

const createCarpet = (scene: THREE.Scene, boxesMap: BoxesMap, actionsMap: ActionsMap) => {
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(floorWidth - 2 * floorOffset, floorLength - 2 * floorOffset),
    new THREE.MeshStandardMaterial({
      color: 0xdddddd,
      map: getRepeatableTexture(textureLoader.load('static/textures/carpet/color.jpg')),
      normalMap: getRepeatableTexture(textureLoader.load('static/textures/carpet/normal.jpg')),
      aoMap: getRepeatableTexture(textureLoader.load('static/textures/carpet/ao.jpg')),
      aoMapIntensity: 0.7,
      roughnessMap: getRepeatableTexture(textureLoader.load('static/textures/carpet/rough.jpg')),
    })
  )
  mesh.rotation.x = -Math.PI * 0.5
  mesh.position.y += 0.02
  mesh.geometry.setAttribute('uv2', new THREE.Float32BufferAttribute(mesh.geometry.attributes.uv.array, 2))
  mesh.receiveShadow = true
  mesh.name = 'carpet'
  scene.add(mesh)
  const id = THREE.MathUtils.generateUUID()
  // set actions
  const rightClickAction = ({ point, orbitControls, enableEventHandlers, markers, camera }: ActionParams) => {
    const timeline = gsap.timeline({
      onStart: () => {
        if (orbitControls) orbitControls.enabled = false
        enableEventHandlers(false)
      },
      onComplete: () => {
        if (orbitControls) orbitControls!.enabled = true
        enableEventHandlers(true)
      },
    })
    timeline.addLabel("start", 0)
    if (markers?.length) {
      const floorMarker = markers[0]
      const floorMarkerBase = floorMarker.children[0] as THREE.Mesh<THREE.CircleGeometry, THREE.MeshBasicMaterial>
      const floorMarkerSecondary = floorMarker.children[1] as THREE.Mesh<THREE.CircleGeometry, THREE.MeshBasicMaterial>
      timeline.to(floorMarkerBase.scale, {
        duration: 0.2,
        x: 1.2,
        y: 1.2,
        ease: "power2.inOut",
        repeat: 1,
        yoyo: true,
      }, "start")
      timeline.to(floorMarkerSecondary.material, {
        duration: 0.2,
        ease: "power2.inOut",
        opacity: 0.15,
        repeat: 1,
        yoyo: true,
      }, "start")
    }
    timeline.to(camera.position, {
      duration: 0.7,
      ease: "power2.inOut",
      x: point.x,
      z: point.z,
    }, "start+=0.15")
  }
  const hoverAction = (params: HoverParams) => {
    const floorMarker = params.markers[0]
    if (params.enable) {
      floorMarker.position.set(params.point.x, params.point.y + 0.025, params.point.z)
      floorMarker.visible = true
      return
    }
    floorMarker.visible = false
  }
  actionsMap.set(id, {
    rightClick: rightClickAction,
    hover: hoverAction,
  })
  // set box
  const boundingBox = new THREE.Box3().setFromObject(mesh)
  const boundingBoxSize = new THREE.Vector3()
  boundingBox.getSize(boundingBoxSize)
  const box = new THREE.Mesh(
    new THREE.BoxGeometry(boundingBoxSize.x, boundingBoxSize.y, boundingBoxSize.z),
    new THREE.MeshBasicMaterial({ visible: false })
  )
  const boundingBoxCenter = new THREE.Vector3()
  boundingBox.getCenter(boundingBoxCenter)
  box.position.copy(boundingBoxCenter)
  box.traverse((child) => child.userData.id = id)
  scene.add(box)
  boxesMap.set(id, box)
}

const createWalls = (scene: THREE.Scene) => {
  const geometry1 = new THREE.PlaneGeometry(floorWidth, wallHeight)
  const geometry2 = new THREE.PlaneGeometry(floorLength, wallHeight)
  const material = new THREE.MeshStandardMaterial({
    color: '#FCFBF4',
    map: getRepeatableTexture(textureLoader.load('static/textures/wallpaper/color.jpg'), 5, 2),
    normalMap: getRepeatableTexture(textureLoader.load('static/textures/wallpaper/normal.jpg'), 5, 2),
    roughness: 0.35,
  })
  const wallNorth = new THREE.Mesh(geometry1, material)
  wallNorth.position.set(0, wallHeight / 2 - offset, -(floorLength / 2 - offset))
  wallNorth.name = 'wall-north'
  const wallSouth = new THREE.Mesh(geometry1, material)
  wallSouth.position.set(0, wallHeight / 2 - offset, floorLength / 2 - offset)
  wallSouth.rotation.set(0, Math.PI, 0)
  wallSouth.name = 'wall-south'
  const wallWest = new THREE.Mesh(geometry2, material)
  wallWest.position.set(floorWidth / 2 - offset, wallHeight / 2 - offset, 0)
  wallWest.rotation.set(0, -Math.PI / 2, 0)
  wallWest.name = 'wall-west'
  const wallEast = new THREE.Mesh(geometry2, material)
  wallEast.position.set(-(floorWidth / 2 - offset), wallHeight / 2 - offset, 0)
  wallEast.rotation.set(0, Math.PI / 2, 0)
  wallEast.name = 'wall-east'
  scene.add(wallNorth, wallSouth, wallWest, wallEast)
}

const createPlinths = (scene: THREE.Scene) => {
  const geometry1 = new THREE.BoxGeometry(floorWidth, plinthHeight, plinthDepth, 100, 50)
  const geometry2 = new THREE.BoxGeometry(floorLength, plinthHeight, plinthDepth, 100, 50)
  const material = new THREE.ShaderMaterial({
    vertexShader: plinthVertexShader,
    fragmentShader: plinthFragmentShader,
    uniforms: {
      vBoxHeight: {
        value: plinthHeight,
      }
    },
  })
  const plinthNorth = new THREE.Mesh(geometry1, material)
  plinthNorth.position.set(0, plinthHeight / 2 + 0.001, -(floorLength / 2 - offset - plinthDepth / 2 - 0.001))
  plinthNorth.name = 'plinth-north'
  const plinthSouth = new THREE.Mesh(geometry1, material)
  plinthSouth.position.set(0, plinthHeight / 2 + 0.001, floorLength / 2 - offset - plinthDepth / 2 - 0.001)
  plinthSouth.rotation.set(0, Math.PI, 0)
  plinthSouth.name = 'plinth-south'
  const plinthWest = new THREE.Mesh(geometry2, material)
  plinthWest.position.set(floorWidth / 2 - offset - plinthDepth / 2 - 0.001, plinthHeight / 2 + 0.001, 0)
  plinthWest.rotation.set(0, -Math.PI / 2, 0)
  plinthWest.name = 'plinth-west'
  const plinthEast = new THREE.Mesh(geometry2, material)
  plinthEast.position.set(-(floorWidth / 2 - offset - plinthDepth / 2 - 0.001), plinthHeight / 2 + 0.001, 0)
  plinthEast.rotation.set(0, Math.PI / 2, 0)
  plinthEast.name = 'plinth-east'
  scene.add(plinthNorth, plinthSouth, plinthWest, plinthEast)
}

const createCeiling = (scene: THREE.Scene) => {
  const geometry = new THREE.PlaneGeometry(floorWidth, floorLength)
  const material = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: getRepeatableTexture(textureLoader.load('static/textures/ceiling/color.jpg'), 4, 4),
    normalMap: getRepeatableTexture(textureLoader.load('static/textures/ceiling/normal.jpg'), 4, 4),
    roughnessMap: getRepeatableTexture(textureLoader.load('static/textures/ceiling/rough.jpg'), 4, 4),
  })
  const mesh = new THREE.Mesh(geometry, material)
  mesh.rotation.set(Math.PI / 2, 0, 0)
  mesh.position.set(0, wallHeight - offset, 0)
  mesh.name = 'ceiling'
  scene.add(mesh)
}

const createPictureModel = (scene: THREE.Scene, boxesMap: BoxesMap, actionsMap: ActionsMap) => {
  gltfLoader.load('./static/gltf/picture.gltf/picture.gltf', (gltf) => {
    const model = gltf.scene
    model.position.set(-2, 2, -4.85)
    model.scale.set(2.5, 2.5, 2.5)
    model.traverse((child) => {
      child.castShadow = true
    })
    scene.add(model)
    const id = THREE.MathUtils.generateUUID()
    // set actions
    const descriptionText = `${pictureText}`
    const cameraStopPosition = new THREE.Vector3(-1.4, 1.92, -3.7)
    const cameraStopQuaternion = new THREE.Quaternion(0.04, 0, 0)
    actionsMap.set(id, {
      leftClick: (params: ActionParams) => {
        descriptionModeAnimation(params, cameraStopPosition, cameraStopQuaternion, { text: descriptionText, position: 'right' })
      }
    })
    // set box
    const boundingBox = new THREE.Box3().setFromObject(model)
    const boundingBoxSize = new THREE.Vector3()
    boundingBox.getSize(boundingBoxSize)
    const box = new THREE.Mesh(
      new THREE.BoxGeometry(boundingBoxSize.x, boundingBoxSize.y, boundingBoxSize.z),
      new THREE.MeshBasicMaterial({ visible: false })
    )
    const boundingBoxCenter = new THREE.Vector3()
    boundingBox.getCenter(boundingBoxCenter)
    box.position.copy(boundingBoxCenter)
    box.traverse((child) => child.userData.id = id)
    scene.add(box)
    boxesMap.set(id, box)
  }, undefined, function (error) {
    console.error('error picture', error)
  })
}

const createDartBoardModel = (scene: THREE.Scene, boxesMap: BoxesMap, actionsMap: ActionsMap) => {
  gltfLoader.load('./static/gltf/dartboard/dartboard.gltf', (gltf) => {
    const model = gltf.scene
    model.scale.set(2, 2, 2)
    model.position.set(4.85, 2, -1)
    model.rotation.set(0, -Math.PI / 2, 0)
    model.traverse((child) => {
      child.castShadow = true
    })
    scene.add(model)
    const id = THREE.MathUtils.generateUUID()
    // set actions
    const descriptionText = `${dartBoard}`
    const cameraStopPosition = new THREE.Vector3(4.13, 2.06, -1.57)
    const cameraStopQuaternion = new THREE.Quaternion(-0.02, -0.78, -0.03, 0.62)
    actionsMap.set(id, {
      leftClick: (params: ActionParams) => {
        descriptionModeAnimation(params, cameraStopPosition, cameraStopQuaternion, { text: descriptionText, position: 'left' })
      },
    })
    // set box
    const boundingBox = new THREE.Box3().setFromObject(model)
    const boundingBoxSize = new THREE.Vector3()
    boundingBox.getSize(boundingBoxSize)
    const box = new THREE.Mesh(
      new THREE.BoxGeometry(boundingBoxSize.x, boundingBoxSize.y, boundingBoxSize.z),
      new THREE.MeshBasicMaterial({ visible: false })
    )
    const boundingBoxCenter = new THREE.Vector3()
    boundingBox.getCenter(boundingBoxCenter)
    box.position.copy(boundingBoxCenter)
    box.traverse((child) => child.userData.id = id)
    scene.add(box)
    boxesMap.set(id, box)
  }, undefined, function (error) {
    console.error('error model', error)
  })
}

const createPedestalModel = (scene: THREE.Scene, boxesMap: BoxesMap) => {
  gltfLoader.load('./static/gltf/drawer.gltf/vintage_wooden_drawer_01_4k.gltf', (gltf) => {
    const model = gltf.scene
    model.scale.set(1.5, 1.5, 1.5)
    model.rotation.set(0, -Math.PI / 2, 0)
    model.position.set(3.8, 0, -1)
    model.traverse((child) => {
      child.castShadow = true
    })
    scene.add(model)
    const id = THREE.MathUtils.generateUUID()
    // set box
    const boundingBox = new THREE.Box3().setFromObject(model)
    const boundingBoxSize = new THREE.Vector3()
    boundingBox.getSize(boundingBoxSize)
    const box = new THREE.Mesh(
      new THREE.BoxGeometry(boundingBoxSize.x, boundingBoxSize.y, boundingBoxSize.z),
      new THREE.MeshBasicMaterial({ visible: false })
    )
    const boundingBoxCenter = new THREE.Vector3()
    boundingBox.getCenter(boundingBoxCenter)
    box.position.copy(boundingBoxCenter)
    box.traverse((child) => child.userData.id = id)
    scene.add(box)
    boxesMap.set(id, box)
  }, undefined, function (error) {
    console.error('error model', error)
  })
}

const createCameraModel = (scene: THREE.Scene, boxesMap: BoxesMap, actionsMap: ActionsMap) => {
  gltfLoader.load('./static/gltf/camera.gltf/Camera_01_1k.gltf', (gltf) => {
    const model = gltf.scene
    model.scale.set(1.3, 1.3, 1.3)
    model.position.set(3.83, 0.81, -0.75)
    model.rotation.set(0, -Math.PI / 2, 0)
    model.traverse((child) => {
      child.castShadow = true
    })
    scene.add(model)
    const id = THREE.MathUtils.generateUUID()
    // set actions
    const descriptionText = `${cameraText}`
    const cameraStopPosition = new THREE.Vector3(3.54, 0.95, -0.83)
    const cameraStopQuaternion = new THREE.Quaternion(-0.13, -0.63, -0.11, 0.75)
    actionsMap.set(id, {
      leftClick: (params: ActionParams) => {
        descriptionModeAnimation(params, cameraStopPosition, cameraStopQuaternion, { text: descriptionText, position: 'left' })
      },
    })
    // set box
    const boundingBox = new THREE.Box3().setFromObject(model)
    const boundingBoxSize = new THREE.Vector3()
    boundingBox.getSize(boundingBoxSize)
    const box = new THREE.Mesh(
      new THREE.BoxGeometry(boundingBoxSize.x, boundingBoxSize.y, boundingBoxSize.z),
      new THREE.MeshBasicMaterial({ visible: false })
    )
    const boundingBoxCenter = new THREE.Vector3()
    boundingBox.getCenter(boundingBoxCenter)
    box.position.copy(boundingBoxCenter)
    box.traverse((child) => child.userData.id = id)
    scene.add(box)
    boxesMap.set(id, box)
  }, undefined, function (error) {
    console.error('error model', error)
  })
}

const createClockModel = (scene: THREE.Scene, boxesMap: BoxesMap, actionsMap: ActionsMap) => {
  gltfLoader.load('./static/gltf/clock/mantel_clock_01_2k.gltf', (gltf) => {
    const model = gltf.scene
    model.position.set(3.75, 0.81, -1.3)
    model.rotation.set(0, -Math.PI / 2, 0)
    model.traverse((child) => {
      child.castShadow = true
    })
    scene.add(model)
    const id = THREE.MathUtils.generateUUID()
    // set actions
    const descriptionText = `${clockText}`
    const cameraStopPosition = new THREE.Vector3(3.46, 0.97, -1.42)
    const cameraStopQuaternion = new THREE.Quaternion(-0.11, -0.69, -0.1, 0.7)
    actionsMap.set(id, {
      leftClick: (params: ActionParams) => {
        descriptionModeAnimation(params, cameraStopPosition, cameraStopQuaternion, { text: descriptionText, position: 'left' })
      },
    })
    // set box
    const boundingBox = new THREE.Box3().setFromObject(model)
    const boundingBoxSize = new THREE.Vector3()
    boundingBox.getSize(boundingBoxSize)
    const box = new THREE.Mesh(
      new THREE.BoxGeometry(boundingBoxSize.x, boundingBoxSize.y, boundingBoxSize.z),
      new THREE.MeshBasicMaterial({ visible: false })
    )
    const boundingBoxCenter = new THREE.Vector3()
    boundingBox.getCenter(boundingBoxCenter)
    box.position.copy(boundingBoxCenter)
    box.traverse((child) => child.userData.id = id)
    scene.add(box)
    boxesMap.set(id, box)
  }, undefined, function (error) {
    console.error('error model', error)
  })
}

const createSofaModel = (scene: THREE.Scene, boxesMap: BoxesMap) => {
  gltfLoader.load('./static/gltf/sofa_02_1k.gltf/sofa_02_1k.gltf', (gltf) => {
    const model = gltf.scene
    model.scale.set(1.7, 1.7, 1.7)
    model.rotation.set(0, Math.PI / 2, 0)
    model.position.set(-3.95, 0, -1.7)
    model.traverse((child) => {
      child.castShadow = true
    })
    scene.add(model)
    const id = THREE.MathUtils.generateUUID()
    // set box
    const boundingBox = new THREE.Box3().setFromObject(model)
    const boundingBoxSize = new THREE.Vector3()
    boundingBox.getSize(boundingBoxSize)
    const box = new THREE.Mesh(
      new THREE.BoxGeometry(boundingBoxSize.x, boundingBoxSize.y, boundingBoxSize.z),
      new THREE.MeshBasicMaterial({ visible: false })
    )
    const boundingBoxCenter = new THREE.Vector3()
    boundingBox.getCenter(boundingBoxCenter)
    box.position.copy(boundingBoxCenter)
    box.traverse((child) => child.userData.id = id)
    scene.add(box)
    boxesMap.set(id, box)
  }, undefined, function (error) {
    console.error('error model', error)
  })
}

const createOttomanModel = (scene: THREE.Scene, boxesMap: BoxesMap) => {
  gltfLoader.load('./static/gltf/ottoman/otoman.gltf', (gltf) => {
    const model = gltf.scene
    model.scale.set(1.1, 1.1, 1.1)
    model.position.set(-3.7, 0, -3.8)
    model.traverse((child) => {
      child.castShadow = true
    })
    scene.add(model)
    const id = THREE.MathUtils.generateUUID()
    // set box
    const boundingBox = new THREE.Box3().setFromObject(model)
    const boundingBoxSize = new THREE.Vector3()
    boundingBox.getSize(boundingBoxSize)
    const box = new THREE.Mesh(
      new THREE.BoxGeometry(boundingBoxSize.x, boundingBoxSize.y, boundingBoxSize.z),
      new THREE.MeshBasicMaterial({ visible: false })
    )
    const boundingBoxCenter = new THREE.Vector3()
    boundingBox.getCenter(boundingBoxCenter)
    box.position.copy(boundingBoxCenter)
    box.traverse((child) => child.userData.id = id)
    scene.add(box)
    boxesMap.set(id, box)
  }, undefined, function (error) {
    console.error('error model', error)
  })
}

const createNavigationMarker = (scene: THREE.Scene) => {
  const group = new THREE.Group()
  const baseGeometry = new THREE.CircleGeometry(0.3, 30)
  const baseMaterial = new THREE.MeshBasicMaterial({
    color: '#ffffff',
    transparent: true,
    opacity: 0.15,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })
  const base = new THREE.Mesh(baseGeometry, baseMaterial)
  const secondaryGeometry = new THREE.CircleGeometry(0.2, 30)
  const secondaryMaterial = new THREE.MeshBasicMaterial({
    color: '#ffffff',
    transparent: true,
    opacity: 0.05,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })
  const secondary = new THREE.Mesh(secondaryGeometry, secondaryMaterial)
  secondary.position.z += 0.01
  group.add(base, secondary)
  group.rotation.copy(new THREE.Euler(Math.PI / -2, 0, 0))
  group.name = 'circle'
  group.visible = false
  scene.add(group)
  return group
}

const initActions = (
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera,
  boxesMap: BoxesMap,
  actionsMap: ActionsMap,
  orbitControls?: OrbitControls,
) => {
  let isActiveHover = true
  let isActiveRightClick = true
  let isActiveLeftClick = true
  const enableEventHandlers = (value: boolean) => {
    isActiveHover = value
    isActiveRightClick = value
    isActiveLeftClick = value
  }
  const floorMarker = createNavigationMarker(scene)
  const markers = [floorMarker]

  let prevActiveId: string | null = null
  const hover = (event?: MouseEvent) => {
    if (!isActiveHover) {
      return
    }
    event?.preventDefault()
    if (prevActiveId !== null) {
      actionsMap.get(prevActiveId)?.hover?.({ enable: false, markers })
      prevActiveId = null
    }
    raycaster.setFromCamera(mouse, camera)
    const intersected = raycaster.intersectObjects([...boxesMap.values()])
    if (intersected.length) {
      const { point, object } = intersected[0]
      const actions = actionsMap.get(object.userData.id)
      actions?.hover?.({ enable: true, point, markers })
      prevActiveId = object.userData.id
    }
  }
  if (!isMobile) {
    window.addEventListener('mousemove', _.throttle(hover, 40))
  }

  const rightClick = (event?: MouseEvent) => {
    if (!isActiveRightClick) {
      return
    }
    event?.preventDefault()
    raycaster.setFromCamera(mouse, camera)
    const intersected = raycaster.intersectObjects([...boxesMap.values()])
    if (intersected.length) {
      const { point, object } = intersected[0]
      const actions = actionsMap.get(object.userData.id)
      actions?.rightClick?.({
        camera, point, orbitControls, markers, enableEventHandlers
      })
    }
  }
  window.addEventListener('contextmenu', rightClick)

  const leftClick = (event?: MouseEvent) => {
    if (!isActiveLeftClick) {
      return
    }
    event?.preventDefault()
    raycaster.setFromCamera(mouse, camera)
    const intersected = raycaster.intersectObjects([...boxesMap.values()])
    if (intersected.length) {
      const { point, object } = intersected[0]
      const actions = actionsMap.get(object.userData.id)
      actions?.leftClick?.({
        camera, point, orbitControls, markers, enableEventHandlers
      })
    }
  }
  window.addEventListener('click', leftClick)

  return [hover, leftClick, rightClick]
}

const createLight = (scene: THREE.Scene) => {
  gltfLoader.load('./static/gltf/lamp/lamp.glb', (gltf) => {
    const model = gltf.scene
    model.scale.set(1.5, 0.7, 1.5)
    model.position.set(0, 2.51, 0)
    model.castShadow = true
    scene.add(model)

    const pointLight = new THREE.PointLight(0xffffff, 0.3)
    pointLight.castShadow = true
    pointLight.position.set(0, 2.5, 0)
    scene.add(pointLight)

    const ambientLight = new THREE.AmbientLight(0xffffff, 2)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 2.5)
    directionalLight.position.set(1, 2.5, 1)
    directionalLight.shadow.camera.near = 0.1
    directionalLight.shadow.camera.far = 20
    directionalLight.shadow.camera.right = 5
    directionalLight.shadow.camera.left = -5
    directionalLight.shadow.camera.top = 5
    directionalLight.shadow.camera.bottom = -5
    directionalLight.shadow.mapSize.width = 1024
    directionalLight.shadow.mapSize.height = 1024
    directionalLight.shadow.radius = 2
    directionalLight.shadow.bias = -0.00005
    scene.add(directionalLight)
  }, undefined, function (error) {
    console.error('error model', error)
  })
}

initScene(props)(({ scene, camera, renderer, orbitControls }) => {
  camera.position.copy(positions.start)
  camera.quaternion.copy(quaternions.start)
  orbitControls!.rotateSpeed = -0.5
  orbitControls!.enableZoom = false
  orbitControls!.enablePan = false

  const updateControl = useControl(camera, orbitControls)

  const boxesMap: BoxesMap = new Map()
  const actionsMap: ActionsMap = new Map()

  createPictureModel(scene, boxesMap, actionsMap)
  createDartBoardModel(scene, boxesMap, actionsMap)
  createPedestalModel(scene, boxesMap)
  createCameraModel(scene, boxesMap, actionsMap)
  createClockModel(scene, boxesMap, actionsMap)
  createCarpet(scene, boxesMap, actionsMap)
  createWoodFloor(scene)
  createWalls(scene)
  createPlinths(scene)
  createCeiling(scene)
  createSofaModel(scene, boxesMap)
  createOttomanModel(scene, boxesMap)

  createLight(scene)

  const [hover] = initActions(scene, camera, boxesMap, actionsMap, orbitControls)

  let frameCounter = 0
  function animate() {
    requestAnimationFrame(animate)
    renderer.render(scene, camera)

    // because hover should be not only mousemove handler
    if (frameCounter > 20) {
      if (!isMobile) {
        hover()
      }
      frameCounter = 0
    }
    frameCounter++

    updateControl()
    stats.update()
  }
  animate()
})
