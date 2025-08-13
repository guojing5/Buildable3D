import { Constants } from './constants'
import { EditUpdate } from './edit-update'
import { Geo } from './geo'
import { ThreeUtil } from './three-util'

class DragUpdate {
  static performConstraintXYDragging(draggedObject, newAnchor, tooltip = true, reshape = true) {
    const obj = DragUpdate.getObjectFromModelTb(draggedObject)
    if (!obj) return false

    const { longitude, latitude } = newAnchor
    let allowed = false
    let footprintAfterDrag = null
    if (obj.userData?.draggingData) {
      const { dimension, canonical, anchorType, confinement, adjustment } =
        obj.userData.draggingData
      const boxAnchor = {
        longitude: longitude + adjustment.longitude,
        latitude: latitude + adjustment.latitude,
      }
      const result = Geo.checkIfBoxConfined(
        dimension,
        canonical.bearing,
        boxAnchor,
        anchorType,
        confinement
      )
      allowed = result[0]
      footprintAfterDrag = result[1]
    } else {
      // Allow free X-Y movement in absence of draggingData
      allowed = true
    }

    // Finally drag the object
    if (allowed) {
      // Move in X-Y now!
      draggedObject.setCoords([newAnchor.longitude, newAnchor.latitude])
      if (tooltip) {
        draggedObject.addHelp(
          'lng: ' + newAnchor.longitude,
          +'&#176;, lat: ' + newAnchor.latitude + '&#176;'
        )
      }

      if (footprintAfterDrag && obj.userData?.draggingData?.footprintAfterDrag) {
        const draggingData = {
          ...obj.userData.draggingData,
          footprintAfterDrag,
        }
        obj.userData.draggingData = draggingData
      }

      if (reshape) {
        DragUpdate.reshapeOnXYDragging(draggedObject, newAnchor)
      }
    }
    return allowed
  }

  static reshapeOnXYDragging(draggedObject, newAnchor) {
    const modelObj = DragUpdate.getObjectFromModelTb(draggedObject)
    if (!(modelObj?.parent && modelObj?.userData?.constraintData)) return false

    const constraintData = modelObj.userData.constraintData
    const { maxConstraintBox, maxSuiteExtrusion, criterion } = constraintData

    let uniformExtrusion = null
    if (
      criterion?.checker &&
      criterion.refFootprint &&
      modelObj?.userData?.draggingData?.footprintAfterDrag &&
      modelObj?.userData?.draggingData?.canonical
    ) {
      const refFootprint = criterion.refFootprint
      const footprintAfterDrag = modelObj.userData.draggingData.footprintAfterDrag
      const canonical = modelObj.userData.draggingData.canonical

      let feature = EditUpdate._computeSeparationF2R(
        refFootprint,
        footprintAfterDrag,
        canonical.f2rDirScene
      )
      if (feature) {
        const distance = feature.properties.distance
        const checker = EditUpdate[criterion.checker] // callback
        const [hasAngularPlane, height] = checker(distance)
        if (!hasAngularPlane && height > 0) {
          uniformExtrusion = {
            height: height,
            footprint: footprintAfterDrag,
            anchorType: canonical.anchorType,
          }
        }
      }
    }

    const maxSuite = { ...maxSuiteExtrusion, origin: newAnchor }
    const reshapedMesh = uniformExtrusion
      ? DragUpdate._extrudeNewMaxSuite(uniformExtrusion)
      : DragUpdate._mouldMaxSuiteToConstraintBox(maxSuite, maxConstraintBox)

    if (!reshapedMesh) return false

    const newMesh = ThreeUtil.createMesh(reshapedMesh.geometry, maxSuite.data.material)
    ThreeUtil.safeDispose(reshapedMesh.material)

    const { edges: edgesVisibility, color, opacity } = constraintData.maxSuiteExtrusion
    const obj = ThreeUtil.applyEdgesVisibilityToMesh(
      edgesVisibility,
      newMesh,
      { color, opacity },
      modelObj.userData
    )

    if (obj && obj.geometry) {
      ThreeUtil._safeCloneBufferGeometry(obj.geometry, modelObj.geometry)
      ThreeUtil.safeDispose(obj)
      if (window.tb) window.tb.repaint()
      return true
    }
  }

  static _extrudeNewMaxSuite(extrusionData) {
    const { height, footprint, anchorType } = extrusionData
    const anchor = Geo.getAnchor(footprint, anchorType)
    const materialProps = {}
    return ThreeUtil.createExtrudeMesh(footprint, anchor, height, materialProps)
  }

  static _mouldMaxSuiteToConstraintBox(maxSuite, maxConstraintBox) {
    if (!maxSuite || !maxConstraintBox) return null
    const {
      data: constraintMesh,
      origin: constraintOrigin,
      type: constraintType,
    } = maxConstraintBox
    if (constraintType !== Constants.TYPE_OBJECT3D || !constraintMesh || !constraintOrigin) return

    const { data: maxSuiteMesh, origin: maxSuiteOrigin, type: maxSuiteType } = maxSuite
    if (maxSuiteType !== Constants.TYPE_OBJECT3D || !maxSuiteMesh || !maxSuiteOrigin) return

    const cloned1 = maxSuiteMesh.clone()
    const cloned2 = constraintMesh.clone()
    ThreeUtil.placeAtAnchor(cloned1, maxSuiteOrigin)
    ThreeUtil.placeAtAnchor(cloned2, constraintOrigin)

    const intersect = ThreeUtil.booleanIntersect(cloned1, cloned2)
    ThreeUtil.safeDispose(cloned1)
    ThreeUtil.safeDispose(cloned2)
    if (!(intersect?.geometry?.attributes?.position?.array?.length > 0)) return null
    return intersect
  }

  static getObjectFromModelTb(modelTb) {
    if (!modelTb) return null
    return modelTb.model
  }
}

export { DragUpdate }
