import * as THREE from "three"
import { initScene, Props as InitSceneProps } from './bootstrap/bootstrap'
import { stats } from "./utils/stats"
import { onChangeCursor } from "./utils/update-coord"
import gsap from 'gsap'
import { OrbitControls } from "./controller/orbit"
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import _ from 'lodash'
import { isMobile } from "./utils/is-mobile"

interface ActionParams {
  camera: THREE.PerspectiveCamera
  point: THREE.Vector3
  orbitControls?: OrbitControls
  markers?: (THREE.Mesh | THREE.Group)[]
  enableEventHandlers: (value: boolean) => void
}

interface HoverEnabledParams {
  enable: true
  markers: (THREE.Mesh | THREE.Group)[]
  point: THREE.Vector3
}

interface HoverDisabledParams {
  enable: false
  markers: (THREE.Mesh | THREE.Group)[]
}

type HoverParams = HoverEnabledParams | HoverDisabledParams

interface Actions {
  leftClick?: (params: ActionParams) => void
  rightClick?: (params: ActionParams) => void
  hover?: (params: HoverParams) => void
}

type ActionsMap = Map<string, Actions>
type ObjectsMap = Map<string, THREE.Object3D>

interface Positions {
  start: THREE.Vector3,
  last: THREE.Vector3
}

interface Quaternions {
  start: THREE.Quaternion
  last: THREE.Quaternion
}

interface DescriptionOptionsTopBottom {
  text: string
  position: 'top' | 'bottom'
  height?: string
}

interface DescriptionOptionsLeftRight {
  text: string
  position: 'left' | 'right'
  width?: string
}

type DescriptionOptions = DescriptionOptionsTopBottom | DescriptionOptionsLeftRight

const props: InitSceneProps = {
  disableDefaultLights: true,
  canvasElement: <HTMLCanvasElement>document.getElementById('webgl'),
}

const textureLoader = new THREE.TextureLoader()
const gltfLoader = new GLTFLoader()
const raycaster = new THREE.Raycaster()
const mouse = onChangeCursor()
const measure = 10
const offset = 0.1
const floorOffset = 0.9
const positions: Positions = {
  start: new THREE.Vector3(1, 1, 1),
  last: new THREE.Vector3(1, 1, 1),
}
const quaternions: Quaternions = {
  start: new THREE.Quaternion(0, 0, 0),
  last: new THREE.Quaternion(0, 0, 0),
}

const markObject = (currentObject: THREE.Object3D) => {
  const uniqId = THREE.MathUtils.generateUUID()
  currentObject.traverse((child) => child.userData.id = uniqId)
  return uniqId
}

const useCameraDirection = (camera: THREE.PerspectiveCamera) => {
  const direction = new THREE.Vector3()
  return () => {
    camera.getWorldDirection(direction)
    return direction
  }
}

const useControl = (camera: THREE.PerspectiveCamera, orbitControls?: OrbitControls) => {
  const getCameraDirection = useCameraDirection(camera)
  const cameraEyes = new THREE.Vector3()
  return () => {
    cameraEyes.copy(camera.position).add(getCameraDirection().multiplyScalar(0.5))
    orbitControls?.target.copy(cameraEyes)
    orbitControls?.update()
  }
}

const getRepeatableTexture = (texture: THREE.Texture, repeatCount?: number) => {
  const count = repeatCount ?? 5
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(count, count)
  return texture
}

const descriptionModeAnimation = (
  actionParams: ActionParams,
  stopPosition: THREE.Vector3,
  stopQuaternion: THREE.Quaternion,
  descriptionOptions: DescriptionOptions,
) => {
  const { enableEventHandlers, orbitControls, camera } = actionParams
  positions.last?.copy(camera.position)
  quaternions.last?.copy(camera.quaternion)
  enableEventHandlers(false)
  if (orbitControls) orbitControls.enabled = false
  const timeline = gsap.timeline({
    onComplete: () => {
      let textElement: HTMLElement | null = null
      let exitButtonElement: HTMLElement | null = null
      switch (descriptionOptions.position) {
        case 'left': {
          textElement = <HTMLElement>document.getElementsByClassName('text_left')[0]
          exitButtonElement = <HTMLElement>document.getElementsByClassName('exit_left')[0]
          textElement.style.width = descriptionOptions?.width || '35%'
          break
        }
        case 'right': {
          textElement = <HTMLElement>document.getElementsByClassName('text_right')[0]
          exitButtonElement = <HTMLElement>document.getElementsByClassName('exit_right')[0]
          textElement.style.width = descriptionOptions?.width || '35%'
          break
        }
        case 'top': {
          textElement = <HTMLElement>document.getElementsByClassName('text_top')[0]
          exitButtonElement = <HTMLElement>document.getElementsByClassName('exit_top')[0]
          textElement.style.height = descriptionOptions?.height || '25%'
          break
        }
        case 'bottom': {
          textElement = <HTMLElement>document.getElementsByClassName('text_bottom')[0]
          exitButtonElement = <HTMLElement>document.getElementsByClassName('exit_bottom')[0]
          textElement.style.height = descriptionOptions?.height || '25%'
          break
        }
      }
      textElement.innerHTML = `${descriptionOptions.text}`
      const exit = (event: MouseEvent) => {
        event.stopPropagation()
        camera.position.copy(positions.last || positions.start)
        camera.quaternion.copy(quaternions.last || quaternions.start)
        enableEventHandlers(true)
        if (orbitControls) orbitControls.enabled = true
        textElement.classList.add('no_visible')
        exitButtonElement.classList.add('no_visible')
        textElement.innerHTML = ``
        exitButtonElement.removeEventListener('click', exit)
      }
      exitButtonElement.addEventListener('click', exit)
      textElement.classList.remove('no_visible')
      exitButtonElement.classList.remove('no_visible')
    }
  })
  timeline.addLabel("start", 0)
  const startQuaternion = camera.quaternion.clone()
  const endQuaternion = stopQuaternion.clone()
  timeline.to({ t: 0 }, {
    duration: 1.5,
    t: 1,
    ease: "none",
    onUpdate: function () {
      const t = this.targets()[0].t
      camera.quaternion.slerpQuaternions(startQuaternion, endQuaternion, t)
    }
  }, "start")
  timeline.to(camera.position, {
    duration: 1.5,
    ease: "none",
    x: stopPosition.x,
    z: stopPosition.z,
    y: stopPosition.y,
  }, "start")
}

const createWoodFloor = (scene: THREE.Scene) => {
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10),
    new THREE.MeshStandardMaterial({
      color: 0xcccccc,
      map: getRepeatableTexture(textureLoader.load('static/textures/wood-floor/color.jpg'), 10),
      normalMap: getRepeatableTexture(textureLoader.load('static/textures/wood-floor/normal.jpg'), 10),
      roughnessMap: getRepeatableTexture(textureLoader.load('static/textures/wood-floor/rough.jpg'), 10),
    })
  )
  mesh.rotation.x = - Math.PI * 0.5
  mesh.geometry.setAttribute('uv2', new THREE.Float32BufferAttribute(mesh.geometry.attributes.uv.array, 2))
  mesh.name = 'wood-floor'
  scene.add(mesh)
}

const createCarpet = (scene: THREE.Scene, objectsMap: ObjectsMap, actionsMap: ActionsMap) => {
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(measure - 2 * floorOffset, measure - 2 * floorOffset),
    new THREE.MeshStandardMaterial({
      color: 0xdddddd,
      map: getRepeatableTexture(textureLoader.load('static/textures/carpet/color.jpg')),
      normalMap: getRepeatableTexture(textureLoader.load('static/textures/carpet/normal.jpg')),
      aoMap: getRepeatableTexture(textureLoader.load('static/textures/carpet/ao.jpg')),
      aoMapIntensity: 0.7,
      roughnessMap: getRepeatableTexture(textureLoader.load('static/textures/carpet/rough.jpg')),
    })
  )
  mesh.rotation.x = -Math.PI * 0.5
  mesh.position.y += 0.02
  mesh.geometry.setAttribute('uv2', new THREE.Float32BufferAttribute(mesh.geometry.attributes.uv.array, 2))
  mesh.receiveShadow = true
  mesh.name = 'carpet'
  scene.add(mesh)
  const rightClickAction = ({ point, orbitControls, enableEventHandlers, markers, camera }: ActionParams) => {
    const timeline = gsap.timeline({
      onStart: () => {
        if (orbitControls) orbitControls.enabled = false
        enableEventHandlers(false)
      },
      onComplete: () => {
        if (orbitControls) orbitControls!.enabled = true
        enableEventHandlers(true)
      },
    })
    timeline.addLabel("start", 0)
    if (markers?.length) {
      const floorMarker = markers[0]
      const floorMarkerBase = floorMarker.children[0] as THREE.Mesh<THREE.CircleGeometry, THREE.MeshBasicMaterial>
      const floorMarkerSecondary = floorMarker.children[1] as THREE.Mesh<THREE.CircleGeometry, THREE.MeshBasicMaterial>
      timeline.to(floorMarkerBase.scale, {
        duration: 0.2,
        x: 1.2,
        y: 1.2,
        ease: "power2.inOut",
        repeat: 1,
        yoyo: true,
      }, "start")
      timeline.to(floorMarkerSecondary.material, {
        duration: 0.2,
        ease: "power2.inOut",
        opacity: 0.15,
        repeat: 1,
        yoyo: true,
      }, "start")
    }
    timeline.to(camera.position, {
      duration: 0.7,
      ease: "power2.inOut",
      x: point.x,
      z: point.z,
    }, "start+=0.15")
  }
  const hoverAction = (params: HoverParams) => {
    const floorMarker = params.markers[0]
    if (params.enable) {
      floorMarker.position.set(params.point.x, params.point.y + 0.025, params.point.z)
      floorMarker.visible = true
      return
    }
    floorMarker.visible = false
  }
  const id = markObject(mesh)
  actionsMap.set(id, {
    rightClick: rightClickAction,
    hover: hoverAction,
  })
  objectsMap.set(id, mesh)
}

const createWalls = (scene: THREE.Scene) => {
  const geometry = new THREE.PlaneGeometry(measure, measure / 3, 100, 100)
  const material = new THREE.MeshStandardMaterial({
    color: '#FCFBF4',
    map: getRepeatableTexture(textureLoader.load('static/textures/wall/color.jpg'), 3),
    normalMap: getRepeatableTexture(textureLoader.load('static/textures/wall/normal.jpg'), 3),
    roughnessMap: getRepeatableTexture(textureLoader.load('static/textures/wall/rough.jpg'), 3),
    displacementMap: getRepeatableTexture(textureLoader.load('static/textures/wall/disp.jpg'), 3),
    displacementScale: 0.04,
  })
  const wallNorth = new THREE.Mesh(geometry, material)
  wallNorth.position.set(0, (measure / 6) - offset, -((measure / 2) - offset))
  wallNorth.name = 'wall-north'
  const wallSouth = new THREE.Mesh(geometry, material)
  wallSouth.position.set(0, (measure / 6) - offset, (measure / 2) - offset)
  wallSouth.rotation.set(0, Math.PI, 0)
  wallSouth.name = 'wall-south'
  const wallWest = new THREE.Mesh(geometry, material)
  wallWest.position.set((measure / 2) - offset, (measure / 6) - offset, 0)
  wallWest.rotation.set(0, -Math.PI / 2, 0)
  wallWest.name = 'wall-west'
  const wallEast = new THREE.Mesh(geometry, material)
  wallEast.position.set(-((measure / 2) - offset), (measure / 6) - offset, 0)
  wallEast.rotation.set(0, Math.PI / 2, 0)
  wallEast.name = 'wall-east'
  scene.add(wallNorth, wallSouth, wallWest, wallEast)
}

const createCeiling = (scene: THREE.Scene) => {
  const geometry = new THREE.PlaneGeometry(measure, measure)
  const material = new THREE.MeshStandardMaterial({
    color: '#FCFBF4',
    map: getRepeatableTexture(textureLoader.load('static/textures/ceiling/color.jpg'), 4),
    normalMap: getRepeatableTexture(textureLoader.load('static/textures/ceiling/normal.jpg'), 4),
    roughnessMap: getRepeatableTexture(textureLoader.load('static/textures/ceiling/rough.jpg'), 4),
  })
  const mesh = new THREE.Mesh(geometry, material)
  mesh.rotation.set(Math.PI / 2, 0, 0)
  mesh.position.set(0, (measure / 3) - offset, 0)
  mesh.name = 'ceiling'
  scene.add(mesh)
}

const createPictureModel = (scene: THREE.Scene, objectsMap: ObjectsMap, actionsMap: ActionsMap) => {
  gltfLoader.load('./static/gltf/picture.gltf/fancy_picture_frame_01_2k.gltf', (gltf) => {
    const model = gltf.scene
    model.scale.set(2.5, 2.5, 2.5)
    model.position.set(-2, 2, -4.85)
    model.castShadow = true
    scene.add(model)
    const descriptionText = 'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Deleniti eius similique consequuntur numquam. Voluptatem ut tenetur explicabo. Impedit et, quia eveniet illum molestiae similique. Placeat ullam explicabo rem harum cumque? Lorem ipsum, dolor sit amet consectetur adipisicing elit. Deleniti eius similique consequuntur numquam. Voluptatem ut tenetur explicabo. Impedit et, quia eveniet illum molestiae similique. Placeat ullam explicabo rem harum cumque? Lorem ipsum, dolor sit amet consectetur adipisicing elit. Deleniti eius similique consequuntur numquam. Voluptatem ut tenetur explicabo. Impedit et, quia eveniet illum molestiae similique. Placeat ullam explicabo rem harum cumque? Lorem ipsum, dolor sit amet consectetur adipisicing elit. Deleniti eius similique consequuntur numquam. Voluptatem ut tenetur explicabo. Impedit et, quia eveniet illum molestiae similique. Placeat ullam explicabo rem harum cumque? Lorem ipsum, dolor sit amet consectetur adipisicing elit. Deleniti eius similique consequuntur numquam. Voluptatem ut tenetur explicabo. Impedit et, quia eveniet illum molestiae similique. Placeat ullam explicabo rem harum cumque? Lorem ipsum, dolor sit amet consectetur adipisicing elit. Deleniti eius similique consequuntur numquam. Voluptatem ut tenetur explicabo. Impedit et, quia eveniet illum molestiae similique. Placeat ullam explicabo rem harum cumque? Lorem ipsum, dolor sit amet consectetur adipisicing elit. Deleniti eius similique consequuntur numquam. Voluptatem ut tenetur explicabo. Impedit et, quia eveniet illum molestiae similique. Placeat ullam explicabo rem harum cumque? Lorem ipsum, dolor sit amet consectetur adipisicing elit. Deleniti eius similique consequuntur numquam. Voluptatem ut tenetur explicabo. Impedit et, quia eveniet illum molestiae similique. Placeat ullam explicabo rem harum cumque? Lorem ipsum, dolor sit amet consectetur adipisicing elit. <br><br> Deleniti eius similique consequuntur numquam. Voluptatem ut tenetur explicabo. Impedit et, quia eveniet illum molestiae similique. <br><br> Placeat ullam explicabo rem harum cumque?'
    const cameraStopPosition = new THREE.Vector3(-1.4, 1.92, -3.7)
    const cameraStopQuaternion = new THREE.Quaternion(0.04, 0, 0)
    const id = markObject(model)
    actionsMap.set(id, {
      leftClick: (params: ActionParams) => {
        descriptionModeAnimation(params, cameraStopPosition, cameraStopQuaternion, { text: descriptionText, position: 'right' })
      }
    })
    objectsMap.set(id, model)
  }, undefined, function (error) {
    console.error('error picture', error)
  })
}

const createDartBoardModel = (scene: THREE.Scene, objectsMap: ObjectsMap, actionsMap: ActionsMap) => {
  gltfLoader.load('./static/gltf/dartboard.gltf/dartboard_1k.gltf', (gltf) => {
    const model = gltf.scene
    model.scale.set(2, 2, 2)
    model.position.set(4.85, 2, -1)
    model.rotation.set(0, -Math.PI / 2, 0)
    model.castShadow = true
    scene.add(model)
    const descriptionText = 'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Deleniti eius similique consequuntur numquam. Voluptatem ut tenetur explicabo. Impedit et, quia eveniet illum molestiae similique. Placeat ullam explicabo rem harum cumque? Lorem ipsum, dolor sit amet consectetur adipisicing elit.'
    const cameraStopPosition = new THREE.Vector3(4.13, 2.06, -1.57)
    const cameraStopQuaternion = new THREE.Quaternion(-0.02, -0.78, -0.03, 0.62)
    const id = markObject(model)
    actionsMap.set(id, {
      leftClick: (params: ActionParams) => {
        descriptionModeAnimation(params, cameraStopPosition, cameraStopQuaternion, { text: descriptionText, position: 'left' })
      },
    })
    objectsMap.set(id, model)
  }, undefined, function (error) {
    console.error('error model', error)
  })
}

const createPedestalModel = (scene: THREE.Scene, objectsMap: ObjectsMap) => {
  gltfLoader.load('./static/gltf/drawer.gltf/vintage_wooden_drawer_01_4k.gltf', (gltf) => {
    const model = gltf.scene
    model.scale.set(1.5, 1.5, 1.5)
    model.rotation.set(0, -Math.PI / 2, 0)
    model.position.set(3.8, 0, -1)
    model.castShadow = true
    scene.add(model)
    const id = markObject(model)
    objectsMap.set(id, model)
  }, undefined, function (error) {
    console.error('error model', error)
  })
}

const createCameraModel = (scene: THREE.Scene, objectsMap: ObjectsMap, actionsMap: ActionsMap) => {
  gltfLoader.load('./static/gltf/camera.gltf/Camera_01_1k.gltf', (gltf) => {
    const model = gltf.scene
    model.scale.set(1.3, 1.3, 1.3)
    model.position.set(3.83, 0.81, -0.75)
    model.rotation.set(0, -Math.PI / 2, 0)
    model.castShadow = true
    scene.add(model)
    const descriptionText = 'Camera Lorem ipsum, dolor sit amet consectetur adipisicing elit. Deleniti eius similique consequuntur numquam. Voluptatem ut tenetur explicabo. Impedit et, quia eveniet illum molestiae similique. Placeat ullam explicabo rem harum cumque? Lorem ipsum, dolor sit amet consectetur adipisicing elit.'
    const cameraStopPosition = new THREE.Vector3(3.54, 0.95, -0.83)
    const cameraStopQuaternion = new THREE.Quaternion(-0.13, -0.63, -0.11, 0.75)
    const id = markObject(model)
    actionsMap.set(id, {
      leftClick: (params: ActionParams) => {
        descriptionModeAnimation(params, cameraStopPosition, cameraStopQuaternion, { text: descriptionText, position: 'left' })
      },
    })
    objectsMap.set(id, model)
  }, undefined, function (error) {
    console.error('error model', error)
  })
}

const createPocketWatchModel = (scene: THREE.Scene, objectsMap: ObjectsMap, actionsMap: ActionsMap) => {
  gltfLoader.load('./static/gltf/watch.gltf/vintage_pocket_watch_1k.gltf', (gltf) => {
    const model = gltf.scene
    model.scale.set(1.4, 1.4, 1.4)
    model.position.set(3.75, 0.82, -1.3)
    model.rotation.set(-Math.PI / 2, 0, 0)
    model.castShadow = true
    scene.add(model)
    const descriptionText = `В 1845 году к часам на церкви Святого Иоанна в Эксетере, на западе Англии, добавили интересное новшество — еще одну минутную стрелку, которая на четырнадцать минут опережала первую1. По объяснению га- зеты Trewman’s Exeter Flying Post, это было «большое удобство для обще- ства», так как теперь часы показывали «не только точное время в Эксете- ре, но и железнодорожное время»2.
<br>Чувство времени всегда определялось движением планет. О «днях» и «годах» люди говорили задолго до того, как узнали, что Земля вращает- ся вокруг своей оси и вокруг Солнца. Благодаря росту и убыванию луны возникло представление о месяцах. Движение солнца по небосводу по- казывало время дня. Но момент, когда солнце достигает высшей точки, зависит, конечно, от места наблюдения. Если вы окажетесь в Эксетере, это наступит примерно на четырнадцать минут позже по сравнению с Лондоном.
<br>Естественно, когда часы стали обычной вещью, люди начали ставить их согласно наблюдениям за небом. Это было удобно для координации действий только с местными жителями. Если два человека живут в Эксе- тере и условятся встретиться в семь вечера, вряд ли имеет какое-то значе- ние, что в Лондоне, в 320 километрах от их местонахождения, полагают, что сейчас 7:14. Однако как только между Эксетером и Лондоном стали курсировать поезда, останавливающиеся во множестве других городков, в каждом из которых было свое представление о текущем времени, люди столкнулись с логистическим хаосом. Первые железнодорожные расписа- ния информировали путешественников, что «время в Лондоне примерно на четыре минуты отстает от Рединга и на семь с половиной минут опе- режает время в Сайренсестере» и так далее, но многие пассажиры, понят- ное дело, безнадежно путались. Хуже того, путались машинисты и сиг- нальщики, что повышало риск крушений3. Поэтому железные дороги перешли на «железнодорожное время».
В основу было положено среднее время по Гринвичу, определяемое знаменитой обсерваторией в лондон- ском районе Гринвич.
<br>Власти некоторых городов быстро уловили пользу стандартизации вре- мени по всей стране и соответствующим образом скорректировали свои часы. Кое-кто обижался на столичное своеволие, держась за мысль, что их время — это «правильное время», как с очаровательным местечковым патриотизмом выразился Flying Post. Много лет декан Эксетера упрямо отказывался перевести часы на городском кафедральном соборе.
<br>Конечно же, никакого «правильного времени» не существует. Как и в случае денег, польза от него есть, если только оно общепринято. Тем не менее точное измерение времени возможно. И оно случилось в 1656 году благодаря голландцу по имени Христиан Гюйгенс. Конечно, часы люди знали и до Гюйгенса. Самые разные цивилизации, от Древне- го Египта до средневековой Персии, использовали водяные часы, другие отмеряли время по отметкам на свечах4. Но даже самые точные устрой- ства могли ошибаться на пятнадцать минут в день5. Для монаха, который хочет определить время молитвы, это не имеет большого значения, если только Господь не ярый поборник пунктуальности. Но для одной обла- сти деятельности, которая становилась все более важной, возможность точно отмерять время имела огромное экономическое значение. Это мореплавание.
<br>По высоте солнца над горизонтом моряки могли определить широту — местоположение с севера на юг. Но долготу, или расположение с востока на запад, им приходилось угадывать. Неправильная оценка могла при- вести — и часто приводила — к тому, что корабли приставали к берегу в сотнях километров от определенного штурманом места. Иногда они в буквальном смысле натыкались на землю и тонули.
<br>Чем здесь могло помочь точное измерение времени? Помните, поче- му время на часах в Эксетере отличалось от времени в удаленном на не- сколько сот километров Лондоне? Полдень там настает на четырнадцать минут позже. Если знать, когда наступает полдень в Гринвичской обсер- ватории в Лондоне или любой другой ориентирной точке, можно на ос- нове наблюдений за солнцем вычислить разницу во времени и понять расстояние. Маятниковые часы Гюйгенса были в шестьдесят раз точнее любого предшествующего устройства, но даже пятнадцать секунд в день за долгое морское плавание складываются в десятки минут, а ведь маят- ник на палубе корабля качается не очень равномерно.
<br>Правители морских государств остро осознавали проблему долготы. Примерно за век до появления изобретения Гюйгенса король Испании учредил награду за решение этой проблемы. Широко известно, что более поздняя награда, предложенная британским правительством, заставила англичанина Джона Гаррисона кропотливо совершенствовать часы и по- лучить в 1700-х годах довольно точное устройство*. Оно отмеряло время с отклонением в пару секунд в день6.
<br>Со времен Гюйгенса и Гаррисона часы становились все точнее. А после того как сдался непримиримый декан Эксетера, весь мир пришел к согла- шению в отношении «правильного времени»: им стали считать всемирное координированное время (Сoordinated Universal Time), или UTC, с различ- ными глобальными часовыми поясами, благодаря которым двенадцать часов дня теперь хотя бы примерно соответствуют высшей точке солнца. В основе UTC — атомные часы, измеряющие колебания энергии электро- нов. Сами Главные часы, которые обслуживает Военно-морская обсерва- тория США на северо-западе Вашингтона, представляют собой комплекс из нескольких часовых механизмов, самый совершенный из которых — четверо «фонтанных» атомных часов, в которых замороженные атомы под- нимаются в воздух и опадают вниз. Если что-то пойдет не так — напри- мер, вошедший в помещение технолог изменит температуру и, возможно, время, — несколько запасных механизмов готовы в любую наносекунду взять работу на себя. Эти сложные методики позволяют достичь точности до секунды каждые 300 миллионов лет7.
<br>Есть ли смысл в такой точности? Ведь утреннюю поездку на работу мы не планируем до миллисекунд. Смысл точных наручных часов всегда был не в практичности, а в престиже. Более века до появления часовых сигна- лов в первых радиопередачах члены лондонского семейства Белвилл за- рабатывали на жизнь, каждое утро устанавливая свои часы по Гринвичу и за умеренную плату «продавая время» по всему городу. Их клиентами в основном являлись торговцы часами, для которых синхронизация свое- го товара по Гринвичу была делом профессиональной чести8.
<br>Кое-где значение имеет даже миллисекунда. Одно из таких мест — рынок ценных бумаг. Можно заработать состояние, воспользовавшись шансом арбитражной сделки за мгновение до конкурентов. Финанси- сты недавно вычислили, что было бы выгодно потратить 300 миллионов долларов на прокладку туннеля между Чикаго и Нью-Йорком, чтобы спрямить оптоволоконные кабели и ускорить таким образом обмен ин- формацией между городами на три миллисекунды. Разумно спросить, так ли уж полезно для общества подобное вложение денег, но стимулы для таких инноваций предельно ясны, и сложно удивляться тому, что люди на них реагируют9.
<br>Точное измерение повсеместно принимаемого времени лежит в осно- ве вычислительных сетей и сетей связи10. Однако, как было с кораблями, а затем с поездами, самое большое влияние атомные часы, наверное, ока- зали на путешествия.
<br>Никому уже не надо находить курс по движению солнца. Благодаря GPS самые примитивные смартфоны определяют местоположение вла- дельца, улавливая сигналы сети спутников. Зная, где на небе должен быть каждый из них в данный момент времени, путем триангуляции сигналов можно определить, где вы находитесь. Эта технология произвела рево- люцию повсюду — от мореплавания до авиации, от разведки местности до туризма. Но для правильной работы спутники должны быть согласова- ны во времени.
<br>На спутниках GPS обычно установлено четверо атомных часов на ос- нове цезия и рубидия. Гюйгенс и Гаррисон могли лишь мечтать о такой точности, но ее все еще не хватает: остается погрешность в пару метров, которая усиливается помехами при прохождении сигнала через ионосфе- ру Земли11. По этой же причине беспилотным автомобилям, кроме GPS, нужны сенсоры: пара метров на шоссе — это разница между ездой в сво- ем ряду и лобовым столкновением.
<br>Тем временем часы продолжают совершенствоваться. Ученые недавно разработали модель, основанную на элементе иттербии. Когда примерно через пять миллиардов лет Солнце умрет и поглотит нашу планету, они отклонятся не более чем на сотую долю секунды12. Как дополнительная точность повлияет на экономику за этот период? Время покажет.`
    const cameraStopPosition = new THREE.Vector3(3.67, 0.97, -1.38)
    const cameraStopQuaternion = new THREE.Quaternion(-0.56, -0.4, -0.36, 0.63)
    const id = markObject(model)
    actionsMap.set(id, {
      leftClick: (params: ActionParams) => {
        descriptionModeAnimation(params, cameraStopPosition, cameraStopQuaternion, { text: descriptionText, position: 'left' })
      },
    })
    objectsMap.set(id, model)
  }, undefined, function (error) {
    console.error('error model', error)
  })
}

const createNavigationMarker = (scene: THREE.Scene) => {
  const group = new THREE.Group()
  const baseGeometry = new THREE.CircleGeometry(0.3, 30)
  const baseMaterial = new THREE.MeshBasicMaterial({
    color: '#ffffff',
    transparent: true,
    opacity: 0.15,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })
  const base = new THREE.Mesh(baseGeometry, baseMaterial)
  const secondaryGeometry = new THREE.CircleGeometry(0.2, 30)
  const secondaryMaterial = new THREE.MeshBasicMaterial({
    color: '#ffffff',
    transparent: true,
    opacity: 0.05,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })
  const secondary = new THREE.Mesh(secondaryGeometry, secondaryMaterial)
  secondary.position.z += 0.01
  group.add(base, secondary)
  group.rotation.copy(new THREE.Euler(Math.PI / -2, 0, 0))
  group.name = 'circle'
  group.visible = false
  scene.add(group)
  return group
}

const initActions = (
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera,
  objectsMap: ObjectsMap,
  actionsMap: ActionsMap,
  orbitControls?: OrbitControls,
) => {
  let isActiveHover = true
  let isActiveRightClick = true
  let isActiveLeftClick = true
  const enableEventHandlers = (value: boolean) => {
    isActiveHover = value
    isActiveRightClick = value
    isActiveLeftClick = value
  }
  const floorMarker = createNavigationMarker(scene)
  const markers = [floorMarker]

  let prevActiveId: string | null = null
  const hover = (event?: MouseEvent) => {
    if (!isActiveHover) {
      return
    }
    event?.preventDefault()
    if (prevActiveId !== null) {
      actionsMap.get(prevActiveId)?.hover?.({ enable: false, markers })
      prevActiveId = null
    }
    raycaster.setFromCamera(mouse, camera)
    const intersected = raycaster.intersectObjects([...objectsMap.values()])
    if (intersected.length) {
      const { point, object } = intersected[0]
      const actions = actionsMap.get(object.userData.id)
      actions?.hover?.({ enable: true, point, markers })
      prevActiveId = object.userData.id
    }
  }
  if (!isMobile()) {
    window.addEventListener('mousemove', _.throttle(hover, 40))
  }

  const rightClick = (event?: MouseEvent) => {
    if (!isActiveRightClick) {
      return
    }
    event?.preventDefault()
    raycaster.setFromCamera(mouse, camera)
    const intersected = raycaster.intersectObjects([...objectsMap.values()])
    if (intersected.length) {
      const { point, object } = intersected[0]
      const actions = actionsMap.get(object.userData.id)
      actions?.rightClick?.({
        camera, point, orbitControls, markers, enableEventHandlers
      })
    }
  }
  window.addEventListener('contextmenu', rightClick)

  const leftClick = (event?: MouseEvent) => {
    if (!isActiveLeftClick) {
      return
    }
    event?.preventDefault()
    raycaster.setFromCamera(mouse, camera)
    const intersected = raycaster.intersectObjects([...objectsMap.values()])
    if (intersected.length) {
      const { point, object } = intersected[0]
      const actions = actionsMap.get(object.userData.id)
      actions?.leftClick?.({
        camera, point, orbitControls, markers, enableEventHandlers
      })
    }
  }
  window.addEventListener('click', leftClick)

  return [hover, leftClick, rightClick]
}

const createLight = (scene: THREE.Scene) => {
  const ambientLight = new THREE.AmbientLight(0xffffff, 2)
  scene.add(ambientLight)

  const pointLight = new THREE.PointLight(0xffffff, 2.5)
  pointLight.castShadow = true
  pointLight.position.set(0, 2.5, 0)
  scene.add(pointLight)

  const directionalLight = new THREE.DirectionalLight(0xffffff, 2.3)
  directionalLight.position.set(1, 2.5, 1)
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

initScene(props)(({ scene, camera, renderer, orbitControls }) => {
  camera.position.copy(positions.start)
  camera.quaternion.copy(quaternions.start)
  orbitControls!.rotateSpeed = -0.5
  orbitControls!.enableZoom = false
  orbitControls!.enablePan = false

  orbitControls!.minPolarAngle = 0
  orbitControls!.maxPolarAngle = Math.PI

  const updateControl = useControl(camera, orbitControls)

  const objectsMap: ObjectsMap = new Map()
  const actionsMap: ActionsMap = new Map()

  createPictureModel(scene, objectsMap, actionsMap)
  createDartBoardModel(scene, objectsMap, actionsMap)
  createPedestalModel(scene, objectsMap)
  createCameraModel(scene, objectsMap, actionsMap)
  createPocketWatchModel(scene, objectsMap, actionsMap)
  createCarpet(scene, objectsMap, actionsMap)
  createWoodFloor(scene)
  createWalls(scene)
  createCeiling(scene)

  createLight(scene)

  const [hover] = initActions(scene, camera, objectsMap, actionsMap, orbitControls)

  let frameCounter = 0
  function animate() {
    requestAnimationFrame(animate)
    renderer.render(scene, camera)

    if (!isMobile()) {
      // because hover should be not only mousemove handler
      if (frameCounter > 20) {
        hover()
        frameCounter = 0
      }
      frameCounter++
    }

    updateControl()
    stats.update()
  }
  animate()
})
