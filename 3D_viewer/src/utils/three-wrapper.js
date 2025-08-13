// import * as THREE from 'three'

import 'threebox-plugin/dist/threebox'
import { BufferGeometryUtils } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

const THREE = window?.THREE
THREE.BufferGeometryUtils = BufferGeometryUtils

export default THREE
