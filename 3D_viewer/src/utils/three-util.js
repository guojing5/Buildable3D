import THREE from './three-wrapper'
import { CSG } from '@enable3d/three-graphics/jsm/csg'
import { Calc } from './calc'
import { Geo } from './geo'
import { Constants } from './constants'

class ThreeUtil {
  static createMeshSource(mesh, anchor, anchorType) {
    return {
      data: mesh,
      origin: anchor,
      type: Constants.TYPE_OBJECT3D,
      units: 'scene',
      anchor: anchorType,
    }
  }

  static createMesh(geometry, material) {
    const mesh = new THREE.Mesh(geometry, material)
    mesh.frustumCulled = false
    return mesh
  }

  static createGroup() {
    return new THREE.Group()
  }

  /**
   * Creates THREE.Mesh
   * @param {GeoJson|Feature|Polygon|THREE.Shape} footprint Footprint or shape object
   * @param {object} anchor (longitude, latitude) Used a origin
   * @param {number} meter Height of extrusion in meters
   * @param {object} materialProps
   * @returns THREE.Mesh
   */
  static createExtrudeMesh(footprint, anchor, meter, materialProps = {}) {
    const geometry = ThreeUtil.createExtrudeGeometry(footprint, anchor, meter)
    if (!geometry) return null
    return ThreeUtil.createMesh(geometry, ThreeUtil.createMaterial(materialProps))
  }

  /**
   * Creates THREE.Mesh as 2D Polygon
   * @param {GeoJson|Feature|Polygon} footprint
   * @param {object} anchor (longitude, latitude)
   * @param {object} materialProps
   * @returns THREE.Mesh
   */
  static createPolygonMesh(footprint, anchor, materialProps = {}) {
    const shape = ThreeUtil.createShape(footprint, anchor)
    if (shape) {
      const divisions = 1
      const geometry = new THREE.ShapeGeometry(shape, divisions)
      geometry.computeBoundingBox()
      return ThreeUtil.createMesh(geometry, ThreeUtil.createMaterial(materialProps))
    }
    return null
  }

  static createLineMesh(footprint, anchor, materialProps = {}) {
    const points = ThreeUtil.createLines(footprint, anchor)
    if (points) {
      const geometry = new THREE.BufferGeometry().setFromPoints(points)
      return new THREE.LineSegments(geometry, ThreeUtil.createLineMaterial(materialProps))
    }
    return null
  }

  static extractEdgesMesh(meshOrGeometry, materialProps = {}) {
    if (!meshOrGeometry) return null
    const geometry = meshOrGeometry.type === 'Mesh' ? meshOrGeometry.geometry : meshOrGeometry
    const edges = new THREE.EdgesGeometry(geometry)
    edges.computeBoundingBox()
    const { texture, opacity, ...restMaterialProps } = materialProps
    if (typeof opacity === 'number' && opacity < 1.0) {
      restMaterialProps.transparent = true
      restMaterialProps.opacity = opacity
    }
    const mesh = new THREE.LineSegments(edges, new THREE.LineBasicMaterial(restMaterialProps))
    mesh.frustumCulled = false
    return mesh
  }

  /**
   * Creates THREE.ExtrudeGeometry
   * @param {GeoJson|Feature|Polygon|THREE.Shape} footprint Footprint or shape object
   * @param {object} anchor (longitude, latitude)
   * @param {number} meter Height of extrusion in meters
   * @returns THREE.ExtrudeGeometry
   */
  static createExtrudeGeometry(footprint, anchor, meter) {
    const shape =
      footprint instanceof THREE.Shape ? footprint : ThreeUtil.createShape(footprint, anchor)
    if (shape) {
      const depth = Calc.meterToScene(meter, anchor)
      const options = { depth: depth, bevelEnabled: false }
      const geometry = new THREE.ExtrudeGeometry(shape, options)
      geometry.computeBoundingBox()
      return geometry
    }
    return null
  }

  static applyEdgesVisibilityToMesh(
    edgesVisibility,
    extrusionMesh,
    materialProps = {},
    userData = null
  ) {
    let obj = null
    if (edgesVisibility === 'visible' || edgesVisibility === 'only') {
      const edgesMesh = ThreeUtil.extractEdgesMesh(extrusionMesh, materialProps)
      if (edgesVisibility === 'visible') {
        if (edgesMesh) {
          obj = new THREE.Group()
          obj.children = []
          obj.add(edgesMesh)
          obj.add(extrusionMesh)
        } else {
          obj = extrusionMesh
        }
      } else {
        // only
        obj = edgesMesh
      }
    } else {
      // none edges
      obj = extrusionMesh
    }
    if (!obj?.userData) obj.userData = {}
    if (obj && userData) {
      obj.userData = {
        ...obj.userData,
        ...userData,
      }
    }
    return obj
  }

  /**
   *
   * @param {string|array} colors A color or array of colors
   * @returns Array of materials
   */
  static createMaterials(materialProps = {}) {
    const materials = ThreeUtil.createMaterial(materialProps)
    if (!materials) return null

    if (Array.isArray(materials)) {
      return materials
    } else {
      return [materials, materials]
    }
  }

  static getTextureMap(url) {
    if (url) {
      try {
        const texture = new THREE.TextureLoader().load(url)
        if (texture) {
          texture.wrapS = THREE.RepeatWrapping
          texture.wrapT = THREE.RepeatWrapping
          texture.repeat.set(2, 2)
          texture.magFilter = THREE.NearestFilter
          return texture
        }
      } catch (err) {
        console.error(err)
      }
      return null
    }
  }

  static createLineMaterial(materialProps = {}) {
    const {
      color,
      width: linewidth,
      cap: linecap,
      join: linejoin,
      dashWidth,
      ...restProps
    } = materialProps

    const options = {}
    if (linecap) options.linecap = linecap
    if (linejoin) options.linejoin = linejoin
    if (typeof dashWidth === 'number') {
      return new THREE.LineDashedMaterial({
        ...restProps,
        color,
        linewidth,
        gapSize: dashWidth,
        dashSize: dashWidth,
        ...options,
      })
    } else {
      return new THREE.LineBasicMaterial({
        ...restProps,
        color,
        linewidth,
        ...options,
      })
    }
  }

  static createMaterial(materialProps = {}) {
    // Default props
    const {
      color: colors,
      texture: textureUrl,
      ...restProps
    } = {
      ...materialProps,
      color: materialProps.color || 'yellow',
      side: materialProps.side || THREE.DoubleSide,
      opacity: materialProps.opacity || 1.0,
    }
    const textureMap = ThreeUtil.getTextureMap(textureUrl)
    if (typeof restProps?.opacity === 'number' && restProps.opacity < 1.0) {
      restProps.transparent = true
    }

    const materials = []
    if (textureMap) {
      const m = new THREE.MeshLambertMaterial({
        map: textureMap,
        ...restProps,
      })
      materials.push(m)
    } else if (Array.isArray(colors)) {
      colors.forEach((c) => {
        materials.push(
          new THREE.MeshLambertMaterial({
            color: new THREE.Color().set(c),
            ...restProps,
          })
        )
      })
    } else {
      const m = new THREE.MeshLambertMaterial({
        color: new THREE.Color().set(colors),
        ...restProps,
      })
      materials.push(m)
    }
    const len = materials.length
    if (len === 1) return materials[0]
    if (len < 1) return null
    return materials
  }

  static applyMaterial(mesh, materialProps = {}) {
    if (mesh && materialProps) {
      const existingMaterial = mesh.material
      mesh.material = ThreeUtil.createMaterial(materialProps)
      ThreeUtil.safeDispose(existingMaterial)
    }
  }

  static createLines(footprint, anchor) {
    const origin = Calc.toScene(anchor)
    const [ox, oy] = [origin.x, origin.y]

    const coordToVector3 = (coord) => {
      const { x, y } = Calc.toScene(coord)
      return new THREE.Vector3(x - ox, y - oy, 0.0)
    }
    const createFromLoop = (loop, isClosed, points) => {
      let prevCoord = null
      loop.forEach((coord, index) => {
        if (index === 0) {
          prevCoord = coordToVector3(coord)
          if (isClosed) {
            // segment
            points.push(coordToVector3(loop[loop.length]))
            points.push(prevCoord)
          } else {
            // skip
          }
        } else {
          // segment
          points.push(prevCoord)
          prevCoord = coordToVector3(coord)
          points.push(prevCoord)
        }
      })
      return points
    }
    const points = []

    Geo.getGeoJson(footprint)?.features.forEach((feature) => {
      const geometry = Geo.getGeometry(feature)
      if (geometry.type === 'Polygon') {
        geometry.coordinates.forEach((loop) => createFromLoop(loop, true, points))
      } else if (geometry.type === 'MultiLineString') {
        geometry.coordinates.forEach((loop) => createFromLoop(loop, false, points))
      } else if (geometry.type === 'LineString') {
        createFromLoop(geometry.coordinates, false, points)
      }
    })

    if (points.length < 2) return null
    return points
  }

  /**
   * Creates THREE.Shape
   * @param {GeoJson|Feature|Polygon} footprint
   * @param {object} anchor (longitude, latitude)
   * @returns THREE.Shape
   */
  static createShape(footprint, anchor) {
    const polygon = Geo.getPolygon(footprint)
    if (!polygon || !polygon.coordinates?.length || !anchor) return null

    const origin = Calc.toScene(anchor)
    const [ox, oy] = [origin.x, origin.y]
    const shape = new THREE.Shape()
    let numPoints = 0
    polygon.coordinates[0].forEach((coord, index) => {
      const { x, y } = Calc.toScene(coord)
      if (index === 0) {
        shape.moveTo(x - ox, y - oy)
      } else {
        shape.lineTo(x - ox, y - oy)
      }
      numPoints++
    })
    if (polygon.coordinates.length > 1) {
      console.warn('Skipping inner loops of polygon in ShapeGeometry creation')
    }

    if (numPoints > 2) {
      return shape
    }
    return null
  }

  /**
   * Creates THREE.Shape
   * @param {number} lengthMeter
   * @param {number} widthMeter
   * @param {object} anchor (longitude, latitude)
   * @returns THREE.Shape
   */
  static createRectangleShape(lengthMeter, widthMeter, anchor) {
    const length = Calc.meterToScene(lengthMeter, anchor)
    const width = Calc.meterToScene(widthMeter, anchor)

    const shape = new THREE.Shape()
    const w2 = width / 2.0
    const l2 = length / 2.0
    shape.moveTo(l2, w2)
    shape.lineTo(-l2, w2)
    shape.lineTo(-l2, -w2)
    shape.lineTo(l2, -w2)
    shape.lineTo(l2, w2)
    return shape
  }

  static createFootprint(shape, anchor) {
    if (!anchor) return null
    const origin = Calc.toScene(anchor)
    const offset = new THREE.Vector2(origin.x, origin.y)

    const divisions = 1
    const coords = shape.getPoints(divisions)?.map((pt) => {
      const g = Calc.fromScene(pt.add(offset))
      return [g.longitude, g.latitude]
    })
    if (coords?.length > 0) {
      return {
        type: 'Polygon',
        coordinates: [coords],
      }
    }
    return null
  }

  static createTranslationMatrix4(axis, meter, anchor) {
    const distance = Calc.meterToScene(meter, anchor)
    const translation = axis.clone().multiplyScalar(distance)
    return new THREE.Matrix4().makeTranslation(translation.x, translation.y, translation.z)
  }

  static createRotationMatrix4(axis, degree) {
    const theta = Calc.degreeToRadian(degree)
    return new THREE.Matrix4().makeRotationAxis(axis, theta)
  }

  static createScaleMatrix4(scaleX = 1.0, scaleY = 1.0, scaleZ = 1.0) {
    return new THREE.Matrix4().makeScale(scaleX, scaleY, scaleZ)
  }

  static reAnchorGeometry(mesh, currentAnchor, newAnchor) {
    const currentAnchorScene = Calc.toScene(currentAnchor)
    const newAnchorScene = Calc.toScene(newAnchor)

    const translation = currentAnchorScene.clone().sub(newAnchorScene)
    const matrix = new THREE.Matrix4().makeTranslation(translation.x, translation.y, translation.z)
    mesh.geometry.applyMatrix4(matrix)
  }

  static placeAtAnchor(object3d, anchor) {
    const position = Calc.toScene(anchor)
    object3d.position.set(position.x, position.y, position.z)
    object3d.updateMatrixWorld()
    return object3d
  }

  static transformAnchor(anchor, matrix4) {
    const point = Calc.toScene(anchor)
    const transPoint = new THREE.Vector3(point.x, point.y, point.z).applyMatrix4(matrix4)

    const transAnchor = Calc.fromScene(transPoint)
    // Update the same object
    anchor.longitude = transAnchor.longitude
    anchor.latitude = transAnchor.latitude

    return anchor
  }

  static transformPolygon(polygon, matrix4) {
    let transPoint = new THREE.Vector3(0, 0, 0)
    polygon.coordinates.forEach((loop) => {
      loop.forEach((coord) => {
        const point = Calc.toScene(coord)
        transPoint = transPoint.set(point.x, point.y, point.z).applyMatrix4(matrix4)
        const transCoord = Calc.fromScene(transPoint)
        coord[0] = transCoord.longitude
        coord[1] = transCoord.latitude
      })
    })
  }

  static booleanUnion(mesh1, mesh2) {
    try {
      if (!mesh1) return mesh2?.clone()
      if (!mesh2) return mesh1?.clone()

      const subtract = CSG.union(mesh1, mesh2)
      // WORKAROUND: Create new geometry and mesh (as CSG uses different three.js)
      const geometry = ThreeUtil._safeCloneBufferGeometry(subtract?.geometry)
      ThreeUtil.safeDispose(subtract)
      return ThreeUtil.createMesh(geometry, new THREE.MeshBasicMaterial())
    } catch (err) {
      console.error(err)
    }
    return null
  }

  static booleanIntersect(mesh1, mesh2) {
    if (!mesh1 || !mesh2) return null
    try {
      const subtract = CSG.intersect(mesh1, mesh2)
      // WORKAROUND: Create new geometry and mesh (as CSG uses different three.js)
      const geometry = ThreeUtil._safeCloneBufferGeometry(subtract?.geometry)
      ThreeUtil.safeDispose(subtract)
      return ThreeUtil.createMesh(geometry, new THREE.MeshBasicMaterial())
    } catch (err) {
      console.error(err)
    }
    return null
  }

  static booleanSubtract(mesh1, mesh2) {
    try {
      if (!mesh2) return mesh1?.clone()
      if (!mesh1) return null

      const subtract = CSG.subtract(mesh1, mesh2)
      // WORKAROUND: Create new geometry and mesh (as CSG uses different three.js)
      const geometry = ThreeUtil._safeCloneBufferGeometry(subtract?.geometry)
      ThreeUtil.safeDispose(subtract)
      return ThreeUtil.createMesh(geometry, new THREE.MeshBasicMaterial())
    } catch (err) {
      console.error(err)
    }
    return null
  }

  static mergeIntoSingleMesh(group, mergeMaterial = false) {
    if (!group) return null
    const sceneTraverse = (obj, callback) => {
      callback(obj)
      obj?.children?.forEach?.((o) => {
        sceneTraverse(o, callback)
      })
    }

    let geometries = []
    let materials = [] // used when mergeMaterial is true

    sceneTraverse(group, (mesh) => {
      if (mesh?.type === 'Mesh') {
        let cloned = null
        if (mesh.geometry.index) {
          cloned = mesh.geometry.toNonIndexed()
        } else {
          cloned = mesh.geometry.clone()
        }
        cloned.applyMatrix4(mesh.matrixWorld)
        geometries.push(cloned)
        materials.push(mesh.material)
      }
    })

    let mesh = null
    if (geometries.length < 2) {
      mesh = new THREE.Mesh(
        geometries[0],
        mergeMaterial ? materials[0] : ThreeUtil.createMaterial({})
      )
    } else {
      const mergedGeometry = THREE.BufferGeometryUtils.mergeBufferGeometries(
        geometries,
        mergeMaterial
      )
      mesh = new THREE.Mesh(
        mergedGeometry,
        mergeMaterial ? materials : ThreeUtil.createMaterial({})
      )
    }
    geometries.forEach((g) => ThreeUtil.safeDispose(g))
    return mesh
  }

  static isBooleanIntersect(group1, group2) {
    const temp1 = ThreeUtil.mergeIntoSingleMesh(group1)
    const temp2 = ThreeUtil.mergeIntoSingleMesh(group2)

    temp1.position.set(group1.position.x, group1.position.y, group1.position.z)
    temp1.updateMatrixWorld()

    temp2.position.set(group2.position.x, group2.position.y, group2.position.z)
    temp2.updateMatrixWorld()

    const center = new THREE.Box3()
      .setFromObject(temp1)
      .expandByObject(temp2)
      .getCenter(new THREE.Vector3())
    temp1.position.sub(center)
    temp1.updateMatrixWorld()
    temp2.position.sub(center)
    temp2.updateMatrixWorld()

    const intersect = ThreeUtil.booleanIntersect(temp1, temp2)
    let result = false
    if (intersect?.geometry?.attributes?.position?.array?.length > 0) {
      result = true
    }
    ThreeUtil.safeDispose(temp1)
    ThreeUtil.safeDispose(temp2)
    return result
  }

  static _safeCloneBufferGeometry(geometry, clonedGeometry = null) {
    let shouldDispose = false
    if (geometry?.type === 'Geometry') {
      geometry = geometry.toBufferGeometry()
      shouldDispose = true
    }
    const attributes = geometry?.attributes
    if (!attributes) return null

    if (!clonedGeometry) clonedGeometry = new THREE.BufferGeometry()
    Object.keys(attributes).forEach((key) => {
      const att = attributes[key]
      const clonedAtt = new THREE.BufferAttribute(new Float32Array(att.array), att.itemSize)
      if (key === 'index') clonedGeometry.setIndex(clonedAtt)
      else clonedGeometry.setAttribute(key, clonedAtt)
    })

    if (shouldDispose) geometry.dispose()
    return clonedGeometry
  }

  static _safeCloneMesh(mesh) {
    if (!mesh) return null
    const cloned = mesh.clone()
    const geometry = cloned.geometry
    if (geometry.type === 'Geometry') {
      cloned.geometry = ThreeUtil._safeCloneBufferGeometry(geometry)
      ThreeUtil.safeDispose(geometry)
    }
    return cloned
  }

  static safeDispose(object) {
    if (!object) return
    try {
      if (object.type === 'Mesh') {
        object.geometry?.dispose()
        object.material?.dispose()
      } else if (object.dispose) {
        object.dispose()
      }
    } catch (err) {
      console.error(err)
    }
  }

  static getObjectsByName(tb, name) {
    const named = []
    tb?.world?.children?.forEach((child) => {
      if (child.name === name) named.push(child)
    })
    return named
  }
}

export { ThreeUtil }
