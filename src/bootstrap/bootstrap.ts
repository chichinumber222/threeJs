import * as THREE from 'three'
import { initLighting } from './lighting'
import { onResize } from '../utils/update-on-resize'
import { initOrbitControls } from '../controller/orbit'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

export interface Props {
    backgroundColor?: THREE.Color
    fogColor?: THREE.ColorRepresentation
    disableShadows?: boolean
    disableDefaultLights?: boolean
    disableShadowsOnDefaultLights?: boolean
    disableDefaultControls?: boolean
    canvasElement?: HTMLCanvasElement
}

export interface Params {
    scene: THREE.Scene
    camera: THREE.PerspectiveCamera
    renderer: THREE.WebGLRenderer
    orbitControls?: OrbitControls
}

export interface Fn {
    (args: Params): void
}

export const initScene = ({ backgroundColor, fogColor, disableShadows, disableDefaultLights, disableShadowsOnDefaultLights, disableDefaultControls, canvasElement }: Props) => {
  return (fn: Fn) => {
    // basic scene setup
    const scene = new THREE.Scene()
    if (backgroundColor) {
      scene.background = backgroundColor
    }
    if (fogColor) {
      scene.fog = new THREE.Fog(fogColor, 0.0025, 50)
    }
    // setup camera and basic renderer
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100)
    const renderer = new THREE.WebGLRenderer({ antialias: true, ...(canvasElement ? { canvas: canvasElement } : {}) })
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.shadowMap.enabled = !disableShadows
    renderer.shadowMap.type = THREE.VSMShadowMap
    if (backgroundColor) {
      renderer.setClearColor(backgroundColor)
    }
    onResize(camera, renderer)
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    if (!canvasElement) {
      document.body.appendChild(renderer.domElement)
    }
    // init orbit controls
    let orbitControls 
    if (!disableDefaultControls) {
      orbitControls = initOrbitControls(camera, renderer)
    }
    // add some basic lighting to the scene
    if (!disableDefaultLights) {
      initLighting(scene, { disableShadowsOnDefaultLights })
    }
    // call fn
    fn({ scene, camera, renderer, orbitControls })
  }
}
