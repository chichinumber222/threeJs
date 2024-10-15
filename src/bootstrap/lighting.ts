import * as THREE from 'three'

export interface Props {
  disableShadowsOnDefaultLights?: boolean 
}

export const initLighting = (scene: THREE.Scene, { disableShadowsOnDefaultLights }: Props) => {
  const ambientLight = new THREE.AmbientLight(0xffffff, 2)
  scene.add(ambientLight) 

  const directionalLight = new THREE.DirectionalLight(0xffffff, 2)
  directionalLight.position.set(1, 3, 2)
  directionalLight.castShadow = !disableShadowsOnDefaultLights
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
