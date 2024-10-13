import * as THREE from "three"
import GUI from "lil-gui"
import { initScene, Props as InitSceneProps } from "./bootstrap/bootstrap"
import { stats } from "./utils/stats"
import { initHelpersControls } from "./controls/helper-controls"
import { FontLoader } from "three/examples/jsm/loaders/FontLoader"
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry"

const props: InitSceneProps = {
	backgroundColor: new THREE.Color(0xffffff),
}

const gui = new GUI()

const fontsLoader = new FontLoader()
const textureLoader = new THREE.TextureLoader()
const matcapTexture = textureLoader.load('./static/matcap/1.png')

const mountTextWithGUI = (scene: THREE.Scene) => {
	fontsLoader.load("./static/fonts/helvetiker_bold.typeface.json", (font) => {
		const parameters = {
			font,
			size: 2,
			depth: 0.3,
			curveSegments: 3,
			bevelEnabled: true,
			bevelThickness: 0.2,
			bevelSize: 0.05,
			bevelOffset: 0,
			bevelSegments: 5,
		}

		const otherParameters = {
			text: "Arya Stark",
			wireframe: false,
			material: 'MeshMatcapMaterial'
		}

		const name = 'text'

		const alignGeometry = (geometry: THREE.BufferGeometry) => {
			geometry.computeBoundingBox()
			geometry.translate(
				-(geometry.boundingBox?.max.x || 0) * 0.5,
				-(geometry.boundingBox?.max.y || 0) * 0.5,
				-(geometry.boundingBox?.max.z || 0) * 0.5
			)
			// либо просто
			// geometry.center()
		}

		const createMesh = () => {
			const material = otherParameters.material === 'MeshMatcapMaterial'
				? new THREE.MeshMatcapMaterial({
					matcap: matcapTexture,
				})
				: new THREE.MeshStandardMaterial({
					wireframe: otherParameters.wireframe,
				})
			const geometry = new TextGeometry(otherParameters.text, parameters)
			alignGeometry(geometry)
			const mesh = new THREE.Mesh(geometry, material)
			mesh.name = name
			return mesh
		}

		const refreshGeometry = () => {
			const mesh = scene.getObjectByName(name) as THREE.Mesh
			if (!mesh) {
				return
			}
			const geometry = new TextGeometry(otherParameters.text, parameters)
			alignGeometry(geometry)
			mesh.geometry = geometry
			mesh.updateMatrix()
		}

		const refreshMaterial = () => {
			const mesh = scene.getObjectByName(name) as THREE.Mesh
			if (!mesh) {
				return
			}
			const material = otherParameters.material === 'MeshMatcapMaterial'
				? new THREE.MeshMatcapMaterial({
					matcap: matcapTexture,
				})
				: new THREE.MeshStandardMaterial({
					wireframe: otherParameters.wireframe,
				})
			mesh.material = material
		}

		const textFolder = gui.addFolder("Text")
		textFolder
			.add(parameters, "size")
			.min(0)
			.max(5)
			.step(0.01)
			.onChange(refreshGeometry)
		textFolder
			.add(parameters, "depth")
			.min(0)
			.max(3)
			.step(0.01)
			.onChange(refreshGeometry)
		textFolder
			.add(parameters, "curveSegments")
			.min(0)
			.max(20)
			.step(1)
			.onChange(refreshGeometry)
		textFolder.add(parameters, "bevelEnabled").onChange(refreshGeometry)
		textFolder
			.add(parameters, "bevelThickness")
			.min(0)
			.max(1)
			.step(0.01)
			.onChange(refreshGeometry)
		textFolder
			.add(parameters, "bevelSize")
			.min(0)
			.max(0.3)
			.step(0.001)
			.onChange(refreshGeometry)
		textFolder
			.add(parameters, "bevelOffset")
			.min(-1)
			.max(1)
			.step(0.01)
			.onChange(refreshGeometry)
		textFolder
			.add(parameters, "bevelSegments")
			.min(0)
			.max(5)
			.step(1)
			.onChange(refreshGeometry)
		textFolder
			.add(otherParameters, 'text')
			.onChange(refreshGeometry)
		textFolder
			.add(otherParameters, 'wireframe')
			.onChange(refreshMaterial)
		textFolder
			.add(otherParameters, 'material', ['MeshMatcapMaterial', 'MeshStandardMaterial'])
			.onChange(refreshMaterial)
		textFolder.close()

		scene.add(createMesh())
	})
}

const mountTorusRain = (scene: THREE.Scene) => {
	const material = new THREE.MeshMatcapMaterial({
		matcap: matcapTexture
	})
	const geometry = new THREE.TorusGeometry()
	for (let i = 0; i < 100; i++) {
		const torus = new THREE.Mesh(geometry, material)
		torus.position.set(
			(Math.random() - 0.5) * 15,
			(Math.random() - 0.5) * 15, 
			(Math.random() - 0.5) * 15
		)
		torus.rotation.set(
			Math.random() * Math.PI,
			Math.random() * Math.PI,
			Math.random() * Math.PI,
		)
		const scale = Math.random() * 0.5
		torus.scale.set(scale, scale, scale)

		scene.add(torus)
	}
}

initScene(props)(({ scene, camera, renderer, orbitControls }) => {
	camera.position.z = 9

	mountTextWithGUI(scene)

	mountTorusRain(scene)

	function animate() {
		requestAnimationFrame(animate)
		renderer.render(scene, camera)
		orbitControls?.update()
		stats.update()
	}
	animate()

	initHelpersControls(gui, scene)
})
