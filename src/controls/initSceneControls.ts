import * as THREE from 'three'
import GUI from 'lil-gui'

export const initSceneControls = (gui: GUI, scene: THREE.Scene) => {
    const sceneFolder = gui.addFolder('Сцена')
    if (scene.fog) {
        initFogControl(sceneFolder, scene.fog)
    }
    sceneFolder.close()
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
