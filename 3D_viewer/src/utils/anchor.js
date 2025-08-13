import * as turf from '@turf/turf'

const MAX = [180, 180]
const MIN = [-180, -180]

class Anchor {
  static getAnchor(footprint, type = 'bottom-left') {
    let anchor = null
    switch (type) {
      case 'center':
        anchor = Anchor._getCenter(footprint)
        break

      case 'top-right':
        anchor = Anchor._getTopRight(footprint)
        break

      case 'top-left':
        anchor = Anchor._getTopLeft(footprint)
        break

      case 'bottom-right':
        anchor = Anchor._getBottomRight(footprint)
        break

      case 'bottom-left':
        anchor = Anchor._getBottomLeft(footprint)
        break

      case 'top-right-boundary':
        anchor = Anchor._getTopRightOnBoundary(footprint)
        break

      case 'right-top-boundary':
        anchor = Anchor._getRightTopOnBoundary(footprint)
        break

      case 'top-left-boundary':
        anchor = Anchor._getTopLeftOnBoundary(footprint)
        break

      case 'left-top-boundary':
        anchor = Anchor._getLeftTopOnBoundary(footprint)
        break

      case 'bottom-right-boundary':
        anchor = Anchor._getBottomRightOnBoundary(footprint)
        break

      case 'right-bottom-boundary':
        anchor = Anchor._getRightBottomOnBoundary(footprint)
        break

      case 'left-bottom-boundary':
        anchor = Anchor._getLeftBottomOnBoundary(footprint)
        break

      case 'bottom-left-boundary':
        anchor = Anchor._getBottomLeftOnBoundary(footprint)
        break

      default:
        anchor = Anchor._getBottomLeft(footprint)
        console.error('Unsupported anchor type:', type)
        break
    }
    if (!anchor) return null
    return {
      longitude: anchor[0],
      latitude: anchor[1],
    }
  }

  static toAnchorType(bearing) {
    const verticalThreshold = 60
    const azimuth = (360.0 + bearing) % 360.0
    if (azimuth <= verticalThreshold) {
      return 'top-right'
    } else if (azimuth <= 180) {
      return 'bottom-right'
    } else if (azimuth <= 360 - verticalThreshold) {
      return 'bottom-left'
    } else {
      // <= 360
      return 'top-left'
    }
  }
  static toBoundaryAnchorType(bearing, anchorType) {
    if (!anchorType) throw new Error('Invalid input in toBoundaryAnchorType')
    anchorType = anchorType.replace('-boundary', '')

    const horizontalThreshold = 45
    const azimuth = (360.0 + bearing) % 360.0
    // Close to 90 or 270 degree (horizontal)
    if (
      Math.abs(90 - azimuth) < horizontalThreshold ||
      Math.abs(270 - azimuth) < horizontalThreshold
    ) {
      const splitted = anchorType.split('-')
      // swap that
      anchorType = splitted[1] + '-' + splitted[0]
    }
    return anchorType + '-boundary'
  }
  static isBoundaryAnchorType(anchorType) {
    return anchorType.endsWith('-boundary')
  }

  static _getBottomRight(geometry) {
    if (!geometry) return null
    const bottomRight = [MIN[0], MAX[0]]
    let hasUpdated = false
    const collection = turf.explode(geometry)
    collection.features.forEach((pointFeature) => {
      const coord = pointFeature.geometry.coordinates
      if (coord[1] < bottomRight[1]) {
        bottomRight[1] = coord[1]
        hasUpdated = true
      }
      if (coord[0] > bottomRight[0]) {
        bottomRight[0] = coord[0]
        hasUpdated = true
      }
    })
    if (!hasUpdated) return null
    // Note: it may not necessary lie on the boundary of the geometry
    return bottomRight
  }

  static _getBottomRightOnBoundary(geometry) {
    if (!geometry) return null
    const bottomRight = [MIN[0], MAX[0]]
    let hasUpdated = false
    const collection = turf.explode(geometry)
    collection.features.forEach((pointFeature) => {
      const coord = pointFeature.geometry.coordinates

      if (coord[1] < bottomRight[1] || (coord[1] === bottomRight[1] && coord[0] > bottomRight[0])) {
        bottomRight[0] = coord[0]
        bottomRight[1] = coord[1]
        hasUpdated = true
      }
    })
    if (!hasUpdated) return null

    return bottomRight
  }

  static _getRightBottomOnBoundary(geometry) {
    if (!geometry) return null
    const bottomRight = [MIN[0], MAX[0]]
    let hasUpdated = false
    const collection = turf.explode(geometry)
    collection.features.forEach((pointFeature) => {
      const coord = pointFeature.geometry.coordinates

      if (coord[0] > bottomRight[0] || (coord[0] === bottomRight[0] && coord[1] < bottomRight[1])) {
        bottomRight[0] = coord[0]
        bottomRight[1] = coord[1]
        hasUpdated = true
      }
    })
    if (!hasUpdated) return null

    return bottomRight
  }

  static _getBottomLeft(geometry) {
    if (!geometry) return null
    const bottomLeft = [...MAX]
    let hasUpdated = false
    const collection = turf.explode(geometry)
    collection.features.forEach((pointFeature) => {
      const coord = pointFeature.geometry.coordinates
      if (coord[1] < bottomLeft[1]) {
        bottomLeft[1] = coord[1]
        hasUpdated = true
      }
      if (coord[0] < bottomLeft[0]) {
        bottomLeft[0] = coord[0]
        hasUpdated = true
      }
    })
    if (!hasUpdated) return null
    // Note: it may not necessary lie on the boundary of the geometry
    return bottomLeft
  }

  static _getBottomLeftOnBoundary(geometry) {
    if (!geometry) return null
    const bottomLeft = [...MAX]
    let hasUpdated = false
    const collection = turf.explode(geometry)
    collection.features.forEach((pointFeature) => {
      const coord = pointFeature.geometry.coordinates

      if (coord[1] < bottomLeft[1] || (coord[1] === bottomLeft[1] && coord[0] < bottomLeft[0])) {
        // Pick the point from boundary when it's bottom-most or (left-most of all bottom-most)
        bottomLeft[0] = coord[0]
        bottomLeft[1] = coord[1]
        hasUpdated = true
      }
    })
    if (!hasUpdated) return null

    return bottomLeft
  }

  static _getLeftBottomOnBoundary(geometry) {
    if (!geometry) return null
    const bottomLeft = [...MAX]
    let hasUpdated = false
    const collection = turf.explode(geometry)
    collection.features.forEach((pointFeature) => {
      const coord = pointFeature.geometry.coordinates

      if (coord[0] < bottomLeft[0] || (coord[0] === bottomLeft[0] && coord[1] < bottomLeft[1])) {
        bottomLeft[0] = coord[0]
        bottomLeft[1] = coord[1]
        hasUpdated = true
      }
    })
    if (!hasUpdated) return null

    return bottomLeft
  }

  static _getTopRight(geometry) {
    if (!geometry) return null
    const topRight = [...MIN]
    let hasUpdated = false
    const collection = turf.explode(geometry)
    collection.features.forEach((pointFeature) => {
      const coord = pointFeature.geometry.coordinates
      if (coord[1] > topRight[1]) {
        topRight[1] = coord[1]
        hasUpdated = true
      }
      if (coord[0] > topRight[0]) {
        topRight[0] = coord[0]
        hasUpdated = true
      }
    })
    if (!hasUpdated) return null
    // Note: it may not necessary lie on the boundary of the geometry
    return topRight
  }

  static _getTopRightOnBoundary(geometry) {
    if (!geometry) return null
    const topRight = [...MIN]
    let hasUpdated = false
    const collection = turf.explode(geometry)
    collection.features.forEach((pointFeature) => {
      const coord = pointFeature.geometry.coordinates
      if (coord[1] > topRight[1] || (coord[1] === topRight[1] && coord[0] > topRight[0])) {
        // Pick the point from boundary when it's top-most or (right-most of all top-most)
        topRight[0] = coord[0]
        topRight[1] = coord[1]
        hasUpdated = true
      }
    })
    if (!hasUpdated) return null

    return topRight
  }

  static _getRightTopOnBoundary(geometry) {
    if (!geometry) return null
    const topRight = [...MIN]
    let hasUpdated = false
    const collection = turf.explode(geometry)
    collection.features.forEach((pointFeature) => {
      const coord = pointFeature.geometry.coordinates
      if (coord[0] > topRight[0] || (coord[0] === topRight[0] && coord[1] > topRight[1])) {
        topRight[0] = coord[0]
        topRight[1] = coord[1]
        hasUpdated = true
      }
    })
    if (!hasUpdated) return null

    return topRight
  }

  static _getTopLeft(geometry) {
    if (!geometry) return null
    const topLeft = [MAX[0], MIN[0]]
    let hasUpdated = false
    const collection = turf.explode(geometry)
    collection.features.forEach((pointFeature) => {
      const coord = pointFeature.geometry.coordinates
      if (coord[1] > topLeft[1]) {
        topLeft[1] = coord[1]
        hasUpdated = true
      }
      if (coord[0] < topLeft[0]) {
        topLeft[0] = coord[0]
        hasUpdated = true
      }
    })
    if (!hasUpdated) return null
    // Note: it may not necessary lie on the boundary of the geometry
    return topLeft
  }

  static _getTopLeftOnBoundary(geometry) {
    if (!geometry) return null
    const topLeft = [MAX[0], MIN[0]]
    let hasUpdated = false
    const collection = turf.explode(geometry)
    collection.features.forEach((pointFeature) => {
      const coord = pointFeature.geometry.coordinates
      if (coord[1] > topLeft[1] || (coord[1] === topLeft[1] && coord[0] < topLeft[0])) {
        topLeft[0] = coord[0]
        topLeft[1] = coord[1]
        hasUpdated = true
      }
    })
    if (!hasUpdated) return null

    return topLeft
  }

  static _getLeftTopOnBoundary(geometry) {
    if (!geometry) return null
    const topLeft = [MAX[0], MIN[0]]
    let hasUpdated = false
    const collection = turf.explode(geometry)
    collection.features.forEach((pointFeature) => {
      const coord = pointFeature.geometry.coordinates
      if (coord[0] < topLeft[0] || (coord[0] === topLeft[0] && coord[1] > topLeft[1])) {
        topLeft[0] = coord[0]
        topLeft[1] = coord[1]
        hasUpdated = true
      }
    })
    if (!hasUpdated) return null

    return topLeft
  }

  static _getCenter(polygon) {
    if (!polygon) return null
    return turf.centerOfMass(polygon)?.geometry?.coordinates
  }
}

export { Anchor }
