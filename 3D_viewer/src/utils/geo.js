import * as turf from '@turf/turf'
import { Anchor } from './anchor'
import { Calc } from './calc'

class Geo {
  static getGeoJson(object) {
    const type = object?.type
    if (!type || type === 'FeatureCollection') return object

    if (type === 'Feature') {
      return {
        type: 'FeatureCollection',
        features: [object],
      }
    }

    if (Geo.isGeometry(type)) {
      return {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: object,
            properties: {},
          },
        ],
      }
    }
    console.error('Unsupported GeoJson type', type)
    return object
  }

  static getFeature(object) {
    if (!object) return object
    const type = object?.type
    if (type === 'FeatureCollection') {
      if (object.features?.length > 1) {
        console.error('Ignoring features other than first in the FeatureCollection')
      }
      return object.features?.[0]
    }

    if (type === 'Feature') {
      return object
    }

    if (Geo.isGeometry(type)) {
      return {
        type: 'Feature',
        geometry: object,
        properties: {},
      }
    }
    console.error('Unsupported GeoJson type', type)
    return object
  }

  static isGeometry(object) {
    const type = typeof object === 'string' ? object : object?.type
    const geometryTypes = [
      'Polygon',
      'MultiPolygon',
      'Point',
      'LineString',
      'MultiLineString',
      'GeometryCollection',
    ]
    return geometryTypes.includes(type)
  }

  static getGeometry(object) {
    if (Geo.isGeometry(object)) return object

    return Geo.getFeature(object)?.geometry
  }

  static getPolygon(object) {
    const geometry = Geo.getGeometry(object)
    if (geometry?.type === 'Polygon') return geometry

    if (geometry?.type === 'MultiPolygon') {
      const polygons = Geo.getPolygons(object)
      if (polygons.length > 1) {
        console.warn('Ignoring other Polygon(s) in MultiPolygon')
        const [maxLenIndex] = polygons.reduce((previous, current, index) => {
          const len = Geo.length(current)
          if (!previous || previous[1] < len) return [index, len]
          return previous
        }, null)
        if (maxLenIndex > -1) return polygons?.[maxLenIndex]
      }
    }
    return null
  }

  static getPolygons(object) {
    const geometry = Geo.getGeometry(object)
    if (!geometry) return null
    if (geometry.type === 'Polygon') return [geometry]

    if (geometry.type === 'MultiPolygon') {
      const polygons = []
      geometry.coordinates?.forEach((loop) => {
        const poly = {
          type: 'Polygon',
          coordinates: [...loop],
        }
        polygons.push(poly)
      })
      if (polygons.length > 0) return polygons
    }
    return null
  }

  static getLineStrings(object) {
    const geometry = Geo.getGeometry(object)
    if (!geometry) return null
    if (geometry.type === 'LineString') return [geometry]

    if (geometry.type === 'Polygon') {
      const lineStrings = []
      geometry.coordinates?.forEach((loop) => {
        const line = {
          type: 'LineString',
          coordinates: [...loop],
        }
        lineStrings.push(line)
      })
      if (lineStrings.length > 0) return lineStrings
    }
    return null
  }

  static getLineString(object) {
    const lineStrings = Geo.getLineStrings(object)
    if (!lineStrings || lineStrings.length === 0) return null
    if (lineStrings.length > 1) console.warn('Ignoring other LineString(s)')
    return lineStrings[0]
  }

  static getAnchor(footprint, type) {
    return Anchor.getAnchor(footprint, type)
  }

  static getNearestPoint(geometry, coord, distanceMethod = 'mapbox') {
    if (!geometry || !coord) return null
    const collection = turf.explode(geometry)
    const targetPoint = turf.point(coord)

    const nearestPoint = turf.nearestPoint(targetPoint, collection)
    if (!nearestPoint) return null

    const distance =
      distanceMethod === 'mapbox'
        ? Calc.distance(nearestPoint.geometry.coordinates, coord)
        : turf.distance(targetPoint, nearestPoint, 'kilometers') * 1000

    return [distance, nearestPoint?.geometry?.coordinates]
  }

  static getNearestPoints(geometry1, geometry2) {
    if (!geometry2 || !geometry1) return null

    let nearestSoFar = [Number.MAX_VALUE, null, null]
    const collection1 = turf.explode(geometry1)
    const collection2 = turf.explode(geometry2)
    collection1.features.forEach((pointFeature) => {
      const coord = pointFeature.geometry.coordinates
      const [dist, pt] = Geo.getNearestPoint(collection2, coord) || []
      if (pt && dist < nearestSoFar[0]) {
        nearestSoFar[0] = dist
        nearestSoFar[1] = coord
        nearestSoFar[2] = pt
      }
    })
    return nearestSoFar
  }

  static getNearestPointOnLine(lineGeometry, pointGeometry) {
    lineGeometry = Geo.getLineString(lineGeometry)
    if (lineGeometry?.type !== 'LineString' || pointGeometry?.type !== 'Point') return null
    const line = turf.lineString(lineGeometry.coordinates)
    const point = turf.point(pointGeometry.coordinates)

    const snapped = turf.nearestPointOnLine(line, point, { units: 'kilometers' })
    if (snapped)
      return [
        snapped.properties.dist * 1000,
        snapped.geometry.coordinates,
        snapped.properties.index,
      ]
    return null
  }

  static getNearestSegment(lineGeometry, startCoord, endCoord) {
    if (lineGeometry?.type !== 'LineString' || !startCoord || !endCoord) return null
    const startPoint = {
      type: 'Point',
      coordinates: startCoord,
    }
    const endPoint = {
      type: 'Point',
      coordinates: endCoord,
    }

    let nearestSoFar = null
    let previousCoord = null
    lineGeometry.coordinates.forEach((coord, index) => {
      if (index === 0) {
        previousCoord = coord
        return
      }
      const segment = {
        type: 'LineString',
        coordinates: [previousCoord, coord],
      }
      const nearStart = Geo.getNearestPointOnLine(segment, startPoint) || [Number.MAX_SAFE_INTEGER]
      const nearEnd = Geo.getNearestPointOnLine(segment, endPoint) || [Number.MAX_SAFE_INTEGER]
      const nearest =
        nearStart[0] < nearEnd[0]
          ? [nearStart[0], nearStart[1], startCoord, index]
          : [nearEnd[0], nearEnd[1], endCoord, index]

      if (!nearestSoFar || (nearestSoFar[0] > nearest[0] && nearest[0] < Number.MAX_SAFE_INTEGER)) {
        nearestSoFar = nearest
      }
      previousCoord = coord
    })
    return nearestSoFar
  }

  static getNearestLineSegments(lineString1, lineString2) {
    if (
      !lineString1 ||
      !lineString2 ||
      lineString1.type !== 'LineString' ||
      lineString2.type !== 'LineString'
    )
      return null

    let nearestSoFar = null
    let previousCoord = null
    lineString2.coordinates.forEach((coord, index) => {
      if (index === 0) {
        previousCoord = coord
        return
      }
      const near = Geo.getNearestSegment(lineString1, previousCoord, coord) || [
        Number.MAX_SAFE_INTEGER,
      ]
      if (!nearestSoFar || (nearestSoFar[0] > near[0] && near[0] < Number.MAX_SAFE_INTEGER)) {
        nearestSoFar = near
        nearestSoFar.push(index)
      }
      previousCoord = coord
    })
    return nearestSoFar
  }

  static getFarthestSegment(lineGeometry, startCoord, endCoord) {
    if (lineGeometry?.type !== 'LineString' || !startCoord || !endCoord) return null
    const startPoint = {
      type: 'Point',
      coordinates: startCoord,
    }
    const endPoint = {
      type: 'Point',
      coordinates: endCoord,
    }

    let farthestSoFar = null
    let previousCoord = null
    lineGeometry.coordinates.forEach((coord, index) => {
      if (index === 0) {
        previousCoord = coord
        return
      }
      const segment = {
        type: 'LineString',
        coordinates: [previousCoord, coord],
      }
      const nearStart = Geo.getNearestPointOnLine(segment, startPoint) || [Number.MAX_SAFE_INTEGER]
      const nearEnd = Geo.getNearestPointOnLine(segment, endPoint) || [Number.MAX_SAFE_INTEGER]
      const nearest =
        nearStart[0] < nearEnd[0]
          ? [nearStart[0], nearStart[1], startCoord, index]
          : [nearEnd[0], nearEnd[1], endCoord, index]

      if (
        !farthestSoFar ||
        (farthestSoFar[0] < nearest[0] && nearest[0] < Number.MAX_SAFE_INTEGER)
      ) {
        farthestSoFar = nearest
      }
      previousCoord = coord
    })
    return farthestSoFar
  }

  static getFarthestLineSegments(lineString1, lineString2) {
    if (
      !lineString1 ||
      !lineString2 ||
      lineString1.type !== 'LineString' ||
      lineString2.type !== 'LineString'
    )
      return null

    let farthestSoFar = null
    let previousCoord = null
    lineString2.coordinates.forEach((coord, index) => {
      if (index === 0) {
        previousCoord = coord
        return
      }
      const far = Geo.getFarthestSegment(lineString1, previousCoord, coord) || [
        Number.MAX_SAFE_INTEGER,
      ]
      if (!farthestSoFar || (farthestSoFar[0] < far[0] && far[0] < Number.MAX_SAFE_INTEGER)) {
        farthestSoFar = far
        farthestSoFar.push(index)
      }
      previousCoord = coord
    })
    return farthestSoFar
  }

  static checkIfBoxConfined(dimension, bearing, anchor, anchorType, confinement) {
    const polygon = Geo.createBox(
      dimension[0],
      dimension[1],
      bearing,
      anchor,
      Anchor.toBoundaryAnchorType(bearing, anchorType)
    )
    return [Geo.isPolygonInsidePolygon(polygon, confinement), polygon]
  }

  static isPointInsidePolygon(coord, confinement) {
    const feature = turf.polygon(Geo.getPolygon(confinement).coordinates)
    return turf.booleanPointInPolygon(turf.point(coord), feature)
  }

  static isPolygonInsidePolygon(polygon, confinement) {
    const feature = turf.polygon(Geo.getPolygon(confinement).coordinates)
    return Geo.getPolygon(polygon).coordinates[0].every((coord) => {
      return turf.booleanPointInPolygon(turf.point(coord), feature)
    })
  }

  static computeSeparation(footprint1, footprint2) {
    const result = Geo.getNearestLineSegments(
      Geo.getLineString(footprint1),
      Geo.getLineString(footprint2)
    )

    if (result && result.length >= 3) {
      const feature = Geo.getFeature({
        type: 'LineString',
        coordinates: [result[1], result[2]],
      })
      feature.properties = {
        distance: result[0],
      }
      return feature
    }
    return null
  }

  static computeSeparationFar(footprint1, footprint2) {
    const result = Geo.getFarthestLineSegments(
      Geo.getLineString(footprint1),
      Geo.getLineString(footprint2)
    )

    if (result && result[0] && result[1] && result[2]) {
      const feature = Geo.getFeature({
        type: 'LineString',
        coordinates: [result[1], result[2]],
      })
      feature.properties = {
        distance: result[0],
      }
      return feature
    }
    return null
  }

  static length(object) {
    const json = Geo.getGeoJson(object)
    const lineFeatures = []

    json?.features.forEach((feature) => {
      const lines = Geo.getLineStrings(feature.geometry)
      lines?.forEach((l) => {
        lineFeatures.push(Geo.getFeature(l))
      })
    })
    const lineCollection = Geo.getGeoJson({
      type: 'FeatureCollection',
      features: lineFeatures,
    })

    // Supply only LineString features
    return turf.length(lineCollection, { units: 'kilometers' }) * 1000
  }
  static area(object) {
    const json = Geo.getGeoJson(object)
    return turf.area(json)
  }

  static bearing(coord1, coord2) {
    const point1 = turf.point(coord1)
    const point2 = turf.point(coord2)

    return turf.rhumbBearing(point1, point2)
  }

  static _getTurfPolygon(object) {
    if (!object) return null
    const geometry = Geo.getGeometry(object)
    if (!geometry || geometry.type !== 'Polygon' || !geometry.coordinates) return null

    return turf.polygon(geometry.coordinates)
  }

  static booleanUnion(polygon1, polygon2) {
    const tPolygon1 = Geo._getTurfPolygon(polygon1)
    const tPolygon2 = Geo._getTurfPolygon(polygon2)
    return turf.union(tPolygon1, tPolygon2)
  }

  static booleanSubtract(polygon1, polygon2) {
    const tPolygon1 = Geo._getTurfPolygon(polygon1)
    const tPolygon2 = Geo._getTurfPolygon(polygon2)
    return turf.difference(tPolygon1, tPolygon2)
  }

  static booleanIntersect(polygon1, polygon2) {
    const tPolygon1 = Geo._getTurfPolygon(polygon1)
    const tPolygon2 = Geo._getTurfPolygon(polygon2)
    return turf.intersect(tPolygon1, tPolygon2)
  }

  static rotateZ(feature, degree, anchor) {
    if (!feature || !anchor) return null
    return turf.transformRotate(feature, degree, { pivot: [anchor.longitude, anchor.latitude] })
  }

  static createBox(lengthMeter, widthMeter, theta, anchor, anchorType) {
    if (!anchor) return null
    const origin = Calc.toScene(anchor)
    const [ox, oy] = [origin.x, origin.y]

    const length = Calc.meterToScene(lengthMeter, anchor)
    const width = Calc.meterToScene(widthMeter, anchor)
    const w2 = width / 2.0
    const l2 = length / 2.0
    const coords = []

    // centered (not bottom-left) to anchor
    coords.push([l2 + ox, w2 + oy])
    coords.push([-l2 + ox, w2 + oy])
    coords.push([-l2 + ox, -w2 + oy])
    coords.push([l2 + ox, -w2 + oy])
    coords.push([l2 + ox, w2 + oy])

    const geoCoords = coords.map((pt) => {
      const g = Calc.fromScene(pt)
      return [g.longitude, g.latitude]
    })

    const box = Geo.rotateZ(
      {
        type: 'Polygon',
        coordinates: [geoCoords],
      },
      theta,
      anchor
    )

    if (Anchor.isBoundaryAnchorType(anchorType)) return Geo.snapPolygon(box, anchorType, anchor)
    if (anchorType !== 'center') throw new Error('Unsupported anchor type: ' + anchorType)
    return box
  }

  static snapPolygon(footprint, anchorType, anchor) {
    const polygon = Geo.getPolygon(footprint)
    if (!polygon) return null
    const currentBottomLeft = Geo.getAnchor(polygon, anchorType)
    const offset = [
      anchor.longitude - currentBottomLeft.longitude,
      anchor.latitude - currentBottomLeft.latitude,
    ]
    return {
      type: 'Polygon',
      coordinates: polygon.coordinates.map((loop) => {
        return loop.map((coord) => [coord[0] + offset[0], coord[1] + offset[1]])
      }),
    }
  }

  /**
   *
   * @param {Feature|Geometry} footprint
   * @param {number} bearing Reverse of bearing is applied to make the footprint canonical
   * @param {object} anchor Point of rotation (immaterial for size)
   * @returns Array of size in X and Y direction (in meters) of oriented/canonical shape
   */
  static getBoxSize(footprint, bearing, anchor) {
    // Undo the pre-multiplied bearing (by applying -1.0) on footprint
    const canonical = Geo.rotateZ(footprint, -bearing, anchor)
    if (!canonical) return null
    const box = turf.bbox(canonical)
    const [minX, minY, maxX, maxY] = box
    // Varying longitude
    const sizeX = Geo.length({
      type: 'LineString',
      coordinates: [
        [minX, minY],
        [maxX, minY],
      ],
    })
    // Varying latitude
    const sizeY = Geo.length({
      type: 'LineString',
      coordinates: [
        [minX, minY],
        [minX, maxY],
      ],
    })
    return [sizeX, sizeY]
  }

  static offsetFeature(feature, offset) {
    if (!feature || !offset) return feature

    if (feature.geometry.type === 'LineString') {
      feature.geometry.coordinates.forEach((coord) => {
        coord[0] += offset[0]
        coord[1] += offset[1]
      })
    } else if (feature.geometry.type === 'Polygon') {
      feature.geometry.coordinates.forEach((loop) => {
        loop.forEach((coord) => {
          coord[0] += offset[0]
          coord[1] += offset[1]
        })
      })
    } else {
      throw new Error('Unsupported feature for offset!')
    }
    return feature
  }
}

export { Geo }
