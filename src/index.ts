import * as THREE from 'three'

function main() {
    const canvas = document.querySelector('#c')

    const renderer = new THREE.WebGLRenderer({ antialias: true, ...(canvas ? { canvas } : {}) })
    renderer.setSize(window.innerWidth, window.innerHeight)

    const fov = 75
    const aspect = 2
    const near = 0.1
    const far = 5
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far)
    camera.position.z = 4

    const scene = new THREE.Scene()
  
    function addLight() {
        const color = 0xFFFFFF
        const intensity = 3
        const light = new THREE.DirectionalLight(color, intensity)
        light.position.set(-1, 2, 4)
        scene.add(light)
    }
    addLight()

    const boxWidth = 1;
    const boxHeight = 1;
    const boxDepth = 1;
    const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);

    function makeInstance(geometry: THREE.BufferGeometry, color: number, x: number) {
        const material = new THREE.MeshPhongMaterial({ color })
        const cube = new THREE.Mesh(geometry, material)
        scene.add(cube)
        cube.position.x = x
        return cube
    }
    const cubes = [
        makeInstance(geometry, 0x44aa88, 0),
        makeInstance(geometry, 0x8844aa, -2),
        makeInstance(geometry, 0xaa8844, 2),
    ]
    
    function render(time: number) {
        time *= 0.001
        cubes.forEach((cube, ndx) => {
            const speed = 1 + ndx * .1
            const rot = time * speed
            cube.rotation.x = rot
            cube.rotation.y = rot
        })
        renderer.render(scene, camera)
        window.requestAnimationFrame(render)
    }
    window.requestAnimationFrame(render)
} 

main()
