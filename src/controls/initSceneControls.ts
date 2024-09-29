import * as THREE from 'three'
import GUI from 'lil-gui'
import TextureImg from '../assets/images/painted_brick_diff_4k.jpg'
import Cubemap from '../assets/images/zwartkops_straight_afternoon.jpg'

const textureLoader = new THREE.TextureLoader()

const backgroundValues = ['White', 'Black', 'Null', 'Color', 'Texture', 'Cubemap']

const sceneProps = {
    background: backgroundValues[0]
}

const handleBackgroundChange = (value: typeof backgroundValues[number], scene: THREE.Scene) => {
    switch (value) {
        case 'White':
            scene.background = new THREE.Color(0xffffff)
            break
        case 'Black':
            scene.background = new THREE.Color(0x000000)
            break
        case 'Null':
            scene.background = null
            break
        case 'Color':
            scene.background = new THREE.Color(0x44ff44)
            break
        case 'Texture':
            textureLoader.load(TextureImg, (loaded) => {
                loaded.colorSpace = THREE.SRGBColorSpace
                scene.background = loaded
                scene.environment = null
            })
            break
        case 'Cubemap':
            textureLoader.load(Cubemap, (loaded) => {
                loaded.mapping = THREE.EquirectangularReflectionMapping
                scene.background = loaded
                scene.environment = loaded
            })
            break
        default:
            break
    }
}


const initFogControl = (parentFolder: GUI, fog: THREE.Fog | THREE.FogExp2) => {
    const fogFolder = parentFolder.addFolder('Туман')
    let fogProps
    if (fog instanceof THREE.Fog) {
        fogProps = {
            color: fog.color,
            near: fog.near,
            far: fog.far,
        }
        fogFolder.addColor(fogProps, 'color')
        fogFolder.add(fogProps, 'near', 0, 10)
        fogFolder.add(fogProps, 'far', 0, 100)
    } else {
        fogProps = {
            color: fog.color,
            density: fog.density
        }
        fogFolder.addColor(fogProps, 'color')
        fogFolder.add(fogProps, 'density', 0, 0.5)
    }
    fogFolder.onChange((event) => {
        /* @ts-expect-error: Unreachable code error */
        fog?.[event.property] = event.value
    })
    fogFolder.close()
}

export const initSceneControls = (gui: GUI, scene: THREE.Scene) => {
    const sceneFolder = gui.addFolder('Сцена')
    sceneFolder
        .add(sceneProps, 'background', backgroundValues)
        .onChange((value: typeof backgroundValues[number]) => handleBackgroundChange(value, scene))
    if (scene.fog) {
        initFogControl(sceneFolder, scene.fog)
    }
    sceneFolder.close()
}
