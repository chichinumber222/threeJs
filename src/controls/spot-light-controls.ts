import * as THREE from "three"
import GUI from 'lil-gui'

export const initializeSpotLightControls = (gui: GUI, light: THREE.SpotLight, lightHelper: THREE.Object3D) => {
  const spotLightFolder = gui.addFolder("Spot Light")
  spotLightFolder
    .add(light, "intensity", 0, 5, 0.1)
  spotLightFolder
    .addColor(light, "color")
  spotLightFolder
    .add(light, "angle", 0, 1.5)
  spotLightFolder
    .add(lightHelper, "visible")
    .name('spotlight-helper')
}
