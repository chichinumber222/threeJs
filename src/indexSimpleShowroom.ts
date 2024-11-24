import * as THREE from "three"
import { initScene } from "./bootstrap/bootstrap"
import { stats } from "./utils/stats"
import { onChangeCursor } from "./utils/update-coord"
import gsap from 'gsap'
import { OrbitControls } from "./controller/orbit"
import _ from 'lodash'

const textureLoader = new THREE.TextureLoader()
const raycaster = new THREE.Raycaster()
const mouse = onChangeCursor()
const measure = 10
const offset = 0.1
const floorOffset = 0.9

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

const createWoodFloor = (scene: THREE.Scene) => {
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10),
    new THREE.MeshStandardMaterial({
      color: 0xdddddd,
      map: getRepeatableTexture(textureLoader.load('static/textures/wood_floor/color.jpg')),
      normalMap: getRepeatableTexture(textureLoader.load('static/textures/wood_floor/normal.jpg')),
      aoMap: getRepeatableTexture(textureLoader.load('static/textures/wood_floor/ao.jpg')),
      aoMapIntensity: 3,
      roughnessMap: getRepeatableTexture(textureLoader.load('static/textures/wood_floor/rough.jpg')),
    })
  )
  mesh.rotation.x = - Math.PI * 0.5
  mesh.geometry.setAttribute('uv2', new THREE.Float32BufferAttribute(mesh.geometry.attributes.uv.array, 2))
  mesh.receiveShadow = true
  mesh.name = 'wood-floor'
  scene.add(mesh)
  return mesh
}

const createCarpet = (scene: THREE.Scene) => {
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
  mesh.position.y += 0.01
  mesh.geometry.setAttribute('uv2', new THREE.Float32BufferAttribute(mesh.geometry.attributes.uv.array, 2))
  mesh.receiveShadow = true
  mesh.name = 'carpet'
  scene.add(mesh)
  return mesh
}

const createWalls = (scene: THREE.Scene) => {
  const geometry = new THREE.PlaneGeometry(measure, measure / 2)
  const material = new THREE.MeshStandardMaterial({ color: '#CDCA74', roughness: 0.7 })
  const wallNorth = new THREE.Mesh(geometry, material)
  wallNorth.position.set(0, (measure / 4) - offset, -((measure / 2) - offset))
  wallNorth.name = 'wall-north'
  const wallSouth = new THREE.Mesh(geometry, material)
  wallSouth.position.set(0, (measure / 4) - offset, (measure / 2) - offset)
  wallSouth.rotation.set(0, Math.PI, 0)
  wallSouth.name = 'wall-south'
  const wallWest = new THREE.Mesh(geometry, material)
  wallWest.position.set((measure / 2) - offset, (measure / 4) - offset, 0)
  wallWest.rotation.set(0, -Math.PI / 2, 0)
  wallWest.name = 'wall-west'
  const wallEast = new THREE.Mesh(geometry, material)
  wallEast.position.set(-((measure / 2) - offset), (measure / 4) - offset, 0)
  wallEast.rotation.set(0, Math.PI / 2, 0)
  wallEast.name = 'wall-east'
  scene.add(wallNorth, wallSouth, wallWest, wallEast)
  return [wallNorth, wallSouth, wallWest, wallEast]
}

const createRoof = (scene: THREE.Scene) => {
  const geometry = new THREE.PlaneGeometry(measure, measure)
  const material = new THREE.MeshStandardMaterial({ color: '#F8DE7E', roughness: 0.7 })
  const mesh = new THREE.Mesh(geometry, material)
  mesh.rotation.set(Math.PI / 2, 0, 0)
  mesh.position.set(0, (measure / 2) - offset, 0)
  mesh.name = 'roof'
  scene.add(mesh)
  return mesh
}

const createTestCube = (scene: THREE.Scene) => {
  const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5)
  const material = new THREE.MeshBasicMaterial({ color: '#34b5ff' })
  const cube = new THREE.Mesh(geometry, material)
  cube.position.set(4, 0.5, 4)
  cube.name = 'cube'
  scene.add(cube)
  return cube
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

const initMoveCamera = (
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera,
  objectsToIntersect: THREE.Mesh[],
  orbitControls?: OrbitControls,
) => {
  const shot = (success: (point: THREE.Vector3) => void, fail?: () => void) => {
    raycaster.setFromCamera(mouse, camera)
    const intersected = raycaster.intersectObjects(objectsToIntersect)
    if (intersected.length && intersected[0].object === objectsToIntersect[0]) {
      const point = intersected[0].point
      const widthWithOffset = (measure / 2) - floorOffset
      if (
        point.x > -widthWithOffset && point.x < widthWithOffset &&
        point.z > -widthWithOffset && point.z < widthWithOffset
      ) {
        success(point)
        return
      }
    }
    fail?.()
  }

  const marker = createNavigationMarker(scene)

  const onMarkerVerification = () => {
    shot(
      (point: THREE.Vector3) => {
        marker.position.set(point.x, point.y + 0.02, point.z)
        marker.visible = true
      },
      () => marker.visible = false
    )
  }

  let isActiveMouseMove = true

  window.addEventListener('mousemove', _.throttle((event: MouseEvent) => {
    if (!isActiveMouseMove) {
      return
    }
    event.preventDefault()
    onMarkerVerification()
  }, 40))

  const onMotionAnimation = () => {
    shot((point: THREE.Vector3) => {
      const timeline = gsap.timeline({
        onStart: () => {
          if (orbitControls) orbitControls.enabled = false
          isActiveMouseMove = false
        },
        onComplete: () => {
          if (orbitControls) orbitControls!.enabled = true
          isActiveMouseMove = true
          onMarkerVerification()
        },
      })
      timeline.addLabel("start", 0)
      timeline.to((marker.children[1] as THREE.Mesh<THREE.CircleGeometry, THREE.MeshBasicMaterial>).material, {
        duration: 0.2,
        ease: "power2.inOut",
        opacity: 0.15,
        repeat: 1,
        yoyo: true,
      }, "start")
      timeline.to(camera.position, {
        duration: 0.7,
        ease: "power2.inOut",
        x: point.x,
        z: point.z,
      }, "start+=0.15")
    })
  }

  window.addEventListener('contextmenu', (event: MouseEvent) => {
    event.preventDefault()
    onMotionAnimation()
  })
}

initScene({})(({ scene, camera, renderer, orbitControls }) => {
  camera.position.set(1, 0.8, 1)
  orbitControls!.rotateSpeed = -0.5
  orbitControls!.enableZoom = false
  orbitControls!.enablePan = false

  const updateControl = useControl(camera, orbitControls)

  const bottomMeshes: THREE.Mesh[] = [
    createCarpet(scene),
    createWoodFloor(scene),
    createTestCube(scene)
  ]
  createWalls(scene)
  createRoof(scene)

  initMoveCamera(scene, camera, bottomMeshes, orbitControls)

  function animate() {
    requestAnimationFrame(animate)
    renderer.render(scene, camera)
    updateControl()
    stats.update()
  }
  animate()
})
