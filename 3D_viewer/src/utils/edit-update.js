import { Constants } from './constants'
import { Model } from '../model/model'
import { Geo } from './geo'
import { Calc } from './calc'
import { ThreeUtil } from './three-util'
import { Assets } from '../assets'
import { MapStore } from '../stores/map.store'
import { Map } from '../components/mapbox/map.component'
import { MapUtil } from './map-util'
import { DragUpdate } from './drag-update'
import { DebugUtil } from './debug-util'
import { Anchor } from './anchor'

class EditUpdate {
  static getActiveMode() {
    return MapStore.useStore.getState().sources.mode || 0
  }

  static getVisibility(key) {
    if (!key) return
    const layerId = Model.generateLayerId(key)
    return MapUtil.getLayerVisibility(Map.ref?.current, layerId)
  }

  static setVisibility(key, value) {
    if (!key) return
    const layerId = Model.generateLayerId(key)
    MapUtil.toggleLayer(Map.ref?.current, layerId, value)

    MapStore.useStore.getState().setDirtyOnVisibilityChange(true)
    setTimeout(() => MapStore.useStore.getState().setDirtyOnVisibilityChange(false), 100)
  }

  static setVisibilityMulti(key, value) {
    if (!key) return
    const mode = EditUpdate.getActiveMode()
    Model.MODES.forEach((m) => {
      const visible = m === mode ? value : false
      EditUpdate.setVisibility(key + m, visible)
    })
  }

  static updateVisibilityMultiForMode(key, mode) {
    const previousVisibility = Model.MODES.map((m) => EditUpdate.getVisibility(key + m)).reduce(
      (agg, cur) => agg || cur
    )
    Model.MODES.forEach((m) => {
      const visible = m === mode ? previousVisibility : false
      EditUpdate.setVisibility(key + m, visible)
    })
  }

  static retainPreviousVisibility(key) {
    const previousVisibility = EditUpdate.getVisibility(key)
    setTimeout(() => EditUpdate.setVisibility(key, previousVisibility), 100)
  }

  static updateMode(mode) {
    const existingAduId = MapStore.useStore.getState().sources?.selectedAduModel
    if (!existingAduId) EditUpdate.justUpdateMode(mode)
    else EditUpdate.updateModeWhenPreviewing(mode, existingAduId)
  }
  static justUpdateMode(mode) {
    if (mode === 0 || mode === 1 || mode === 2) {
      // Workaround for dynamic objects visibility
      EditUpdate.retainPreviousVisibility('landscaping')
      EditUpdate.retainPreviousVisibility('landscapingRear')
      EditUpdate.retainPreviousVisibility('landscapingHardRear')
      EditUpdate.retainPreviousVisibility('separationLine')

      // 'maxAdu',
      const ids = ['buildable', 'maxSuite']
      ids.forEach((key) => EditUpdate.updateVisibilityMultiForMode(key, mode))

      MapStore.useStore.getState().setActiveMode(mode)
    }
  }
  static updateModeWhenPreviewing(mode, existingAduId) {
    const requiredModeForAdu = EditUpdate.getModeFor(existingAduId)
    if (mode < requiredModeForAdu) return // Not permitted by bye-laws

    // unload
    EditUpdate.setVisibility(existingAduId, false)
    MapStore.useStore.getState().selectAduModel(null)

    // set mode
    EditUpdate.justUpdateMode(mode)

    // reload
    MapStore.useStore.getState().selectAduModel(existingAduId)
  }

  static setInitialVisibility(key, value) {
    Model.setDisplayProperties(key, {
      visible: value,
    })
  }

  static setInitialVisibilityMulti(key, value) {
    const mode = 0
    Model.MODES.forEach((m) => {
      const visible = m === mode ? value : false
      EditUpdate.setInitialVisibility(key + m, visible)
    })
  }

  static updateStateForPreview(selectedAduId) {
    const loadNewAdu = (aduId) => {
      if (!aduId) return

      // When user is selected the mode - it's would not allowed to change automatically on preview adu
      if (Constants.BYELAWS_PREVIEW_ADU_OVERRIDE_MODE) {
        const mode = EditUpdate.getModeFor(aduId)
        EditUpdate.justUpdateMode(mode)
      }
      MapStore.useStore.getState().selectAduModel(aduId)
    }
    const unLoadExistingAdu = (aduId) => {
      if (aduId) EditUpdate.setVisibility(aduId, false)
      MapStore.useStore.getState().selectAduModel(null)
    }
    // Firstly unload
    const existingAduId = MapStore.useStore.getState().sources?.selectedAduModel
    if (selectedAduId !== existingAduId) unLoadExistingAdu(existingAduId)

    if (selectedAduId === false) {
      // Reset the mode to default '0'
      if (Constants.BYELAWS_PREVIEW_ADU_OVERRIDE_MODE) {
        EditUpdate.justUpdateMode(0)
      }
    } else {
      // Switch on the preview of ADU
      loadNewAdu(selectedAduId)
    }
  }

  static getModeFor(selectedAduId) {
    if (!selectedAduId) return 0
    const aduModel = Assets.ADU[selectedAduId]
    if (!aduModel) return 0

    const { height, wedge, defaultSeparationDistance } = aduModel
    let mode = 0
    if (typeof defaultSeparationDistance === 'number') {
      if (defaultSeparationDistance === 9.5) mode = 2
      else if (defaultSeparationDistance === 7.5) mode = 1
    } else if (height <= Constants.BYELAWS_DISTANCE_MAX_SUITE_MAX_HEIGHT_NEAR) {
      mode = 0
    } else if (wedge) {
      mode = 1
    } else {
      // no wedge
      mode = 2
    }
    return mode
  }

  /**
   * Returns minimum distance (as required by bye-laws) between main building and maxSuite/Adu
   * @param {number} which 0 | 1 | 2
   * @returns Distance in meter
   */
  static getMinimumDistance(which) {
    switch (which) {
      case 1:
        return Constants.BYELAWS_DISTANCE_MAX_SUITE1_MAIN_BULDING
      case 2:
        return Constants.BYELAWS_DISTANCE_MAX_SUITE2_MAIN_BULDING
      case 0:
      default:
        return Constants.BYELAWS_DISTANCE_MAX_SUITE0_MAIN_BULDING
    }
  }
  /**
   * Returns maximum allowed height of maxSuite/Adu
   * @param {number} which 0 | 1 | 2
   * @returns Height in meter
   */
  static getMaximumHeight(which) {
    switch (which) {
      case 1:
      case 2:
        return Constants.BYELAWS_DISTANCE_MAX_SUITE_MAX_HEIGHT_FAR
      case 0:
      default:
        return Constants.BYELAWS_DISTANCE_MAX_SUITE_MAX_HEIGHT_NEAR
    }
  }

  static getLandscapingWidth(frontLineWidth) {
    if (frontLineWidth < Constants.BYELAWS_DISTANCE_LANDSCAPING_FRONTAGE) {
      return frontLineWidth * Constants.BYELAWS_AREA_LANDSCAPING_SOFT_SMALL
    } else {
      return frontLineWidth * Constants.BYELAWS_AREA_LANDSCAPING_SOFT_LARGE
    }
  }

  static computeLandscaping(
    startGeom,
    endGeom,
    maxWidth,
    frontLineGeom,
    parcelGeom,
    canonical,
    suffix = '',
    addHard = false
  ) {
    if (!startGeom || !endGeom || !frontLineGeom) return null

    const fillResult = (key, result, footprint, dimension) => {
      result[key] = {
        id: Model.generateItemId(key),
        ...Model.getDisplayProperties(key),
        type: Constants.TYPE_GEOJSON,
        derivedProps: {
          width: dimension[0],
          length: dimension[1],
          area: Geo.area(footprint),
        },
        data: Geo.getGeoJson(footprint),
        rawProps: {
          footprint: footprint,
          footprintCenter: Geo.getAnchor(footprint, 'center'),
        },
      }
    }

    let feature = EditUpdate._computeSeparationFarF2R(
      frontLineGeom,
      startGeom,
      canonical.f2rDirScene
    )
    if (!feature) return null
    const lOffsetMeter = feature.properties.distance // in meters

    feature = EditUpdate._computeSeparationF2R(endGeom, startGeom, canonical.f2rDirScene)
    if (!feature) return null

    const lSizeMeter = feature.properties.distance

    const [footprint, dimension] =
      EditUpdate.computeFootprintOnPlot(
        parcelGeom,
        canonical,
        [maxWidth, lSizeMeter],
        lOffsetMeter
      ) || []

    if (!footprint || !dimension) return null

    const result = {}
    const key = 'landscaping'
    fillResult(key + suffix, result, footprint, dimension)

    if (addHard) {
      // Hard landscaping
      const [footprintH, dimensionH] =
        EditUpdate.computeFootprintOnPlot(
          parcelGeom,
          canonical,
          [null, lSizeMeter],
          lOffsetMeter
        ) || []
      if (!footprintH || !dimensionH) return null

      let footprintHard = Geo.booleanSubtract(footprintH, footprint)
      // handle MultiPolygon
      footprintHard = Geo.getPolygon(footprintHard)

      const dimensionHard = [dimensionH[0] - dimension[0], dimensionH[1]]

      if (footprintHard) fillResult(key + 'Hard' + suffix, result, footprintHard, dimensionHard)
    }

    return result
  }

  static computeSeparationLine(footprint1, footprint2, canonical) {
    if (!footprint2 || !footprint1 || !canonical?.f2rDirScene) return null

    const options = {
      endWidth: Constants.DEFAULT_DIMENSION_LINE_LENGTH, // in meters
    }

    const feature = EditUpdate._computeSeparationF2R(footprint1, footprint2, canonical.f2rDirScene)
    if (!feature) return null

    const { endWidth = 0 } = options

    const data = Geo.getGeoJson(feature)
    if (endWidth > 0) {
      // Offset the line
      const [lineStart, lineEnd] = Calc.lineOffset(
        feature.geometry.coordinates[0],
        feature.geometry.coordinates[1],
        endWidth,
        false
      )

      // Add lateral dimensional line to the offseted line
      const [ds1, de1, ds2, de2] = Calc.lineOffset(
        [lineStart.longitude, lineStart.latitude],
        [lineEnd.longitude, lineEnd.latitude],
        endWidth,
        true
      )

      // Modify the existing feature
      data.features[0].geometry.type = 'LineString'
      data.features[0].geometry.coordinates = []
      data.features[0].geometry.coordinates.push([lineStart.longitude, lineStart.latitude])
      data.features[0].geometry.coordinates.push([lineEnd.longitude, lineEnd.latitude])

      // Add new feature
      data.features.push(
        Geo.getFeature({
          type: 'LineString',
          coordinates: [
            [ds1.longitude, ds1.latitude],
            [ds2.longitude, ds2.latitude],
          ],
        })
      )
      data.features.push(
        Geo.getFeature({
          type: 'LineString',
          coordinates: [
            [de1.longitude, de1.latitude],
            [de2.longitude, de2.latitude],
          ],
        })
      )
    }
    const distance = feature.properties?.distance
    const key = 'separationLine'
    const source = {
      data: data,
      id: Model.generateItemId(key),
      type: Constants.TYPE_GEOJSON,
      derivedProps: {
        length: distance,
      },
      rawProps: {},
      ...Model.getDisplayProperties(key),
    }

    const result = {}
    result[key] = source
    return result
  }

  /**
   *
   * @param {number} distanceFromMainBuilding In meters
   * @returns Should max suite have angular plane or not. And maximum permitted height of max suite
   */
  static checkMaxSuiteConstraints(distanceFromMainBuilding) {
    const minDistanceFromMainBulding = Constants.BYELAWS_DISTANCE_MAX_SUITE1_MAIN_BULDING
    const maxDistanceFromMainBulding = Constants.BYELAWS_DISTANCE_MAX_SUITE2_MAIN_BULDING
    const hasAngularPlane =
      distanceFromMainBuilding >= minDistanceFromMainBulding &&
      distanceFromMainBuilding < maxDistanceFromMainBulding

    if (hasAngularPlane) return [true, Constants.BYELAWS_DISTANCE_MAX_SUITE_MAX_HEIGHT_FAR]
    return [
      false,
      distanceFromMainBuilding > minDistanceFromMainBulding
        ? Constants.BYELAWS_DISTANCE_MAX_SUITE_MAX_HEIGHT_FAR
        : Constants.BYELAWS_DISTANCE_MAX_SUITE_MAX_HEIGHT_NEAR,
    ]
  }

  static computeMaxSuite(which, plot, canonical, maxConstraintBox = null, mainBuildingGeom = null) {
    // max 10 m x 8 m
    // If plot is smaller then confined by plot
    // When adu is not previewed - plot is buildable0's footprint
    // When adu is previewed - plot is buildable0/1/2's footprint based on the active adu
    // When maxSuite would have FIXED height of 4 m when it's 5 m to 7.5 closer from main building
    // Otherwise it may have angular wedge and maximum height of 6 m based on the shape of maxConstraintBox
    // i.e. Angular wedge will come when distance from main building is between 7.5 to 9.5 m

    const minDistance = EditUpdate.getMinimumDistance(which)
    const [hasAngularPlane, height] = EditUpdate.checkMaxSuiteConstraints(minDistance)
    const maxHeight = Constants.BYELAWS_DISTANCE_MAX_SUITE_MAX_HEIGHT_FAR

    const upperLimit = [
      Constants.BYELAWS_DISTANCE_MAX_SUITE_MAX_WIDTH,
      Constants.BYELAWS_DISTANCE_MAX_SUITE_MAX_LENGTH,
    ]
    const [footprint, dimension, boxAnchor, anchorType] = EditUpdate._createPlaceRectangle(
      plot,
      canonical,
      upperLimit
    )
    if (!footprint || !anchorType) return null

    const key = 'maxSuite' + which
    const anchor = Geo.getAnchor(footprint, anchorType)
    const { color, opacity, texture, ...restProps } = Model.getDisplayProperties(key)
    const materialProps = { color, opacity, texture }
    const mesh = ThreeUtil.createExtrudeMesh(footprint, anchor, height, materialProps)
    if (!mesh) return null
    const refMesh =
      maxHeight === height
        ? mesh
        : ThreeUtil.createExtrudeMesh(footprint, anchor, maxHeight, materialProps)

    const footprintCenter = Geo.getAnchor(footprint, 'center')

    const result = {}
    result[key] = {
      id: Model.generateItemId(key),
      rawProps: {
        footprint: footprint,
        footprintCenter: footprintCenter,
        dimension: [...dimension, height],
      },
      derivedProps: {
        area: Geo.area(footprint),
        perimeter: Geo.length(footprint),
        length: dimension[1],
        width: dimension[0],
      },
      ...ThreeUtil.createMeshSource(mesh, anchor, anchorType),
      color, // for edges
      ...restProps,
      userData: {
        // NOTE: Following are used for restricting the dragging
        draggingData: {
          canonical: canonical,
          dimension: [...dimension],
          anchorType: anchorType,
          adjustment: {
            longitude: boxAnchor.longitude - anchor.longitude,
            latitude: boxAnchor.latitude - anchor.latitude,
          },
          confinement: plot,
          footprintAfterDrag: footprint, // gets updated on dragging
        },
      },
    }

    // Debug
    DebugUtil.addPolygon(key, footprint)
    DebugUtil.addAnchor(key, anchor)

    if (maxConstraintBox && mesh) {
      // NOTE: Following are used for moulding the shape of maxSuite to constraint box
      result[key].userData.constraintData = {
        criterion: {
          checker: 'checkMaxSuiteConstraints', // EditUpdate.checkMaxSuiteConstraints callback
          refFootprint: mainBuildingGeom,
        },
        maxConstraintBox: maxConstraintBox,
        maxSuiteExtrusion: {
          data: refMesh,
          type: result[key].type,
          origin: anchor,
          edges: restProps?.edges,
          color: color,
          opacity: opacity,
        },
      }

      // Apply constraint if need to
      if (hasAngularPlane) {
        const intersect = DragUpdate._mouldMaxSuiteToConstraintBox(result[key], maxConstraintBox)
        if (intersect?.geometry?.attributes?.position?.array?.length > 0) {
          const old = result[key].data
          result[key].data = ThreeUtil.createMesh(intersect.geometry, result[key].data.material)
          ThreeUtil.safeDispose(intersect.material)
          ThreeUtil.safeDispose(old.geometry)
        }
      }
    }

    return result
  }

  static computeFootprintOnPlot(
    plot,
    canonical,
    sizeLimit = null, // null means no limit
    meter = 0
  ) {
    if (!plot || !canonical) return null

    const [footprint, dimension] = EditUpdate._createPlaceRectangle(
      plot,
      canonical,
      sizeLimit,
      meter,
      meter > 0 ? true : false
    )
    const anchorType = canonical.anchorType
    const anchor = Geo.getAnchor(footprint, anchorType)
    if (!anchor) return null

    return [footprint, dimension, anchor, anchorType]
  }

  static computeFootprintMeshOnPlot(
    plot,
    canonical,
    sizeLimit = null, // null means no limit
    materialProps = {},
    meter = 0,
    degrees = 0,
    frontLineGeom = null,
    adhereToPlotShape = false // Plot may not be rectangular, so make sure box is also so
  ) {
    if (!plot || !canonical) return null

    const [footprint, dimension, anchorPoly] = EditUpdate._createPlaceRectangle(
      plot,
      canonical,
      sizeLimit,
      meter,
      adhereToPlotShape
    )

    const { depth, ...restMatertialProps } = materialProps
    let mesh = null
    if (typeof depth === 'number' && depth > 0) {
      mesh = ThreeUtil.createExtrudeMesh(footprint, anchorPoly, depth, restMatertialProps)
    } else {
      mesh = ThreeUtil.createPolygonMesh(footprint, anchorPoly, restMatertialProps)
    }

    // Rotate
    if (degrees !== 0 && frontLineGeom) {
      const rotationMatrix4 = ThreeUtil.createRotationMatrix4(
        Calc.toAxisScene(frontLineGeom.coordinates),
        degrees
      )
      mesh.geometry.applyMatrix4(rotationMatrix4)
    }

    const anchorType = canonical.anchorType
    if (!anchorType) return null
    const anchor = Geo.getAnchor(footprint, anchorType)
    if (!anchor) return null

    // No need to apply translation if already applied in _createPlaceReactangle
    // Otherwise, apply translation to anchor
    // NOT NEEDED ANY MORE AS OFFSET IS ALWAYS APPLIED BY _createPlaceReactangle
    // if (!adhereToPlotShape && meter !== 0 && canonical?.f2rDirScene) {
    //   const translationMatrix4 = ThreeUtil.createTranslationMatrix4(
    //     canonical.f2rDirScene,
    //     meter,
    //     anchor
    //   )
    //   ThreeUtil.transformAnchor(anchor, translationMatrix4)
    // }

    return [mesh, dimension, anchor, anchorType, footprint, anchorPoly]
  }

  static generateAduSourceFor(maxSuite, aduModel, canonical) {
    if (!aduModel) {
      console.error('No adu item provided')
      return null
    }

    const { width, length, data: url, type, rotation, scale: s, height, id: aduModelId } = aduModel
    const scale = s / Constants.DEBUG_SCALE_FACTOR

    const anchorType = maxSuite?.anchor
    const plot = maxSuite?.rawProps?.footprint
    if (!plot) return null

    // Confined footprint - restricted by the max-size of max suite and adu
    const confinedLimit = [width * scale, length * scale]
    if (maxSuite?.derivedProps?.width)
      confinedLimit[0] = Math.min(confinedLimit[0], maxSuite.derivedProps.width)
    if (maxSuite?.derivedProps?.length)
      confinedLimit[1] = Math.min(confinedLimit[1], maxSuite.derivedProps.length)

    const [confinedFootprint, confinedDimension] = EditUpdate._createPlaceRectangle(
      plot,
      canonical,
      confinedLimit
    )

    // Model footprint
    const lOffsetMeter = 0
    const adhereToPlotShape = false
    const fixedSize = true
    const upperLimit = [width * scale, length * scale]
    const [footprint, dimensionModel, boxAnchor] = EditUpdate._createPlaceRectangle(
      plot,
      canonical,
      upperLimit,
      lOffsetMeter,
      adhereToPlotShape,
      fixedSize
    )
    if (!footprint) return null
    const anchor = Geo.getAnchor(footprint, anchorType)

    const key = 'adu'
    const result = {}
    const { x, y, z } = rotation || { x: 0, y: 0, z: 0 }
    result[key] = {
      data: url,
      type,
      scale,
      id: Model.generateItemId(aduModelId || key), // Generate id based on ADU model id
      origin: anchor,
      anchor: anchorType,
      rawProps: {
        footprint: footprint,
        footprintCenter: Geo.getAnchor(footprint, 'center'),
        dimension: [...dimensionModel, height],
      },
      derivedProps: {
        length: confinedDimension?.[1],
        width: confinedDimension?.[0],
        height: EditUpdate.getMaximumHeight(EditUpdate.getActiveMode()),
        area: Geo.area(confinedFootprint),
        perimeter: Geo.length(confinedFootprint),
        modelPerimeter: Geo.length(footprint),
        modelArea: Geo.area(footprint),
        modelLength: length,
        modelWidth: width,
        modelHeight: height,
      },
      rotation: {
        x: x,
        y: y,
        z: canonical.bearing ? z - canonical.bearing - 180 : 0, // ADU to face toward the rear (so 180)
      },
      ...Model.getDisplayProperties(key),
      // NOTE: Following are used for restricting the dragging - Not shown on scene
      userData: {
        draggingData: {
          canonical: canonical,
          dimension: [...dimensionModel],
          anchorType: canonical.anchorType,
          adjustment: {
            longitude: boxAnchor.longitude - anchor.longitude,
            latitude: boxAnchor.latitude - anchor.latitude,
          },
          confinement: plot,
          footprintAfterDrag: footprint, // gets updated on dragging
        },
      },
    }

    return result
  }

  static performCheckOnAdu(aduSource, mainBuildingGeom, buildableLength, canonical) {
    if (!aduSource || !mainBuildingGeom || !canonical) return
    const footprint = aduSource.rawProps?.footprint

    const modelGap = EditUpdate.computeDistance(footprint, mainBuildingGeom, canonical.f2rDirScene)
    const gapMin = EditUpdate.getMinimumDistance(EditUpdate.getActiveMode())

    const { length, width, height, modelLength, modelWidth, modelHeight } = aduSource.derivedProps

    let gapRear = null
    if (typeof buildableLength === 'number') {
      const modelRearDist = modelGap + modelLength
      const maxRearDist = gapMin + buildableLength
      gapRear = maxRearDist - modelRearDist
    }

    aduSource.derivedProps.separation = modelGap
    aduSource.derivedProps.validation = {
      length: modelLength <= length,
      width: modelWidth <= width,
      height: modelHeight <= height,
      separation: modelGap >= gapMin,
      setback: gapRear >= 0,
    }
  }

  static checkAduMeshIntersectAngularPlaneMesh() {
    const selectAduId = MapStore.useStore.getState().sources?.selectedAduModel
    if (!selectAduId) return

    try {
      const tb = Map.ref?.tb || window?.tb
      if (tb) {
        const aduObjectTb = tb.world.getObjectByName(
          Constants.PREFIX + selectAduId + Constants.OBJECT3D_SUFFIX
        )
        const angularPlaneObjectTb = tb.world.getObjectByName(
          Constants.PREFIX + 'angularPlane' + Constants.OBJECT3D_SUFFIX
        )
        if (aduObjectTb && angularPlaneObjectTb) {
          return ThreeUtil.isBooleanIntersect(aduObjectTb, angularPlaneObjectTb)
        }
      }
    } catch (error) {
      console.error(error)
    }
    return
  }

  /**
   *
   * @param {*} plot
   * @param {*} canonical
   * @param {array} upperLimit
   * @param {number} lOffsetMeter Length wise offset form the plot
   * @param {boolean} adhereToPlotShape Used for deforming the rectangle to the shape of plot at specified distance
   * @param {boolean} fixedSize Applicable only when adhereToPlotShape is false. When true, diemension specified in upperLimit must be used.
   * @returns
   */
  static _createPlaceRectangle(
    plot,
    canonical,
    upperLimit = [],
    lOffsetMeter = 0,
    adhereToPlotShape = false,
    fixedSize = false
  ) {
    const bearing = canonical?.bearing
    const anchorType = canonical?.anchorType
    if (!plot || typeof bearing !== 'number' || !anchorType) return []

    const anchorTypeBoundary = Anchor.toBoundaryAnchorType(bearing, anchorType)
    const minmin = Geo.getAnchor(plot, anchorTypeBoundary)
    if (!minmin) return []

    // x-width(east/west) and y-length (north/south)
    const dimensions = Geo.getBoxSize(plot, bearing, minmin)
    if (upperLimit && upperLimit.length > 1) {
      if (!adhereToPlotShape && fixedSize) {
        dimensions[0] = upperLimit[0] || dimensions[0]
        dimensions[1] = upperLimit[1] || dimensions[1]
      } else {
        dimensions[0] = upperLimit[0] ? Math.min(upperLimit[0], dimensions[0]) : dimensions[0]
        dimensions[1] = upperLimit[1] ? Math.min(upperLimit[1], dimensions[1]) : dimensions[1]
      }
    }

    let footprint = Geo.createBox(dimensions[0], dimensions[1], bearing, minmin, anchorTypeBoundary)

    if (lOffsetMeter !== 0 && canonical?.f2rDirScene) {
      // Apply translation of footprint
      const center = Calc.toLongitudeLatitudeAltitude(
        Geo.getGeometry(footprint)?.coordinates[0]?.[0]
      )
      const translationMatrix4 = ThreeUtil.createTranslationMatrix4(
        canonical.f2rDirScene,
        lOffsetMeter,
        center
      )
      ThreeUtil.transformPolygon(footprint, translationMatrix4)
      ThreeUtil.transformAnchor(minmin, translationMatrix4)
    }
    if (adhereToPlotShape) {
      // intersect with parcel
      footprint = Geo.booleanIntersect(plot, footprint) || footprint
    }

    return [footprint, dimensions, minmin, anchorType]
  }

  static _enforceGapBetween(meter, footprint, baseFootprint, canonical) {
    const feature = EditUpdate._computeSeparationF2R(
      footprint,
      baseFootprint,
      canonical.f2rDirScene
    )

    const oneMillimeter = 1.0 / 1000
    if (feature && Math.abs(feature.properties.distance - meter) > oneMillimeter) {
      // decrease / increase the gap
      const center = Calc.toLongitudeLatitudeAltitude(
        Geo.getGeometry(footprint)?.coordinates[0]?.[0]
      )
      const diff = meter - feature.properties.distance
      const translationMatrix4 = ThreeUtil.createTranslationMatrix4(
        canonical.f2rDirScene,
        diff,
        center
      )
      ThreeUtil.transformPolygon(footprint, translationMatrix4)

      return translationMatrix4
    }
    return null
  }

  static _computeSeparationF2R(footprint1, footprint2, f2rDirScene) {
    const feature = Geo.computeSeparation(footprint1, footprint2)
    if (!feature || !f2rDirScene) return feature

    return EditUpdate._alignToF2RAxis(footprint1, footprint2, feature, f2rDirScene)
  }

  static _computeSeparationFarF2R = (footprint1, footprint2, f2rDirScene) => {
    const feature = Geo.computeSeparationFar(footprint1, footprint2)
    if (!feature || !f2rDirScene) return feature

    return EditUpdate._alignToF2RAxis(footprint1, footprint2, feature, f2rDirScene)
  }

  static computeDistance = (object1, object2, f2rDirScene) => {
    const feature = EditUpdate._computeSeparationF2R(object1, object2, f2rDirScene)
    if (feature?.properties) return feature.properties.distance

    return NaN
  }

  static _alignToF2RAxis = (footprint1, footprint2, feature, f2rDirScene) => {
    // Enhance the result further by aligning separtion with F2R direciton

    const distance = Calc.meterToScene(feature.properties.distance)
    const point1 = Calc.toScene(feature.geometry.coordinates[0])
    const point2 = Calc.toScene(feature.geometry.coordinates[1])
    const dir = point2.clone().sub(point1).normalize()
    const update2Or1 = Calc.isParallelOrAntiParallel(f2rDirScene, dir)

    const newPoint = Calc.fromScene(
      f2rDirScene
        .clone()
        .multiplyScalar(distance)
        .add(update2Or1 ? point1 : point2)
    )
    const finalPoint = Geo.getNearestPointOnLine(
      Geo.getLineString(update2Or1 ? footprint2 : footprint1),
      {
        type: 'Point',
        coordinates: [newPoint.longitude, newPoint.latitude],
      }
    )?.[1]

    // Update the feature
    if (finalPoint) {
      feature.geometry.coordinates[update2Or1 ? 1 : 0] = finalPoint
    }
    return feature
  }

  static getSimplifiedBuildable(sources, which) {
    // When buildable(s) are overrided - it already has simplified shape (rectangle)
    if (Constants.OVERRIDE_BUILDABLE) {
      return sources?.['buildable' + which]
    } else {
      // When not override - it's kept as different source
      return sources?.['buildable' + which + Constants.SIMPLIFIED_BUILDABLE_SUFFIX]
    }
  }
}

export { EditUpdate }
