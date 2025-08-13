import { Constants } from './constants'
import { Model } from '../model/model'
import { Geo } from './geo'
import { Calc } from './calc'
import { ThreeUtil } from './three-util'
import { EditUpdate } from './edit-update'
import { DebugUtil } from './debug-util'
import { Anchor } from './anchor'

class AutoGenerate {
  constructor(sources) {
    this.sources = sources
    const result = this._saveGenerate(null, () => this._computeFront2RearDirectionScene())
    this.f2rDirScene = result?.[0]
    this.bearing = result?.[1]

    const anchorType = isNaN(this.bearing) ? 'bottom-left' : Anchor.toAnchorType(this.bearing)
    this.canonical = {
      f2rDirScene: this.f2rDirScene,
      bearing: this.bearing,
      anchorType: anchorType,
    }
    console.debug('canonical', this.canonical)
  }

  generate = () => {
    if (!this.sources) return null

    let result = null
    result = this._saveGenerate(result, () => this.generateSimplifiedBuildable()) // Dependent on buildable0/1/2, mainBuilding, orientationFront
    result = this._saveGenerate(result, () => this.generateSetbacks()) // Dependent on mainBuilding, buildable2, orientationLeft/Right/Front/Rear
    result = this._saveGenerate(result, () => this.generateAngularPlane()) // Dependent on buildable1, orientationFront and mainBuilding
    result = this._saveGenerate(result, () => this.generateMaxConstraintBox()) // Dependent on buildable0/1/2, orientationFront, mainBuilding
    result = this._saveGenerate(result, () => this.generateMaxSuite()) // max 10 m x 8 m and confined & placed within buildable0/buildable1/buildable2 and obeys maxConstraintBox

    if (this.f2rDirScene || this.bearing) {
      if (!result) result = {}
      result.canonical = this.canonical
    }
    return result
  }

  generateSimplifiedBuildable = () => {
    const prefix = 'buildable'
    const suffix = Constants.OVERRIDE_BUILDABLE ? '' : Constants.SIMPLIFIED_BUILDABLE_SUFFIX
    const mainBuildingGeom = this.sources.mainBuilding?.rawProps?.footprint

    const getBuildableSimple = (key, buildable, refGeom, distance, result) => {
      // required for error cases, when overriding
      result[key] = null
      const buildableGeom = buildable?.rawProps?.footprint

      const upperLimit = null
      const [box, dimension] = EditUpdate._createPlaceRectangle(
        buildableGeom,
        this.canonical,
        upperLimit
      )
      if (!box) return null

      // As buildable can have skewed corners and so can misplace the footprint.
      // Following is needed to ensure footprint is correctly distant from the main building
      EditUpdate._enforceGapBetween(distance, box, refGeom, this.canonical)

      const footprint = Geo.booleanIntersect(box, buildableGeom)
      if (!footprint) return null
      const footprintCenter = Geo.getAnchor(footprint, 'center')
      result[key] = {
        ...buildable,
        id: Model.generateItemId(key),
        data: Geo.getGeoJson(footprint),
        rawProps: {
          footprint: footprint,
          footprintCenter: footprintCenter,
          dimension: [...dimension],
          isSimplified: true,
        },
        derivedProps: {
          area: Geo.area(footprint),
          perimeter: Geo.length(footprint),
          length: dimension[1],
          width: dimension[0],
        },
      }

      // Debug
      DebugUtil.addPolygon(key, buildableGeom)
      DebugUtil.addPolygon(key + '-simplified', footprint)
    }

    const result = {}
    Model.MODES.forEach((mode) => {
      const distance = EditUpdate.getMinimumDistance(mode)
      getBuildableSimple(
        prefix + mode + suffix,
        this.sources['buildable' + mode],
        mainBuildingGeom,
        distance,
        result
      )
    })

    return result
  }

  generateAngularPlane = () => {
    const mainBuildingGeom = this.sources?.mainBuilding?.data
    const twoSqrt = Math.sqrt(2.0)
    const sizeLimit = [
      null, // max
      twoSqrt *
        (Constants.BYELAWS_DISTANCE_MAX_SUITE_MAX_HEIGHT_FAR -
          Constants.BYELAWS_DISTANCE_MAX_SUITE_MAX_HEIGHT_NEAR),
    ]

    const { color, opacity, texture, ...restProps } = Model.getDisplayProperties('angularPlane')
    const depth = 2 / 1000 // millimeter
    const materialProps = {
      color,
      opacity,
      texture,
      depth,
    }

    const depthAdjustment = -depth / (2.0 * twoSqrt)
    const lOffsetMeter = Constants.BYELAWS_DISTANCE_MAX_SUITE1_MAIN_BULDING + depthAdjustment

    const [mesh, dimension, anchor, anchorType, meshFootprint] =
      this._computeFootprintMeshNearPlot(
        mainBuildingGeom,
        sizeLimit,
        materialProps,
        lOffsetMeter,
        45
      ) || []
    if (!mesh || !anchor) return null
    anchor.altitude = Constants.BYELAWS_DISTANCE_ANGULAR_PLANE_MAX_HEIGHT + depthAdjustment

    const key = 'angularPlane'
    const result = {}
    result[key] = {
      id: Model.generateItemId(key),
      displayType: 'mesh',
      visible: true,
      ...restProps,
      ...ThreeUtil.createMeshSource(mesh, anchor, anchorType),
      derivedProps: {
        width: dimension[0],
        length: dimension[1] / twoSqrt,
        height: dimension[1] / twoSqrt,
        altitude: anchor.altitude,
      },
    }

    // Debug
    DebugUtil.addPolygon(key, meshFootprint)
    DebugUtil.addAnchor(key, anchor)

    return result
  }

  generateMaxConstraintBox = () => {
    // Angular plane
    const lOffsetMeter = Constants.BYELAWS_DISTANCE_ANGULAR_PLANE_MAIN_BUILDING
    const mainBuildingGeom = this.sources.mainBuilding?.data
    // eslint-disable-next-line no-unused-vars
    const [angularPlane, _dim, _anchorAp, anchorType, _rectApFootprint, rectApAnchor] =
      this._computeFootprintMeshNearPlot(mainBuildingGeom, null, {}, lOffsetMeter, 45, false) || []
    if (!angularPlane || !rectApAnchor || !anchorType) return null

    // Anchor for placing on map
    const anchor = Geo.getAnchor(this._getSimplifiedBuildable(0)?.rawProps?.footprint, anchorType)
    if (!anchor) return null

    let debugMesh = null
    const updateDebugMesh = (obj, anc) => {
      debugMesh = {
        obj: ThreeUtil._safeCloneMesh(obj),
        anchor: anc,
      }
    }
    if (false) updateDebugMesh(angularPlane, _anchorAp)

    const getMesh = (which, anchor, unionfp) => {
      const constraintSource = this._getSimplifiedBuildable(which)
      const footprint = constraintSource?.rawProps?.footprint
      const height = EditUpdate.getMaximumHeight(which)

      if (!footprint || !(height > 0)) return null

      const mesh = ThreeUtil.createExtrudeMesh(footprint, anchor, height)

      // Create union of footprint
      if (unionfp) {
        const u = Geo.booleanUnion(unionfp, footprint)
        Object.keys(u).forEach((k) => (unionfp[k] = u[k]))
      } else {
        unionfp = { ...footprint }
      }

      return [mesh, unionfp]
    }

    // NOTE: use consistent anchor for extrusion (same as used for creating/rotating the angular plane)
    const [mesh0, superFootprint] = getMesh(0, rectApAnchor) || []
    const [mesh1] = getMesh(1, rectApAnchor, superFootprint) || []
    const [mesh2] = getMesh(2, rectApAnchor, superFootprint) || []

    // mesh0 and mesh2 portion should be retained
    const union02 = ThreeUtil.booleanUnion(mesh0, mesh2)

    // Prepare angular wedge portion (above the angular plane)
    const subtract0 = ThreeUtil.booleanSubtract(mesh1, angularPlane)
    if (false)
      updateDebugMesh(subtract0, {
        ...anchor,
        altitude: Constants.BYELAWS_DISTANCE_ANGULAR_PLANE_MAX_HEIGHT,
      })

    // Ensure that angular wedge does not chop any of mesh0 and mesh2 portions in subsquent subtract
    const subtract1 = ThreeUtil.booleanSubtract(subtract0, union02)
    if (false)
      updateDebugMesh(subtract1, {
        ...anchor,
        altitude: Constants.BYELAWS_DISTANCE_ANGULAR_PLANE_MAX_HEIGHT,
      })

    // Create final constraint mesh
    const union012 = ThreeUtil.booleanUnion(union02, mesh1)
    const constraintMesh = ThreeUtil.booleanSubtract(union012, subtract1)

    // Retain constraintMesh and dispose others
    ThreeUtil.safeDispose(angularPlane)
    ThreeUtil.safeDispose(mesh0)
    ThreeUtil.safeDispose(mesh1)
    ThreeUtil.safeDispose(mesh2)
    ThreeUtil.safeDispose(union02)
    ThreeUtil.safeDispose(union012)
    ThreeUtil.safeDispose(subtract0)
    ThreeUtil.safeDispose(subtract1)

    if (!constraintMesh) return null

    // Reanchor the underlying geometry - this is needed for boolean operation at maxSuite computation work
    ThreeUtil.reAnchorGeometry(constraintMesh, rectApAnchor, anchor)

    const key = 'maxConstraintBox'
    const { color, opacity, ...restProps } = Model.getDisplayProperties(key)
    ThreeUtil.applyMaterial(constraintMesh, {
      color,
      opacity,
    })

    const result = {}
    result[key] = {
      id: Model.generateItemId(key),
      displayType: 'mesh',
      visible: true,
      ...restProps,
      color: 'red', // for edges
      ...ThreeUtil.createMeshSource(constraintMesh, anchor, anchorType),
    }
    result[key].rawProps = {
      ...result[key].rawProps,
      footprint: superFootprint?.geometry || superFootprint,
      footprintCenter: Geo.getAnchor(superFootprint, 'center'),
    }

    // Debug
    DebugUtil.addPolygon(key, superFootprint)
    DebugUtil.addAnchor(key, anchor)
    if (debugMesh) result.debugMesh = debugMesh

    return result
  }

  generateMaxSuite = () => {
    // max 10 m x 8 m
    // If plot is smaller then confined by plot
    // When adu is not previewed - plot is buildable0's footprint
    // When adu is previewed - plot is buildable0/1/2's footprint based on the active adu
    // When maxSuite would have FIXED height of 4 m when it's 5 m to 7.5 closer from main building
    // Otherwise it may have angular wedge and maximum height of 6 m based on the shape of maxConstraintBox

    let result = {}

    const maxConstraintBoxSource = this.sources.maxConstraintBox
    const mainBuildingGeom = this.sources.mainBuilding?.data

    Model.MODES.forEach((mode) => {
      const rawProps = this._getSimplifiedBuildable(mode)?.rawProps
      if (!rawProps?.footprint || typeof this.bearing !== 'number') return null

      // No constraint for '2'
      const constraint = mode !== 2 ? maxConstraintBoxSource : null

      result = {
        ...result,
        ...EditUpdate.computeMaxSuite(
          mode,
          rawProps.footprint,
          this.canonical,
          constraint,
          mainBuildingGeom
        ),
      }
    })

    return result
  }

  generateSetbacks = () => {
    const getSetback = (key, source, mbFootprint, result) => {
      if (!source || !mbFootprint) return
      const footprint = source.data
      if (!footprint) return

      const feature = Geo.computeSeparation(footprint, mbFootprint)
      const distance = feature?.properties?.distance
      if (!feature) return

      const start = feature.geometry.coordinates[0]
      const end = feature.geometry.coordinates[1]
      const offset = [end[0] - start[0], end[1] - start[1]]
      const lineCoords = Geo.getGeometry(footprint).coordinates.map((coord) => [...coord])
      const data = Geo.offsetFeature(
        Geo.getFeature({
          type: 'LineString',
          coordinates: lineCoords,
        }),
        offset
      )
      if (!data) return

      key = 'setback' + key
      result[key] = {
        ...source,
        data: data,
        id: Model.generateItemId(key),
        ...Model.getDisplayProperties(key),
        derivedProps: {
          gap: distance,
        },
      }
    }

    const result = {}
    const sources = this.sources
    const array = ['Left', 'Right', 'Front', 'Rear']
    const snapTo = ['mainBuilding', 'mainBuilding', 'mainBuilding', 'buildable2']
    array.forEach((key, index) => {
      const mbFootprint = this.sources[snapTo[index]]?.data
      getSetback(key, sources['orientation' + key], mbFootprint, result)
    })
    return result
  }

  _saveGenerate = (result, generator) => {
    let source = null
    try {
      source = generator()
    } catch (err) {
      console.error(err)
    }
    if (!source) return result
    this.sources = {
      ...this.sources,
      ...source,
    }
    if (!result) result = {}
    return {
      ...result,
      ...source,
    }
  }

  _computeFootprintNearPlot = (plot, sizeLimit = null, offsetMeter = 0) => {
    const footprint = this.sources?.parcel?.rawProps?.footprint
    const frontLineGeom = this.sources.orientationFront?.data
    if (!footprint || !frontLineGeom || !plot || !this.f2rDirScene) return null

    const feature = EditUpdate._computeSeparationFarF2R(frontLineGeom, plot, this.f2rDirScene)
    if (!feature) return null
    const lOffsetMeter = feature.properties.distance + offsetMeter // in meters

    const [output, dimension, anchor, anchorType] =
      EditUpdate.computeFootprintOnPlot(footprint, this.canonical, sizeLimit, lOffsetMeter) || []

    return [output, dimension, anchor, anchorType]
  }

  _computeFootprintMeshNearPlot = (
    plot,
    sizeLimit = null,
    materialProps = {},
    offsetMeter = 0,
    degrees = 0,
    adhereToPlotShape = false
  ) => {
    const footprint = this.sources?.parcel?.rawProps?.footprint
    const frontLineGeom = this.sources.orientationFront?.data
    if (!footprint || !frontLineGeom || !plot || !this.f2rDirScene) return null

    const feature = EditUpdate._computeSeparationFarF2R(frontLineGeom, plot, this.f2rDirScene)
    if (!feature) return null
    const lOffsetMeter = feature.properties.distance + offsetMeter // in meters

    return (
      EditUpdate.computeFootprintMeshOnPlot(
        footprint,
        this.canonical,
        sizeLimit,
        materialProps,
        lOffsetMeter,
        degrees,
        frontLineGeom,
        adhereToPlotShape
      ) || []
    )
  }

  _getSimplifiedBuildable = (which) => {
    return EditUpdate.getSimplifiedBuildable(this.sources, which)
  }

  _computeFront2RearDirectionScene = () => {
    // Heuristic to assess front to rear direction

    const leftDir = Calc.toAxisScene(this.sources.orientationLeft?.data?.coordinates)
    const rightDir = Calc.toAxisScene(this.sources.orientationRight?.data?.coordinates)
    let axis = null
    if (leftDir || rightDir) {
      axis = Calc.averageParallelAxis(leftDir, rightDir)
    }
    const frontMid = Calc.toMidPointScene(this.sources.orientationFront?.data?.coordinates)
    const rearMid = Calc.toMidPointScene(this.sources.orientationRear?.data?.coordinates)
    const dir = frontMid && rearMid ? rearMid.sub(frontMid).normalize() : null
    if (axis && dir) {
      const isParallelOrAnti = Calc.isParallelOrAntiParallel(axis, dir)
      if (!isParallelOrAnti) axis.multiplyScalar(-1.0)
    }

    // Compute bearing also
    let bearing = null
    if (axis && frontMid) {
      const diff = 5
      const rear = axis.clone().multiplyScalar(diff).add(frontMid)
      const f = Calc.fromScene(frontMid)
      const b = Calc.fromScene(rear)
      // Angle of front from North
      bearing = Geo.bearing([b.longitude, b.latitude], [f.longitude, f.latitude])

      // Debug
      DebugUtil.addAnchor('front-mid', f)
      DebugUtil.addAnchor('rear-on-axis', b)
    }
    return [axis, bearing]
  }
}

export { AutoGenerate }
