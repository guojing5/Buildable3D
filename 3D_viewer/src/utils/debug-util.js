import { Calc } from './calc'
import { Constants } from './constants'
import { Geo } from './geo'

let features = []
class DebugUtil {
  static getGeoJson() {
    if (!Constants.DEBUG) return

    return Geo.getGeoJson({
      type: 'FeatureCollection',
      features: features,
    })
  }
  static initialize() {
    features = []
  }
  static addAnchor(name, anchor) {
    if (!Constants.DEBUG) return
    if (!anchor) return

    const { longitude, latitude, altitude } = Calc.toLongitudeLatitudeAltitude(anchor)
    const feature = Geo.getFeature({
      type: 'Point',
      coordinates: [longitude, latitude],
    })
    feature.properties = {
      altitude: altitude,
      name: name,
    }
    features.push(feature)
  }

  static addPolygon(name, polygon) {
    if (!Constants.DEBUG) return

    if (!polygon) return
    const feature = { ...Geo.getFeature(polygon) }
    feature.properties = {
      name: name,
    }
    features.push(feature)
  }
}

export { DebugUtil }
