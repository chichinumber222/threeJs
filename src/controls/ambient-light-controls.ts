import * as THREE from "three"
import GUI from 'lil-gui'

export const initializeAmbientLightControls = (gui: GUI, light: THREE.Light) => {
  const props = {
    color: light.color,
    intensity: light.intensity,
    turn: () => (light.visible = !light.visible)
  }
  const ambienLightFolder = gui.addFolder("Ambient Light")
  ambienLightFolder
    .add(props, "intensity", 0, 5, 0.1)
    .onChange((int: number) => (light.intensity = int))
  ambienLightFolder
    .addColor(props, "color")
    .onChange((col: string) => (light.color = new THREE.Color(col)))
  ambienLightFolder
    .add(props, 'turn')
    .name('Включить/Выключить')
}
