import React from 'react'
import { useFlyTo } from './use-fly-to.hook'
import { Constants } from '../utils/constants'
import { Geo } from '../utils/geo'
import { Map } from '../components/mapbox/map.component'
import { Calc } from '../utils/calc'

const PITCH = 70
const BEARING = 25
const ZOOM = 20
const PITCH_PRE_FLY = 0
const BEARING_PRE_FLY = 0
const ZOOM_PRE_FLY = 10

/**
 * Move the camera to front of the parcel
 * @component useFlyToFront
 * @param {Props} props - React component properties
 * @author Sourabh Soni <https://prolincur.com>
 */
const useFlyToFront = (props) => {
  const { center: initialCenter, stores } = props

  const [flyTo] = useFlyTo({ stores })

  const { initial, final, flyAllowed } = React.useMemo(() => {
    const initial = {
      zoom: ZOOM_PRE_FLY,
      minzoom: ZOOM_PRE_FLY,
      pitch: PITCH_PRE_FLY,
      bearing: BEARING_PRE_FLY,
      bounds: null,
    }
    const final = {
      zoom: ZOOM,
      minzoom: ZOOM,
      pitch: PITCH,
      bearing: BEARING,
      bounds: Constants.DEFAULT_BOUNDS,
    }
    const flyAllowed = !initialCenter
    return {
      initial: flyAllowed ? initial : final,
      final,
      flyAllowed,
    }
  }, [initialCenter])

  const updateCameraPosition = React.useCallback((position, target) => {
    const map = Map.ref.current
    if (!map) return
    const camera = map.getFreeCameraOptions()
    camera.position = Calc.toMercator(position)
    const altitude = 1000 // very high
    camera.position.z = altitude
    camera.lookAtPoint(target)
    map.setFreeCameraOptions(camera)
  }, [])

  const flyToCenter = React.useCallback(
    ({ center, front, bearing, ...restProps }) => {
      if (bearing) {
        // 180 - Make house's front face towards south
        flyTo({ ...restProps, center, ...final, bearing: 180 + bearing - BEARING })
      } else if (front) {
        const frontLine = Geo.getFeature(front).geometry.coordinates
        const frontCenter = [
          (frontLine[0][0] + frontLine[1][0]) / 2.0,
          (frontLine[0][1] + frontLine[1][1]) / 2.0,
        ]

        const target = [center.longitude, center.latitude]
        const factor = 0.1
        const farPosition = [
          frontCenter[0] + factor * (frontCenter[0] - target[0]),
          frontCenter[1] + factor * (frontCenter[1] - target[1]),
        ]

        updateCameraPosition(farPosition, target)

        const map = Map.ref.current
        if (map) {
          const bearing = map.getBearing()
          if (bearing > final.bearing) map.setBearing(bearing - final.bearing)
          else map.setBearing(bearing + final.bearing)
          map.setPitch(final.pitch)
          map.setCenter({
            lng: center.longitude,
            lat: center.latitude,
          })
        }
      } else if (center && flyAllowed) {
        flyTo({ ...restProps, center, ...final })
      }
    },
    [final, flyAllowed, flyTo, updateCameraPosition]
  )

  return [flyToCenter, initial, final]
}

export { useFlyToFront }
