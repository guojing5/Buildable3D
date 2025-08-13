import mapboxgl from '!mapbox-gl' // eslint-disable-line import/no-webpack-loader-syntax
import THREE from './three-wrapper'

// https://github.com/jscastro76/threebox/blob/master/src/utils/constants.js#L8
const EARTH_RADIUS = 6371008.8 // In meters
const EARTH_CIRCUMFERENCE = 2 * Math.PI * EARTH_RADIUS //40075000, // In meters
const WORLD_SIZE = 1024000 // //TILE_SIZE(512) * 2000
const PROJECTION_WORLD_SIZE = WORLD_SIZE / (EARTH_RADIUS * Math.PI * 2)
const DEG2RAD = Math.PI / 180
const RAD2DEG = 180 / Math.PI
class Calc {
  static DEFAULT_CENTER = {
    // Coordinates of Abode Atlas Technologies Inc
    longitude: -79.3938316,
    latitude: 43.6430505,
  }

  static degreeToRadian(angle) {
    return DEG2RAD * angle
  }
  static radianToDegree(angle) {
    return RAD2DEG * angle
  }
  static makeBounds(center, expandInMeter) {
    const moveLngLat = (longitude, latitude, dLng, dLat) => {
      return {
        latitude: latitude + Calc.radianToDegree(dLat / EARTH_RADIUS),
        longitude:
          longitude +
          Calc.radianToDegree(dLng / EARTH_RADIUS / Math.cos(Calc.degreeToRadian(latitude))),
      }
    }
    const half = expandInMeter / 2.0
    return {
      min: moveLngLat(center.longitude, center.latitude, -half, -half),
      max: moveLngLat(center.longitude, center.latitude, half, half),
    }
  }
  static meterToLngLat(meter, center = Calc.DEFAULT_CENTER) {
    const { min, max } = Calc.makeBounds(center, meter)
    return {
      longitude: (max.longitude - min.longitude) / 2.0,
      latitude: (max.latitude - min.latitude) / 2.0,
    }
  }

  /**
   * Project to the unit-system of the scene
   * @param {number} meter
   * @param {object} center
   * @returns
   */
  static meterToScene(meter = 1, center = Calc.DEFAULT_CENTER) {
    // https://github.com/jscastro76/threebox/blob/master/src/utils/utils.js#L120
    return (
      meter *
      Math.abs(WORLD_SIZE / Math.cos(Calc.degreeToRadian(center.latitude)) / EARTH_CIRCUMFERENCE)
    )
  }

  static toLongitudeLatitudeAltitude(coord) {
    if (!coord) return null
    let lng = null
    let lat = null
    let alt = 0
    if (Array.isArray(coord)) {
      lng = coord[0]
      lat = coord[1]
      alt = coord[2] || 0
    } else if (typeof coord === 'object') {
      lng = coord.longitude || coord.lng
      lat = coord.latitude || coord.lat
      alt = coord.altitude || 0
    }
    if (lng && lat) {
      return {
        longitude: lng,
        latitude: lat,
        altitude: alt,
      }
    }
    return null
  }
  static toScene(coord) {
    const { longitude, latitude, altitude } = Calc.toLongitudeLatitudeAltitude(coord)

    var projected = [
      -EARTH_RADIUS * DEG2RAD * longitude * PROJECTION_WORLD_SIZE,
      -EARTH_RADIUS *
        Math.log(Math.tan(Math.PI * 0.25 + 0.5 * DEG2RAD * latitude)) *
        PROJECTION_WORLD_SIZE,
    ]

    //z dimension, defaulting to 0 if not provided

    if (!altitude) projected.push(0)
    else {
      projected.push(Calc.meterToScene(altitude, { latitude, longitude }))
    }

    return new THREE.Vector3(projected[0], projected[1], projected[2])
  }

  static fromScene(xyz) {
    const isArray = Array.isArray(xyz)
    const x = isArray ? xyz[0] : xyz.x
    const y = isArray ? xyz[1] : xyz.y
    const z = isArray ? xyz[2] : xyz.z

    const result = {
      longitude: -x / (EARTH_RADIUS * DEG2RAD * PROJECTION_WORLD_SIZE),
      latitude:
        (2 * (Math.atan(Math.exp(y / (PROJECTION_WORLD_SIZE * -EARTH_RADIUS))) - Math.PI / 4)) /
        DEG2RAD,
    }

    const perMeter = Calc.meterToScene(1.0, result)
    //z dimension
    const altitude = z || 0
    result.altitude = altitude / perMeter

    return result
  }

  static toLngLat(coord) {
    if (!coord) return null
    let lng = null
    let lat = null
    if (Array.isArray(coord)) {
      lng = coord[0]
      lat = coord[1]
    } else if (typeof coord === 'object') {
      lng = coord.longitude || coord.lng
      lat = coord.latitude || coord.lat
    }
    if (lng && lat) {
      return new mapboxgl.LngLat(lng, lat)
    }
    return null
  }

  static toMercator(coord) {
    if (!coord) return null
    if (typeof coord === 'object' && coord.x && coord.y) {
      return coord
    }

    const lngLat = Calc.toLngLat(coord)
    if (lngLat) {
      return mapboxgl.MercatorCoordinate.fromLngLat(lngLat)
    }
    return null
  }

  static toAxisScene(line) {
    if (!line?.[0] || !line[1]) return null

    const start = Calc.toScene(line[0])
    const end = Calc.toScene(line[line.length - 1])
    return new THREE.Vector3(start.x - end.x, start.y - end.y, start.z - end.z).normalize()
  }

  static toMidPointScene(line) {
    if (!line?.[0] || !line[1]) return null

    const start = Calc.toScene(line[0])
    const end = Calc.toScene(line[1])
    return new THREE.Vector3(start.x + end.x, start.y + end.y, start.z + end.z).multiplyScalar(0.5)
  }

  static isParallelOrAntiParallel(axis1, axis2) {
    if (!axis1 || !axis2) return null

    const EPSILON = 1e-4

    const dot = axis1.dot(axis2)
    let isParallelOrAnti = false
    if (Math.abs(dot + 1) < EPSILON) {
      // Dot product -1 means Anti parallel
      isParallelOrAnti = false
    } else if (Math.abs(dot) < EPSILON || Math.abs(dot) < Math.abs(dot + 1)) {
      // Dot product 0 means parallel
      // Or, More closer to 0 than -1
      isParallelOrAnti = true
    } else {
      // Closer to -1
      isParallelOrAnti = false
    }

    return isParallelOrAnti
  }

  static averageParallelAxis(axis1, axis2) {
    if (!axis2) return axis1
    if (!axis1) return axis2

    const isParallelOrAnti = Calc.isParallelOrAntiParallel(axis1, axis2)
    axis2 = axis2.clone()
    if (!isParallelOrAnti) axis2 = axis2.multiplyScalar(-1)
    return axis2.add(axis1).multiplyScalar(0.5)
  }

  static mercatorLineNormal(startCoord, endCoord) {
    const { x: x1, y: y1 } = Calc.toMercator(startCoord)
    const { x: x2, y: y2 } = Calc.toMercator(endCoord)

    const [dx, dy] = [x2 - x1, y2 - y1]
    const normal = [-dy, dx]
    const mul = 1 / Math.sqrt(normal[0] * normal[0] + normal[1] * normal[1])
    normal[0] *= mul
    normal[1] *= mul
    return {
      x: normal[0],
      y: normal[1],
    }
  }

  static mercatorCoordOffset(coord, mercatorNormal, mercatorDist) {
    const { x, y } = Calc.toMercator(coord)
    const { x: nx, y: ny } = mercatorNormal
    return new mapboxgl.MercatorCoordinate(x + nx * mercatorDist, y + ny * mercatorDist)
  }

  static lineOffset(startCoord, endCoord, distanceInMeter, bothSide = false) {
    const startPos = Calc.toMercator(startCoord)
    const endPos = Calc.toMercator(endCoord)
    const normal = Calc.mercatorLineNormal(startPos, endPos)
    const offsetDist = startPos.meterInMercatorCoordinateUnits() * distanceInMeter

    const result = []
    let offsetedPos = Calc.mercatorCoordOffset(startPos, normal, offsetDist).toLngLat()
    result.push({
      longitude: offsetedPos.lng,
      latitude: offsetedPos.lat,
    })
    offsetedPos = Calc.mercatorCoordOffset(endPos, normal, offsetDist).toLngLat()
    result.push({
      longitude: offsetedPos.lng,
      latitude: offsetedPos.lat,
    })

    if (bothSide) {
      offsetedPos = Calc.mercatorCoordOffset(startPos, normal, -1.0 * offsetDist).toLngLat()
      result.push({
        longitude: offsetedPos.lng,
        latitude: offsetedPos.lat,
      })
      offsetedPos = Calc.mercatorCoordOffset(endPos, normal, -1.0 * offsetDist).toLngLat()
      result.push({
        longitude: offsetedPos.lng,
        latitude: offsetedPos.lat,
      })
    }
    return result
  }

  static distance(coord1, coord2) {
    return Calc.toLngLat(coord1)?.distanceTo(Calc.toLngLat(coord2))
  }
}

export { Calc }
