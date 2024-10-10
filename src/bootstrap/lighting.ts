import * as THREE from 'three'

export interface Props {
    disableShadows?: boolean 
}

export const initLighting = (scene: THREE.Scene, { disableShadows }: Props) => {
    const ambientLight = new THREE.AmbientLight(0x666666, 5) // темно-серый
    scene.add(ambientLight) 

    const directionalLight = new THREE.DirectionalLight(0xaaaaaa, 5) // светло-серый
    directionalLight.position.set(5, 12, 8)
    directionalLight.castShadow = !disableShadows
    directionalLight.shadow.camera.near = 0.1
    directionalLight.shadow.camera.far = 200
    directionalLight.shadow.camera.right = 10
    directionalLight.shadow.camera.left = -10
    directionalLight.shadow.camera.top = 10
    directionalLight.shadow.camera.bottom = -10
    directionalLight.shadow.mapSize.width = 2048
    directionalLight.shadow.mapSize.height = 2048
    directionalLight.shadow.radius = 4
    directionalLight.shadow.bias = -0.00005
    
    scene.add(directionalLight)
}
