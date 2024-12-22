import * as THREE from "three"
import { initScene, Props as InitSceneProps } from './bootstrap/bootstrap'
import Stats from 'stats.js'
import { onChangeCursor } from "./utils/update-coord"
import gsap from 'gsap'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import _ from 'lodash'
import { mobileCheck } from "./utils/mobile-check"
import plinthVertexShader from './shaders/showroom/plinth/vertex.glsl'
import plinthFragmentShader from './shaders/showroom/plinth/fragment.glsl'
import ceilingPlinthVertexShader from './shaders/showroom/ceiling-plinth/vertex.glsl'
import ceilingPlinthFragmentShader from './shaders/showroom/ceiling-plinth/fragment.glsl'
import cashVertexShader from './shaders/showroom/cash/vertex.glsl'
import cashFragmentShader from './shaders/showroom/cash/fragment.glsl'
import dartBoard from './static/texts/dartBoard.txt'
import pictureText from './static/texts/pictureText.txt'
import cashText from './static/texts/cash.txt'
import bulbText from './static/texts/bulb.txt'

interface ActionParams {
  camera: THREE.PerspectiveCamera
  point: THREE.Vector3
  enableControl?: (value: boolean) => void
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

const lsModeKey = 'fly'
const isFlyMode = () => {
  return Boolean(localStorage.getItem(lsModeKey))
}
const changeMode = () => {
  localStorage.setItem(lsModeKey, !isFlyMode() ? '1' : '')
}
document.getElementById('change_mode')?.addEventListener('click', changeMode)

const props: InitSceneProps = {
  disableDefaultLights: true,
  canvasElement: <HTMLCanvasElement>document.getElementById('webgl'),
  disableDefaultControls: isFlyMode() ? false : true,
}

const isMobile = mobileCheck()
const loadingManager = new THREE.LoadingManager()
const textureLoader = new THREE.TextureLoader(loadingManager)
const gltfLoader = new GLTFLoader(loadingManager)
const raycaster = new THREE.Raycaster()
const mouse = onChangeCursor()
const floorWidth = 3
const floorLength = 12
const wallHeight = 4
const plinthHeight = 0.1
const plinthDepth = 0.03
const ceilingPlinthHeight = 0.25
const ceilingPlinthDepth = 0.03
const offset = 0.1
const floorOffset = 0.5
const positions: Positions = {
  start: new THREE.Vector3(-0.038, 1.8, 3.5),
  last: new THREE.Vector3(-0.038, 1.8, 3.5),
}
const quaternions: Quaternions = {
  start: new THREE.Quaternion(-0.1, -0.006, 0, 0.99),
  last: new THREE.Quaternion(-0.1, -0.006, 0, 0.99),
}

const initStats = () => {
  const stats = new Stats()
  stats.dom.style.position = 'absolute'
  stats.dom.style.top = '0px'
  stats.dom.style.left = '0px'
  document.body.appendChild(stats.dom)
  return stats
}

const initStart = () => {
  return new Promise((resolve) => {
    const startMenu = <HTMLElement>document.getElementsByClassName('start_menu')[0]
    const run = <HTMLButtonElement>document.getElementsByClassName('run')[0]
    const persentage = <HTMLElement>document.querySelector('.run .persentage')
    loadingManager.onProgress = function (_, itemsLoaded, itemsTotal) {
      persentage.innerHTML = `${Math.round((itemsLoaded / itemsTotal) * 100)}`
    }
    loadingManager.onLoad = function () {
      run.innerHTML = `Enter the room`
      run.disabled = false
    }
    run.addEventListener('click', (event) => {
      event.stopPropagation()
      resolve(true)
      startMenu.classList.add('no_visible')
    })
  })
}

const useControl = (camera: THREE.PerspectiveCamera, container: HTMLElement) => {
  camera.rotation.order = 'YXZ'
  let isEnable = true

  let isActive = false
  const prevPosition = { x: 0, y: 0 }
  let deltaX = 0
  let deltaY = 0
  const dampingFactorDefault = 0.95
  let dampingFactorCurrent = dampingFactorDefault
  const maxAngleX = Math.PI / 3
  const minAngleX = -Math.PI / 3
  let frameCount = 0

  if (!isMobile) {
    container.addEventListener('mousedown', (event) => {
      if (isEnable && event.button == 0) {
        isActive = true
        prevPosition.x = event.clientX
        prevPosition.y = event.clientY
      }
    })
    container.addEventListener('mouseup', () => {
      if (isEnable) {
        isActive = false
      }
    })
    container.addEventListener('mouseleave', () => {
      if (isEnable) {
        isActive = false
      }
    })
    container.addEventListener('mousemove', (event) => {
      if (isEnable && isActive) {
        deltaX = event.clientX - prevPosition.x
        deltaY = event.clientY - prevPosition.y
        dampingFactorCurrent = dampingFactorDefault
        prevPosition.x = event.clientX
        prevPosition.y = event.clientY
      }
    })
  } else {
    container.addEventListener('touchstart', (event) => {
      if (isEnable) {
        prevPosition.x = event.touches[0].clientX
        prevPosition.y = event.touches[0].clientY
      }
    })
    container.addEventListener('touchmove', (event) => {
      if (isEnable) {
        deltaX = event.touches[0].clientX - prevPosition.x
        deltaY = event.touches[0].clientY - prevPosition.y
        dampingFactorCurrent = dampingFactorDefault
        prevPosition.x = event.touches[0].clientX
        prevPosition.y = event.touches[0].clientY
      }
    })
  }

  const update = () => {
    if (frameCount > 1) {
      dampingFactorCurrent *= dampingFactorCurrent
      frameCount = 0
    }
    frameCount++
    const rotationDistanceY = deltaX * dampingFactorCurrent * 0.003
    const rotationDistanceX = deltaY * dampingFactorCurrent * 0.003
    if ((camera.rotation.x + rotationDistanceX) <= maxAngleX && (camera.rotation.x + rotationDistanceX) >= minAngleX) {
      camera.rotation.x += rotationDistanceX
    }
    camera.rotation.y += rotationDistanceY
    camera.rotation.z = 0
  }

  const enable = (value: boolean) => {
    isActive = false
    isEnable = value
  }

  return [update, enable] as const
}

const loadTexture = (url: string) => {
  const result = textureLoader.load(url)
  result.colorSpace = THREE.SRGBColorSpace
  return result
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
  const { enableEventHandlers, enableControl, camera } = actionParams
  positions.last?.copy(camera.position)
  quaternions.last?.copy(camera.quaternion)
  enableEventHandlers(false)
  enableControl?.(false)
  const timeline = gsap.timeline({
    onComplete: () => {
      let textElement: HTMLElement | null = null
      let exitButtonElement: HTMLElement | null = null
      if (!isMobile) {
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
      } else {
        textElement = <HTMLElement>document.getElementsByClassName('text_left')[0]
        exitButtonElement = <HTMLElement>document.getElementsByClassName('exit_left')[0]
        textElement.style.width = '90%'
      }
      textElement.innerHTML = `${descriptionOptions.text}`
      const exit = (event: MouseEvent) => {
        event.stopPropagation()
        camera.position.copy(positions.last || positions.start)
        camera.quaternion.copy(quaternions.last || quaternions.start)
        enableEventHandlers(true)
        enableControl?.(true)
        textElement.scrollTop = 0
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
  if (!isMobile) {
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
}

const createWoodFloor = (scene: THREE.Scene) => {
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(floorWidth, floorLength),
    new THREE.MeshStandardMaterial({
      color: 0xcccccc,
      map: getRepeatableTexture(loadTexture('static/textures/wood-floor/color.jpg'), 3, 10),
      normalMap: getRepeatableTexture(loadTexture('static/textures/wood-floor/normal.jpg'), 3, 10),
      roughnessMap: getRepeatableTexture(loadTexture('static/textures/wood-floor/rough.jpg'), 3, 10),
    })
  )
  mesh.rotation.x = - Math.PI * 0.5
  mesh.geometry.setAttribute('uv2', new THREE.Float32BufferAttribute(mesh.geometry.attributes.uv.array, 2))
  mesh.name = 'wood-floor'
  mesh.receiveShadow = true
  scene.add(mesh)
}

const createCarpet = (scene: THREE.Scene, boxesMap: BoxesMap, actionsMap: ActionsMap) => {
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(floorWidth - 2 * floorOffset, floorLength - 2 * floorOffset),
    new THREE.MeshStandardMaterial({
      color: 0xdddddd,
      map: getRepeatableTexture(loadTexture('static/textures/carpet/color.jpg'), 1, 4),
      normalMap: getRepeatableTexture(loadTexture('static/textures/carpet/normal.jpg'), 1, 4),
      aoMap: getRepeatableTexture(loadTexture('static/textures/carpet/ao.jpg'), 1, 4),
      aoMapIntensity: 0.3,
      roughnessMap: getRepeatableTexture(loadTexture('static/textures/carpet/rough.jpg'), 1, 4),
    })
  )
  mesh.rotation.x = -Math.PI * 0.5
  mesh.position.y += 0.02
  mesh.geometry.setAttribute('uv2', new THREE.Float32BufferAttribute(mesh.geometry.attributes.uv.array, 2))
  mesh.receiveShadow = true
  mesh.castShadow = false
  mesh.name = 'carpet'
  scene.add(mesh)
  const id = THREE.MathUtils.generateUUID()
  // set actions
  const rightClickAction = ({ point, enableEventHandlers, markers, camera }: ActionParams) => {
    const timeline = gsap.timeline({
      onStart: () => {
        enableEventHandlers(false)
      },
      onComplete: () => {
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
  const material1 = new THREE.MeshStandardMaterial({
    color: '#FCFBF4',
    map: getRepeatableTexture(loadTexture('static/textures/wallpaper/color.jpg'), 2, 2),
    normalMap: getRepeatableTexture(loadTexture('static/textures/wallpaper/normal.jpg'), 2, 2),
    roughness: 0.35,
  })
  const material2 = new THREE.MeshStandardMaterial({
    color: '#FCFBF4',
    map: getRepeatableTexture(loadTexture('static/textures/wallpaper/color.jpg'), 7, 2),
    normalMap: getRepeatableTexture(loadTexture('static/textures/wallpaper/normal.jpg'), 7, 2),
    roughness: 0.35,
  })
  const wallNorth = new THREE.Mesh(geometry1, material1)
  wallNorth.position.set(0, wallHeight / 2 - offset, -(floorLength / 2 - offset))
  wallNorth.name = 'wall-north'
  wallNorth.receiveShadow = true
  const wallSouth = new THREE.Mesh(geometry1, material1)
  wallSouth.position.set(0, wallHeight / 2 - offset, floorLength / 2 - offset)
  wallSouth.rotation.set(0, Math.PI, 0)
  wallSouth.name = 'wall-south'
  wallSouth.receiveShadow = true
  const wallWest = new THREE.Mesh(geometry2, material2)
  wallWest.position.set(floorWidth / 2 - offset, wallHeight / 2 - offset, 0)
  wallWest.rotation.set(0, -Math.PI / 2, 0)
  wallWest.name = 'wall-west'
  wallWest.receiveShadow = true
  const wallEast = new THREE.Mesh(geometry2, material2)
  wallEast.position.set(-(floorWidth / 2 - offset), wallHeight / 2 - offset, 0)
  wallEast.rotation.set(0, Math.PI / 2, 0)
  wallEast.name = 'wall-east'
  wallEast.receiveShadow = true
  scene.add(wallNorth, wallSouth, wallWest, wallEast)
}

const createPlinths = (scene: THREE.Scene) => {
  const geometry1 = new THREE.BoxGeometry(floorWidth, plinthHeight, plinthDepth, 50, 25)
  const geometry2 = new THREE.BoxGeometry(floorLength, plinthHeight, plinthDepth, 50, 25)
  const material = new THREE.ShaderMaterial({
    vertexShader: plinthVertexShader,
    fragmentShader: plinthFragmentShader,
    uniforms: {
      vBoxHeight: {
        value: plinthHeight,
      }
    },
  })
  const north = new THREE.Mesh(geometry1, material)
  north.position.set(0, plinthHeight / 2 + 0.001, -(floorLength / 2 - offset - plinthDepth / 2 - 0.001))
  north.name = 'plinth-north'
  const south = new THREE.Mesh(geometry1, material)
  south.position.set(0, plinthHeight / 2 + 0.001, floorLength / 2 - offset - plinthDepth / 2 - 0.001)
  south.rotation.set(0, Math.PI, 0)
  south.name = 'plinth-south'
  const west = new THREE.Mesh(geometry2, material)
  west.position.set(floorWidth / 2 - offset - plinthDepth / 2 - 0.001, plinthHeight / 2 + 0.001, 0)
  west.rotation.set(0, -Math.PI / 2, 0)
  west.name = 'plinth-west'
  const east = new THREE.Mesh(geometry2, material)
  east.position.set(-(floorWidth / 2 - offset - plinthDepth / 2 - 0.001), plinthHeight / 2 + 0.001, 0)
  east.rotation.set(0, Math.PI / 2, 0)
  east.name = 'plinth-east'
  scene.add(north, south, west, east)
}

const createCeilingPlinths = (scene: THREE.Scene) => {
  const geometry1 = new THREE.BoxGeometry(floorWidth, ceilingPlinthHeight, ceilingPlinthDepth, 50, 25)
  const geometry2 = new THREE.BoxGeometry(floorLength, ceilingPlinthHeight, ceilingPlinthDepth, 50, 25)
  const material = new THREE.ShaderMaterial({
    vertexShader: ceilingPlinthVertexShader,
    fragmentShader: ceilingPlinthFragmentShader,
    uniforms: {
      vBoxHeight: {
        value: ceilingPlinthHeight,
      }
    },
  })
  const north = new THREE.Mesh(geometry1, material)
  north.position.set(0, wallHeight - offset - (ceilingPlinthHeight / 2) - 0.001, -(floorLength / 2 - offset - ceilingPlinthDepth / 2 - 0.001))
  north.name = 'ceiling-plinth-north'
  const south = new THREE.Mesh(geometry1, material)
  south.position.set(0, wallHeight - offset - (ceilingPlinthHeight / 2) - 0.001, floorLength / 2 - offset - ceilingPlinthDepth / 2 - 0.001)
  south.rotation.set(0, Math.PI, 0)
  south.name = 'ceiling-plinth-south'
  const west = new THREE.Mesh(geometry2, material)
  west.position.set(floorWidth / 2 - offset - ceilingPlinthDepth / 2 - 0.001, wallHeight - offset - (ceilingPlinthHeight / 2) - 0.001, 0)
  west.rotation.set(0, -Math.PI / 2, 0)
  west.name = 'ceiling-plinth-west'
  const east = new THREE.Mesh(geometry2, material)
  east.position.set(-(floorWidth / 2 - offset - ceilingPlinthDepth / 2 - 0.001), wallHeight - offset - (ceilingPlinthHeight / 2) - 0.001, 0)
  east.rotation.set(0, Math.PI / 2, 0)
  east.name = 'ceiling-plinth-east'
  scene.add(north, south, west, east)
}

const createCeiling = (scene: THREE.Scene) => {
  const geometry = new THREE.PlaneGeometry(floorWidth, floorLength)
  const material = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: getRepeatableTexture(loadTexture('static/textures/ceiling/color.jpg'), 4, 4),
    normalMap: getRepeatableTexture(loadTexture('static/textures/ceiling/normal.jpg'), 4, 4),
    roughnessMap: getRepeatableTexture(loadTexture('static/textures/ceiling/rough.jpg'), 4, 4),
  })
  material.color.setScalar(2.0)
  const mesh = new THREE.Mesh(geometry, material)
  mesh.rotation.set(Math.PI / 2, 0, 0)
  mesh.position.set(0, wallHeight - offset, 0)
  mesh.name = 'ceiling'
  scene.add(mesh)
}

const createPictureModel = (scene: THREE.Scene, boxesMap: BoxesMap, actionsMap: ActionsMap) => {
  gltfLoader.load('./static/gltf/picture.gltf/picture.gltf', (gltf) => {
    const model = gltf.scene
    model.position.set(-1.38, 2, 1.5)
    model.scale.set(2.5, 2.5, 2.5)
    model.rotation.set(0, Math.PI / 2, 0)
    model.traverse((child) => {
      child.castShadow = true
    })
    scene.add(model)
    const id = THREE.MathUtils.generateUUID()
    // set actions
    const descriptionText = `${pictureText}`
    const cameraStopPosition = new THREE.Vector3(-0.33, 2, 2.11)
    const cameraStopQuaternion = new THREE.Quaternion(-0.006, 0.7, 0.006, 0.71)
    actionsMap.set(id, {
      leftClick: (params: ActionParams) => {
        descriptionModeAnimation(params, cameraStopPosition, cameraStopQuaternion, { text: descriptionText, position: 'left' })
      },
      hover: (params: HoverParams) => {
        if (params.enable) {
          document.body.style.cursor = 'pointer'
          return
        }
        document.body.style.cursor = 'default'
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
    model.position.set(0, 2, -5.88)
    model.traverse((child) => {
      child.castShadow = true
    })
    scene.add(model)
    const id = THREE.MathUtils.generateUUID()
    // set actions
    const descriptionText = `${dartBoard}`
    const cameraStopPosition = new THREE.Vector3(0.68, 2.04, -5.17)
    const cameraStopQuaternion = new THREE.Quaternion(-0.03, 0.07, 0.002, 0.997)
    actionsMap.set(id, {
      leftClick: (params: ActionParams) => {
        descriptionModeAnimation(params, cameraStopPosition, cameraStopQuaternion, { text: descriptionText, position: 'right' })
      },
      hover: (params: HoverParams) => {
        if (params.enable) {
          document.body.style.cursor = 'pointer'
          return
        }
        document.body.style.cursor = 'default'
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
    console.error('error model', error)
  })
}

const createPlantModel = (scene: THREE.Scene, boxesMap: BoxesMap) => {
  gltfLoader.load('./static/gltf/plant1/plant1.gltf', (gltf) => {
    const model = gltf.scene
    model.scale.set(2, 2, 2)
    model.position.set(0, 0.47, 5)
    model.rotation.set(0, Math.PI / 6, 0)
    model.traverse((child) => {
      child.castShadow = true
    })
    scene.add(model)
    const id = THREE.MathUtils.generateUUID()
    // set box
    const boundingBox = new THREE.Box3().setFromObject(model)
    const boundingBoxSize = new THREE.Vector3()
    boundingBox.getSize(boundingBoxSize)
    const cone = new THREE.Mesh(
      new THREE.ConeGeometry(Math.max(boundingBoxSize.x, boundingBoxSize.z) / 2, boundingBoxSize.y, 20, 20),
      new THREE.MeshBasicMaterial({ visible: false })
    )
    const boundingBoxCenter = new THREE.Vector3()
    boundingBox.getCenter(boundingBoxCenter)
    cone.position.copy(boundingBoxCenter)
    cone.traverse((child) => child.userData.id = id)
    scene.add(cone)
    boxesMap.set(id, cone)
  }, undefined, function (error) {
    console.error('error model', error)
  })
}

const createCash = (scene: THREE.Scene, boxesMap: BoxesMap, actionsMap: ActionsMap) => {
  const fluctuationsDepth = 0.01
  const fluctuationsFrequency = 50
  const geometry = new THREE.PlaneGeometry(0.18, 0.06, 15, 15)
  const material = new THREE.ShaderMaterial({
    side: THREE.DoubleSide,
    vertexShader: cashVertexShader,
    fragmentShader: cashFragmentShader,
    uniforms: {
      uTextureFront: { value: loadTexture('./static/textures/cash/front.jpg') },
      uTextureBack: { value: loadTexture('./static/textures/cash/back.jpg') },
      uDepth: { value: fluctuationsDepth },
      uFrequency: { value: fluctuationsFrequency },
    }
  },
  )
  const mesh = new THREE.Mesh(geometry, material)
  mesh.castShadow = true
  mesh.position.set(1.25, 1.76, -0.4)
  mesh.rotation.set(0, Math.PI / 2, 0)
  scene.add(mesh)
  const id = THREE.MathUtils.generateUUID()
  // set actions
  const descriptionText = `${cashText}`
  const cameraStopPosition = new THREE.Vector3(1.07, 1.8, -0.42)
  const cameraStopQuaternion = new THREE.Quaternion(-0.24, -0.65, -0.23, 0.69)
  actionsMap.set(id, {
    leftClick: (params: ActionParams) => {
      descriptionModeAnimation(params, cameraStopPosition, cameraStopQuaternion, { text: descriptionText, position: 'bottom', height: '35%' })
    },
    hover: (params: HoverParams) => {
      if (params.enable) {
        document.body.style.cursor = 'pointer'
        return
      }
      document.body.style.cursor = 'default'
    }
  })
  // set box
  const boundingBox = new THREE.Box3().setFromObject(mesh)
  const boundingBoxSize = new THREE.Vector3()
  boundingBox.getSize(boundingBoxSize)
  const box = new THREE.Mesh(
    new THREE.BoxGeometry(fluctuationsDepth * 2, boundingBoxSize.y, boundingBoxSize.z),
    new THREE.MeshBasicMaterial({ visible: false })
  )
  const boundingBoxCenter = new THREE.Vector3()
  boundingBox.getCenter(boundingBoxCenter)
  box.position.copy(boundingBoxCenter)
  box.traverse((child) => child.userData.id = id)
  scene.add(box)
  boxesMap.set(id, box)
}

const createBulbModel = (scene: THREE.Scene, boxesMap: BoxesMap, actionsMap: ActionsMap) => {
  gltfLoader.load('./static/gltf/bulb/bulb.gltf', (gltf) => {
    const model = gltf.scene
    model.scale.set(1.8, 1.8, 1.8)
    model.position.set(1.1, 0.03, -2)
    model.rotation.set(Math.PI / 2.6, 0, -Math.PI / 6)
    model.traverse(child => {
      child.castShadow = true
    })
    scene.add(model)
    const id = THREE.MathUtils.generateUUID()
    // set actions
    const descriptionText = `${bulbText}`
    const cameraStopPosition = new THREE.Vector3(1.022, 0.198, -2.01)
    const cameraStopQuaternion = new THREE.Quaternion(-0.33, -0.58, -0.27, 0.69)
    actionsMap.set(id, {
      leftClick: (params: ActionParams) => {
        descriptionModeAnimation(params, cameraStopPosition, cameraStopQuaternion, { text: descriptionText, position: 'left' })
      },
      hover: (params: HoverParams) => {
        if (params.enable) {
          document.body.style.cursor = 'pointer'
          return
        }
        document.body.style.cursor = 'default'
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
    console.error('error model', error)
  })
}

const createShelfModel = (scene: THREE.Scene) => {
  gltfLoader.load('./static/gltf/shelf/untitled.gltf', (gltf) => {
    const model = gltf.scene
    model.scale.set(0.15, 0.15, 0.1)
    model.position.set(1.28, 2, -0.5)
    model.rotation.set(0, -Math.PI / 2, 0)
    model.traverse((child) => {
      child.castShadow = true
      child.receiveShadow = true
    })
    scene.add(model)
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
  container: HTMLElement,
  boxesMap: BoxesMap,
  actionsMap: ActionsMap,
  enableControl?: (value: boolean) => void
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
    if (prevActiveId !== null) {
      actionsMap.get(prevActiveId)?.hover?.({ enable: false, markers })
      prevActiveId = null
    }
    if (!isActiveHover) {
      return
    }
    event?.preventDefault()
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
    container.addEventListener('mousemove', _.throttle(hover, 40))
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
        camera, point, enableControl, markers, enableEventHandlers
      })
    }
  }
  container.addEventListener('contextmenu', rightClick)

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
        camera, point, enableControl, markers, enableEventHandlers
      })
    }
  }
  container.addEventListener('click', leftClick)

  return [hover, leftClick, rightClick]
}

const createLight = (scene: THREE.Scene) => {
  gltfLoader.load('./static/gltf/lamp/lamp_colored6.gltf', (gltf) => {
    const lampModel = gltf.scene
    lampModel.scale.set(1, 0.8, 1)
    const lamp1 = lampModel.clone()
    lamp1.position.set(0, 3.08, 2)
    const lamp2 = lampModel.clone()
    lamp2.position.set(0, 3.08, -2)
    scene.add(lamp1, lamp2)

    const spotLight = new THREE.SpotLight(0xffffff, 4, 10, Math.PI / 3, 0.3, 0.3)
    spotLight.shadow.mapSize.width = 2048
    spotLight.shadow.mapSize.height = 2048
    spotLight.shadow.bias = -0.00005
    spotLight.shadow.radius = 2
    spotLight.castShadow = true
    const spotLight1 = spotLight.clone()
    spotLight1.position.set(0, 3.5, 2)
    spotLight1.target.position.set(0, 0, 2)
    const spotLight2 = spotLight.clone()
    spotLight2.position.set(0, 3.5, -2)
    spotLight2.target.position.set(0, 0, -2)
    scene.add(spotLight2, spotLight1, spotLight1.target, spotLight2.target)

    const pointLight = new THREE.PointLight(0xffffff, 1, 10, 1)
    pointLight.castShadow = false
    const pointLight1 = pointLight.clone()
    pointLight1.position.set(0, 3.17, 2)
    const pointLight2 = pointLight.clone()
    pointLight2.position.set(0, 3.17, -2)
    scene.add(pointLight1, pointLight2)

    const ambientLight = new THREE.AmbientLight(0xffffff, 2)
    scene.add(ambientLight)
  }, undefined, function (error) {
    console.error('error model', error)
  })
}

initScene(props)(async ({ scene, camera, renderer, orbitControls }) => {
  camera.position.copy(positions.start)
  camera.quaternion.copy(quaternions.start)
  renderer.toneMapping = THREE.ReinhardToneMapping

  const boxesMap: BoxesMap = new Map()
  const actionsMap: ActionsMap = new Map()

  createBulbModel(scene, boxesMap, actionsMap)
  createPictureModel(scene, boxesMap, actionsMap)
  createDartBoardModel(scene, boxesMap, actionsMap)
  createCarpet(scene, boxesMap, actionsMap)
  createWoodFloor(scene)
  createWalls(scene)
  createPlinths(scene)
  createCeilingPlinths(scene)
  createCeiling(scene)
  createPlantModel(scene, boxesMap)
  createShelfModel(scene)
  createCash(scene, boxesMap, actionsMap)

  createLight(scene)

  await initStart()

  const stats = initStats()

  if (isFlyMode()) {
    orbitControls!.minPolarAngle = -Math.PI
    orbitControls!.maxPolarAngle = Math.PI

    let frameCounter = 0
    function animate() {
      requestAnimationFrame(animate)
      renderer.render(scene, camera)

      if (frameCounter > 20) {
        console.log('position', camera.position)
        console.log('quaternion', camera.quaternion)
        frameCounter = 0
      }
      frameCounter++

      orbitControls?.update()
      stats.update()
    }
    animate()
  } else {
    const [updateControl, enableControl] = useControl(camera, renderer.domElement)

    const [hover] = initActions(scene, camera, renderer.domElement, boxesMap, actionsMap, enableControl)

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
  }
})
