import * as THREE from 'three'
import GUI from 'lil-gui'

export const axisName = 'axisHelper'
export const gridName = 'gridHelper'
export const polarGridName = 'polarGridHelper'

export const axesInit = (scene: THREE.Scene) => {
  const helper = new THREE.AxesHelper(20)
  helper.name = axisName
  scene.add(helper)
}

export const gridInit = (scene: THREE.Scene) => {
  const helper = new THREE.GridHelper(10, 10)
  helper.name = gridName
  scene.add(helper)
}

export const polarGridInit = (scene: THREE.Scene) => {
  const helper = new THREE.PolarGridHelper(10, 16, 8, 64)
  helper.name = polarGridName
  scene.add(helper)
}


const removeOrAddScene = (scene: THREE.Scene) => {
  return (helperName: string, addHelperFn: (scene: THREE.Scene) => void) => {
    const obj = scene.getObjectByName(helperName)
    if (obj) {
      scene.remove(obj)
    } else {
      addHelperFn(scene)
    }
  }
}

export const initHelpersControls = (gui: GUI, scene: THREE.Scene) => {
  const removeOrAddHandler = removeOrAddScene(scene)
  const helpers = {
    [axisName]: {
      toggle: () => removeOrAddHandler(axisName, axesInit),
    },
    [gridName]: {
      toggle: () => removeOrAddHandler(gridName, gridInit),
    },
    [polarGridName]: {
      toggle: () => removeOrAddHandler(polarGridName, polarGridInit),
    },
  }
  const folder = gui.addFolder('Helpers')
  folder.add(helpers[axisName], 'toggle').name(`Toggle ${axisName}`)
  folder.add(helpers[gridName], 'toggle').name(`Toggle ${gridName}`)
  folder.add(helpers[polarGridName], 'toggle').name(`Toggle ${polarGridName}`)

  folder.close()
}
