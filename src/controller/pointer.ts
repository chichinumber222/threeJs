import * as THREE from 'three'
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls'

export const initPointerControls = (camera: THREE.PerspectiveCamera, element: HTMLElement) => {
    const controls = new PointerLockControls(camera, element)

    // fullscrim enable/disable
    document.addEventListener('dblclick', () => {
        const fullscreenElement = 
            document.fullscreenElement || 
            document.webkitFullscreenElement
        if (!fullscreenElement) {
            if (element.requestFullscreen) {
                element.requestFullscreen()
            } else if (element.webkitRequestFullScreen) {
                element.webkitRequestFullScreen()
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen()
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen()
            }
        }
    })

    // movement
    const activeKeys: Record<string, boolean> = {
        w: false,
        a: false,
        s: false,
        d: false
    }
    window.addEventListener('keydown', function (event) {
        if (!controls.isLocked) {
            return
        }
        const key = event.key.toLocaleLowerCase()
        if (key in activeKeys) activeKeys[key] = true
    })
    window.addEventListener('keyup', function (event) {
        if (!controls.isLocked) {
            return
        }
        const key = event.key.toLocaleLowerCase()
        if (key in activeKeys) activeKeys[key] = false
    })

    // lock/unlock
    let isLock = false
    window.addEventListener('click', () => {
        isLock = !isLock
        if (isLock) {
            controls.lock()
        } else {
            Object.keys(activeKeys).forEach(key => activeKeys[key] = false)
            controls.unlock()
        }
    })

    // animate for smoothness
    const speed = 0.03
    function animate() {
        if (activeKeys.w) controls.moveForward(speed)
        if (activeKeys.a) controls.moveRight(-speed)
        if (activeKeys.s) controls.moveForward(-speed)
        if (activeKeys.d) controls.moveRight(speed)
        requestAnimationFrame(animate)
    }
    animate()
}