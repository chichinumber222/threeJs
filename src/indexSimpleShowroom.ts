import * as THREE from "three"
import { initScene, Props as InitSceneProps } from './bootstrap/bootstrap'
import { stats } from "./utils/stats"
import { onChangeCursor } from "./utils/update-coord"
import gsap from 'gsap'
import { OrbitControls } from "./controller/orbit"
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import _ from 'lodash'

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
type ObjectsMap = Map<string, THREE.Object3D>

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

const textureLoader = new THREE.TextureLoader()
const gltfLoader = new GLTFLoader()
const raycaster = new THREE.Raycaster()
const mouse = onChangeCursor()
const measure = 10
const offset = 0.1
const floorOffset = 0.9
const positions: Positions = {
  start: new THREE.Vector3(1, 1, 1),
  last: new THREE.Vector3(1, 1, 1),
}
const quaternions: Quaternions = {
  start: new THREE.Quaternion(0, 0, 0),
  last: new THREE.Quaternion(0, 0, 0),
}

const markObject = (currentObject: THREE.Object3D) => {
  const uniqId = THREE.MathUtils.generateUUID()
  currentObject.traverse((child) => child.userData.id = uniqId)
  return uniqId
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

const getRepeatableTexture = (texture: THREE.Texture, repeatCount?: number) => {
  const count = repeatCount ?? 5
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(count, count)
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
    ease: "power2.inOut",
    onUpdate: function () {
      const t = this.targets()[0].t
      camera.quaternion.slerpQuaternions(startQuaternion, endQuaternion, t)
    }
  }, "start")
  timeline.to(camera.position, {
    duration: 1.5,
    ease: "power2.inOut",
    x: stopPosition.x,
    z: stopPosition.z,
    y: stopPosition.y,
  }, "start")
}

const createWoodFloor = (scene: THREE.Scene) => {
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10),
    new THREE.MeshStandardMaterial({
      color: 0xcccccc,
      map: getRepeatableTexture(textureLoader.load('static/textures/wood-floor/color.jpg'), 10),
      normalMap: getRepeatableTexture(textureLoader.load('static/textures/wood-floor/normal.jpg'), 10),
      roughnessMap: getRepeatableTexture(textureLoader.load('static/textures/wood-floor/rough.jpg'), 10),
    })
  )
  mesh.rotation.x = - Math.PI * 0.5
  mesh.geometry.setAttribute('uv2', new THREE.Float32BufferAttribute(mesh.geometry.attributes.uv.array, 2))
  mesh.name = 'wood-floor'
  scene.add(mesh)
}

const createCarpet = (scene: THREE.Scene, objectsMap: ObjectsMap, actionsMap: ActionsMap) => {
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(measure - 2 * floorOffset, measure - 2 * floorOffset),
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
  const id = markObject(mesh)
  actionsMap.set(id, {
    rightClick: rightClickAction,
    hover: hoverAction,
  })
  objectsMap.set(id, mesh)
}

const createWalls = (scene: THREE.Scene) => {
  const geometry = new THREE.PlaneGeometry(measure, measure / 3, 100, 100)
  const material = new THREE.MeshStandardMaterial({
    color: '#FCFBF4',
    map: getRepeatableTexture(textureLoader.load('static/textures/wall/color.jpg'), 3),
    normalMap: getRepeatableTexture(textureLoader.load('static/textures/wall/normal.jpg'), 3),
    roughnessMap: getRepeatableTexture(textureLoader.load('static/textures/wall/rough.jpg'), 3),
    displacementMap: getRepeatableTexture(textureLoader.load('static/textures/wall/disp.jpg'), 3),
    displacementScale: 0.04,
  })
  const wallNorth = new THREE.Mesh(geometry, material)
  wallNorth.position.set(0, (measure / 6) - offset, -((measure / 2) - offset))
  wallNorth.name = 'wall-north'
  const wallSouth = new THREE.Mesh(geometry, material)
  wallSouth.position.set(0, (measure / 6) - offset, (measure / 2) - offset)
  wallSouth.rotation.set(0, Math.PI, 0)
  wallSouth.name = 'wall-south'
  const wallWest = new THREE.Mesh(geometry, material)
  wallWest.position.set((measure / 2) - offset, (measure / 6) - offset, 0)
  wallWest.rotation.set(0, -Math.PI / 2, 0)
  wallWest.name = 'wall-west'
  const wallEast = new THREE.Mesh(geometry, material)
  wallEast.position.set(-((measure / 2) - offset), (measure / 6) - offset, 0)
  wallEast.rotation.set(0, Math.PI / 2, 0)
  wallEast.name = 'wall-east'
  scene.add(wallNorth, wallSouth, wallWest, wallEast)
}

const createCeiling = (scene: THREE.Scene) => {
  const geometry = new THREE.PlaneGeometry(measure, measure)
  const material = new THREE.MeshStandardMaterial({
    color: '#FCFBF4',
    map: getRepeatableTexture(textureLoader.load('static/textures/ceiling/color.jpg'), 4),
    normalMap: getRepeatableTexture(textureLoader.load('static/textures/ceiling/normal.jpg'), 4),
    roughnessMap: getRepeatableTexture(textureLoader.load('static/textures/ceiling/rough.jpg'), 4),
  })
  const mesh = new THREE.Mesh(geometry, material)
  mesh.rotation.set(Math.PI / 2, 0, 0)
  mesh.position.set(0, (measure / 3) - offset, 0)
  mesh.name = 'ceiling'
  scene.add(mesh)
}

const createPictureModel = (scene: THREE.Scene, objectsMap: ObjectsMap, actionsMap: ActionsMap) => {
  gltfLoader.load('./static/gltf/picture.gltf/fancy_picture_frame_01_2k.gltf', (gltf) => {
    const model = gltf.scene
    model.scale.set(2.5, 2.5, 2.5)
    model.position.set(-2, 2, -4.85)
    model.castShadow = true
    scene.add(model)
    const descriptionText = 'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Deleniti eius similique consequuntur numquam. Voluptatem ut tenetur explicabo. Impedit et, quia eveniet illum molestiae similique. Placeat ullam explicabo rem harum cumque? Lorem ipsum, dolor sit amet consectetur adipisicing elit. Deleniti eius similique consequuntur numquam. Voluptatem ut tenetur explicabo. Impedit et, quia eveniet illum molestiae similique. Placeat ullam explicabo rem harum cumque? Lorem ipsum, dolor sit amet consectetur adipisicing elit. Deleniti eius similique consequuntur numquam. Voluptatem ut tenetur explicabo. Impedit et, quia eveniet illum molestiae similique. Placeat ullam explicabo rem harum cumque? Lorem ipsum, dolor sit amet consectetur adipisicing elit. Deleniti eius similique consequuntur numquam. Voluptatem ut tenetur explicabo. Impedit et, quia eveniet illum molestiae similique. Placeat ullam explicabo rem harum cumque? Lorem ipsum, dolor sit amet consectetur adipisicing elit. Deleniti eius similique consequuntur numquam. Voluptatem ut tenetur explicabo. Impedit et, quia eveniet illum molestiae similique. Placeat ullam explicabo rem harum cumque? Lorem ipsum, dolor sit amet consectetur adipisicing elit. Deleniti eius similique consequuntur numquam. Voluptatem ut tenetur explicabo. Impedit et, quia eveniet illum molestiae similique. Placeat ullam explicabo rem harum cumque? Lorem ipsum, dolor sit amet consectetur adipisicing elit. Deleniti eius similique consequuntur numquam. Voluptatem ut tenetur explicabo. Impedit et, quia eveniet illum molestiae similique. Placeat ullam explicabo rem harum cumque? Lorem ipsum, dolor sit amet consectetur adipisicing elit. Deleniti eius similique consequuntur numquam. Voluptatem ut tenetur explicabo. Impedit et, quia eveniet illum molestiae similique. Placeat ullam explicabo rem harum cumque? Lorem ipsum, dolor sit amet consectetur adipisicing elit. <br><br> Deleniti eius similique consequuntur numquam. Voluptatem ut tenetur explicabo. Impedit et, quia eveniet illum molestiae similique. <br><br> Placeat ullam explicabo rem harum cumque?'
    const cameraStopPosition = new THREE.Vector3(-1.4, 1.92, -3.7)
    const cameraStopQuaternion = new THREE.Quaternion(0.04, 0, 0)
    const id = markObject(model)
    actionsMap.set(id, {
      leftClick: (params: ActionParams) => {
        descriptionModeAnimation(params, cameraStopPosition, cameraStopQuaternion, { text: descriptionText, position: 'right', width: '10%' })
      }
    })
    objectsMap.set(id, model)
  }, undefined, function (error) {
    console.error('error picture', error)
  })
}

const createDartBoardModel = (scene: THREE.Scene, objectsMap: ObjectsMap, actionsMap: ActionsMap) => {
  gltfLoader.load('./static/gltf/dartboard.gltf/dartboard_1k.gltf', (gltf) => {
    const model = gltf.scene
    model.scale.set(2, 2, 2)
    model.position.set(4.85, 2, -1)
    model.rotation.set(0, -Math.PI / 2, 0)
    model.castShadow = true
    scene.add(model)
    const descriptionText = 'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Deleniti eius similique consequuntur numquam. Voluptatem ut tenetur explicabo. Impedit et, quia eveniet illum molestiae similique. Placeat ullam explicabo rem harum cumque? Lorem ipsum, dolor sit amet consectetur adipisicing elit.'
    const cameraStopPosition = new THREE.Vector3(4.21, 1.92, -0.3)
    const cameraStopQuaternion = new THREE.Quaternion(0.04, -0.59, 0.03, 0.8)
    const id = markObject(model)
    actionsMap.set(id, {
      leftClick: (params: ActionParams) => {
        descriptionModeAnimation(params, cameraStopPosition, cameraStopQuaternion, { text: descriptionText, position: 'left' })
      },
    })
    objectsMap.set(id, model)
  }, undefined, function (error) {
    console.error('error picture', error)
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
  objectsMap: ObjectsMap,
  actionsMap: ActionsMap,
  orbitControls?: OrbitControls,
) => {
  const floorMarker = createNavigationMarker(scene)
  const markers = [floorMarker]
  let isActiveHover = true
  let isActiveRightClick = true
  let isActiveLeftClick = true
  const enableEventHandlers = (value: boolean) => {
    isActiveHover = value
    isActiveRightClick = value
    isActiveLeftClick = value
  }

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
    const intersected = raycaster.intersectObjects([...objectsMap.values()])
    if (intersected.length) {
      const { point, object } = intersected[0]
      const actions = actionsMap.get(object.userData.id)
      actions?.hover?.({ enable: true, point, markers })
      prevActiveId = object.userData.id
    }
  }
  window.addEventListener('mousemove', _.throttle(hover, 40))

  const rightClick = (event?: MouseEvent) => {
    if (!isActiveRightClick) {
      return
    }
    event?.preventDefault()
    raycaster.setFromCamera(mouse, camera)
    const intersected = raycaster.intersectObjects([...objectsMap.values()])
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
    const intersected = raycaster.intersectObjects([...objectsMap.values()])
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
  const ambientLight = new THREE.AmbientLight(0xffffff, 2)
  scene.add(ambientLight)

  const pointLight = new THREE.PointLight(0xffffff, 2.5)
  pointLight.castShadow = true
  pointLight.position.set(0, 2.5, 0)
  scene.add(pointLight)

  const directionalLight = new THREE.DirectionalLight(0xffffff, 2.3)
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
}

initScene(props)(({ scene, camera, renderer, orbitControls }) => {
  camera.position.copy(positions.start)
  camera.quaternion.copy(quaternions.start)
  orbitControls!.rotateSpeed = -0.5
  orbitControls!.enableZoom = false
  orbitControls!.enablePan = false

  const updateControl = useControl(camera, orbitControls)

  const objectsMap: ObjectsMap = new Map()
  const actionsMap: ActionsMap = new Map()

  createPictureModel(scene, objectsMap, actionsMap)
  createDartBoardModel(scene, objectsMap, actionsMap)
  createCarpet(scene, objectsMap, actionsMap)
  createWoodFloor(scene)
  createWalls(scene)
  createCeiling(scene)

  createLight(scene)

  const [hover] = initActions(scene, camera, objectsMap, actionsMap, orbitControls)

  let frameCounter = 0
  function animate() {
    requestAnimationFrame(animate)
    renderer.render(scene, camera)

    // because hover should be not only mousemove handler
    if (frameCounter > 20) {
      hover()
      frameCounter = 0
    }
    frameCounter++

    updateControl()
    stats.update()
  }
  animate()
})
