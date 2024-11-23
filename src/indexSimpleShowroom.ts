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

const createFloor = (scene: THREE.Scene) => {
  const colorTexture = textureLoader.load('static/textures/wood_floor/color.jpg')
  colorTexture.wrapS = THREE.RepeatWrapping
  colorTexture.wrapT = THREE.RepeatWrapping
  colorTexture.repeat.set(5, 5)
  const normalTexture = textureLoader.load('static/textures/wood_floor/normal.jpg')
  normalTexture.wrapS = THREE.RepeatWrapping
  normalTexture.wrapT = THREE.RepeatWrapping
  normalTexture.repeat.set(5, 5)
  const ambientOcclusionTexture = textureLoader.load('static/textures/wood_floor/ao.jpg')
  ambientOcclusionTexture.wrapS = THREE.RepeatWrapping
  ambientOcclusionTexture.wrapT = THREE.RepeatWrapping
  ambientOcclusionTexture.repeat.set(5, 5)
  const roughnessTexture = textureLoader.load('static/textures/wood_floor/rough.jpg')
  roughnessTexture.wrapS = THREE.RepeatWrapping
  roughnessTexture.wrapT = THREE.RepeatWrapping
  roughnessTexture.repeat.set(5, 5)
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10),
    new THREE.MeshStandardMaterial({
      color: 0xdddddd,
      map: colorTexture,
      normalMap: normalTexture,
      aoMap: ambientOcclusionTexture,
      aoMapIntensity: 3,
      roughnessMap: roughnessTexture,
    })
  )
  mesh.rotation.x = - Math.PI * 0.5
  mesh.geometry.setAttribute('uv2', new THREE.Float32BufferAttribute(mesh.geometry.attributes.uv.array, 2))
  mesh.receiveShadow = true
  mesh.name = 'floor'
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

const createCircleMarker = (scene: THREE.Scene) => {
  const geometry = new THREE.CircleGeometry(0.3, 20)
  const material = new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.2 })
  const mesh = new THREE.Mesh(geometry, material)
  mesh.rotation.copy(new THREE.Euler(Math.PI / -2, 0, 0))
  mesh.name = 'circle'
  mesh.visible = false
  scene.add(mesh)
  return mesh
}

const initMoveCamera = (
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera,
  objectsToIntersect: THREE.Mesh[],
  orbitControls?: OrbitControls,
) => {
  const move = (event: MouseEvent) => {
    event.preventDefault()
    raycaster.setFromCamera(mouse, camera)
    const intersected = raycaster.intersectObjects(objectsToIntersect)
    if (intersected.length && intersected[0].object === objectsToIntersect[0]) {
      const point = intersected[0].point
      const widthWithOffset = (measure / 2) - floorOffset
      if (
        point.x > -widthWithOffset && point.x < widthWithOffset &&
        point.z > -widthWithOffset && point.z < widthWithOffset
      ) {
        gsap.to(camera.position, {
          duration: 0.4,
          ease: "power2.inOut",
          x: point.x,
          z: point.z,
          onStart: () => {
            if (orbitControls) orbitControls.enabled = false
          },
          onComplete: () => {
            if (orbitControls) orbitControls!.enabled = true
          }
        })
      }
    }
  }
  const marker = createCircleMarker(scene)
  const showMarker = _.throttle((event: MouseEvent) => {
    event.preventDefault()
    raycaster.setFromCamera(mouse, camera)
    const intersected = raycaster.intersectObjects(objectsToIntersect)
    if (intersected.length && intersected[0].object === objectsToIntersect[0]) {
      const point = intersected[0].point
      const widthWithOffset = (measure / 2) - floorOffset
      if (
        point.x > -widthWithOffset && point.x < widthWithOffset &&
        point.z > -widthWithOffset && point.z < widthWithOffset
      ) {
        marker.position.set(point.x, point.y + 0.01, point.z)
        marker.visible = true
        return
      }
    }
    marker.visible = false
  }, 25)
  window.addEventListener('contextmenu', move)
  window.addEventListener('mousemove', showMarker)
}

initScene({})(({ scene, camera, renderer, orbitControls }) => {
  camera.position.set(1, 0.8, 1)
  orbitControls!.rotateSpeed = -0.5
  orbitControls!.enableZoom = false
  orbitControls!.enablePan = false

  const updateControl = useControl(camera, orbitControls)

  const bottomMeshes: THREE.Mesh[] = [
    createFloor(scene),
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
