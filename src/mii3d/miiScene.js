import {
  AmbientLight, AnimationMixer, Color, DirectionalLight, Group, MathUtils, PerspectiveCamera,
  Euler, Quaternion, Scene, Vector3, WebGLRenderer,
} from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { clone as cloneSkinned } from 'three/examples/jsm/utils/SkeletonUtils.js'
import { miiGLB } from '../data/mii'
import { POSES } from './poses'

// A small three.js Mii: the renderer's glTF head on Nintendo's rigged Mii body (the service
// only serves heads; the body is MiiJS's miiMaleBody.glb, hosted in public/wii/models).
// The body plays its own idle clip; the head is a separate group that follows the neck bone
// so it can look at the cursor. Body units are ~11 tall to the neck, head units (FFL) ~90.
const SHIRT = { light: '#2f55b8', dark: '#6f93ea' } // the shirt follows the site theme
const PANTS = '#74767c'
// Proportions follow WheelWizard's renderer (GPL-3.0, TeamWheelWizard/WheelWizard,
// MiiBodyModel.cs): the head mesh sits at the neck bone unscaled while the body is 7x its
// glTF units, stretched by the Mii's own build/height (studio data bytes 2 and 30).
const HEAD_SCALE = 1 / 7
const BUILD = 38
const HEIGHT = 112
const bx = (BUILD * (HEIGHT * 0.003671875 + 0.4)) / 128 + HEIGHT * 0.001796875 + 0.4
const BODY_SCALE = new Vector3(bx, HEIGHT * 0.006015625 + 0.5, bx)
const FRAME = { top: 25.5, bottom: -0.5 } // world y range kept in view

const loader = new GLTFLoader()
const heads = new Map() // expression -> Promise<Group>
function loadHead(expression) {
  if (!heads.has(expression)) {
    heads.set(expression, loader.loadAsync(miiGLB(expression)).then(gltf => {
      gltf.scene.traverse(o => {
        if (!o.isMesh) return
        // glTF defaults to fully metallic, which renders black without an environment map.
        o.material.metalness = 0
        o.material.roughness = 0.85
      })
      return gltf.scene
    }).catch(err => { heads.delete(expression); throw err }))
  }
  return heads.get(expression)
}

let bodyPromise
const loadBody = () => bodyPromise ??= loader
  .loadAsync(`${import.meta.env.BASE_URL}wii/models/miiMaleBody.glb`)
  .catch(err => { bodyPromise = undefined; throw err })

const AXIS_X = new Vector3(1, 0, 0)
const BONES = ['aL', 'aR', 'lL', 'lR', 'chest']
const AXES = ['x', 'y', 'z']
const SCALARS = ['rootY', 'rootRot', 'headX', 'headY', 'headZ']
const ZERO = {}
const euler = new Euler()
const damp = (cur, target, rate, dt) => MathUtils.damp(cur, target, rate, dt)

export function createMiiScene(canvas, { calm = false } = {}) {
  const renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
  const scene = new Scene()
  scene.add(new AmbientLight(0xffffff, 1.5))
  const sun = new DirectionalLight(0xffffff, 1.6)
  sun.position.set(-3, 8, 10)
  scene.add(sun)

  const root = new Group()
  scene.add(root)
  const head = new Group()
  head.scale.setScalar(HEAD_SCALE)
  root.add(head)
  const face = new Group()
  head.add(face)

  const camera = new PerspectiveCamera(18)
  const span = FRAME.top - FRAME.bottom
  camera.position.set(0, (FRAME.top + FRAME.bottom) / 2, span / 2 / Math.tan(MathUtils.degToRad(9)))

  let mixer
  let neck
  let limbs = [] // [bone, sign]: thighs and arms swung on top of the idle clip
  let bones = {} // arms, thighs and chest that poses move
  const shirts = []
  const tint = () => shirts.forEach(m => m.color.set(s.dark ? SHIRT.dark : SHIRT.light))
  let stride = 0 // 0 standing .. 1 full walk
  const s = { look: { x: 0, y: 0 }, walkDir: 0, asleep: false, expression: 'normal', pose: null, dark: false }
  let poseT = 0
  let facing = 0
  const aim = { x: 0, y: 0 }
  const cur = {} // smoothed pose offsets, see poses.js
  let phase = 0
  let run = true
  let raf

  const bodyReady = loadBody().then(gltf => {
    const rig = cloneSkinned(gltf.scene)
    rig.traverse(o => {
      if (!o.isMesh) return
      o.material = o.material.clone()
      o.material.vertexColors = false
      o.material.metalness = 0
      o.material.color = new Color(o.name.includes('pants') ? PANTS : SHIRT.light)
      if (!o.name.includes('pants')) shirts.push(o.material)
      o.frustumCulled = false
    })
    rig.scale.copy(BODY_SCALE)
    root.add(rig)
    neck = rig.getObjectByName('head')
    limbs = [['foot_l1', 1], ['foot_r1', -1], ['arm_l1', -0.5], ['arm_r1', 0.5]]
      .map(([n, k]) => [rig.getObjectByName(n), k])
    bones = {
      aL: rig.getObjectByName('arm_l1'), aR: rig.getObjectByName('arm_r1'),
      lL: rig.getObjectByName('foot_l1'), lR: rig.getObjectByName('foot_r1'),
      chest: rig.getObjectByName('chest'),
    }
    mixer = new AnimationMixer(rig)
    mixer.clipAction(gltf.animations[0]).play()
    mixer.update(0)
    tint()
  })

  function setSize() {
    const { clientWidth: w, clientHeight: h } = canvas
    if (!w || !h) return
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
  }
  const ro = new ResizeObserver(setSize)
  ro.observe(canvas)
  setSize()

  let loadedFor
  async function showExpression(expression) {
    try {
      const src = await loadHead(expression)
      if (s.expression !== expression || loadedFor === expression) return
      face.clear()
      face.add(src.clone(true))
      loadedFor = expression
    } catch { /* keep the old face */ }
  }

  const v = new Vector3()
  let lastTick = performance.now()
  function frame(now) {
    raf = requestAnimationFrame(frame)
    const dt = Math.min(0.05, (now - lastTick) / 1000)
    lastTick = now
    const moving = s.walkDir !== 0 && !calm
    if (moving) phase += dt * 9
    const look = calm ? { x: 0, y: 0 } : s.look

    if (mixer && !calm) mixer.update(dt * (s.asleep ? 0.4 : 1))
    facing = damp(facing, moving ? s.walkDir * 0.9 : 0, 6, dt)
    stride = damp(stride, moving ? 1 : 0, 10, dt)
    const swing = new Quaternion()
    for (const [bone, k] of limbs) {
      bone.quaternion.premultiply(swing.setFromAxisAngle(AXIS_X, Math.sin(phase) * stride * 0.6 * k))
    }

    // Pose offsets: ease every channel toward what the active pose asks for (0 when none).
    poseT += dt
    const want = !calm && s.pose && !s.asleep && POSES[s.pose] ? POSES[s.pose](poseT) : {}
    for (const name of BONES) {
      const w = want[name] ?? ZERO
      const c = cur[name] ??= { x: 0, y: 0, z: 0 }
      for (const k of AXES) c[k] = damp(c[k], w[k] ?? 0, 18, dt)
      if (bones[name] && (c.x || c.y || c.z)) {
        bones[name].quaternion.premultiply(swing.setFromEuler(euler.set(c.x, c.y, c.z)))
      }
    }
    for (const k of SCALARS) cur[k] = damp(cur[k] ?? 0, want[k] ?? 0, 14, dt)
    root.rotation.y = facing + cur.rootRot + (want.spin ?? 0)
    root.position.y = (moving ? Math.abs(Math.sin(phase)) * 0.25 : 0) + cur.rootY

    // Facing where it walks, the head looks ahead instead of at the cursor.
    aim.y = damp(aim.y, s.asleep || moving ? 0 : look.x * 0.75, 8, dt)
    aim.x = damp(aim.x, s.asleep ? 0.45 : look.y * 0.35, 8, dt)
    head.rotation.set(aim.x + cur.headX + (cur.chest?.x ?? 0), aim.y + cur.headY, cur.headZ)
    if (neck) {
      root.updateMatrixWorld(true)
      neck.getWorldPosition(v)
      head.position.copy(root.worldToLocal(v))
    }
    renderer.render(scene, camera)
  }
  raf = requestAnimationFrame(frame)

  const onVis = () => {
    if (document.hidden) { cancelAnimationFrame(raf); run = false } else if (!run) {
      run = true; lastTick = performance.now(); raf = requestAnimationFrame(frame)
    }
  }
  document.addEventListener('visibilitychange', onVis)

  return {
    ready: Promise.all([bodyReady, loadHead('normal')]).then(() => showExpression(s.expression)),
    set(next) {
      if (next.pose !== undefined && next.pose !== s.pose) poseT = 0
      Object.assign(s, next)
      if (next.dark !== undefined) tint()
      if (next.expression) showExpression(next.expression)
    },
    dispose() {
      cancelAnimationFrame(raf)
      document.removeEventListener('visibilitychange', onVis)
      ro.disconnect()
      renderer.dispose()
    },
  }
}
