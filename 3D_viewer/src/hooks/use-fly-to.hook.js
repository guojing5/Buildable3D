import React from 'react'
import { Map } from '../components/mapbox/map.component'
import { Constants } from '../utils/constants'

const useFlyTo = (props) => {
  const { stores } = props
  const [done, setDone] = React.useState(false)

  const setOrigin = stores?.useStore((state) => state.setOrigin)
  const isFlyingRef = React.useRef(false)
  const onceRef = React.useRef(false)

  const flyTo = React.useCallback(
    ({ center, zoom, minzoom, bounds, pitch, bearing, isOrigin = true, onlyOnce = true }) => {
      onceRef.current = false
      Map.onStyleLoad(Map.ref, onceRef, () => {
        const map = Map.ref.current
        if (!map || (done && onlyOnce)) return
        if (Constants.DEBUG_VERBOSITY === 'minimal')
          console.debug('flyto', center, map.getCenter(), pitch, zoom, bearing)
        const { latitude, longitude } = center
        if (isOrigin) setOrigin?.(longitude, latitude)

        const { lng, lat } = map.getCenter()
        if (
          lng !== longitude ||
          lat !== latitude ||
          map.getZoom() !== zoom ||
          map.getBearing() !== bearing
        ) {
          map.flyTo({
            center: [longitude, latitude],
            pitch: pitch,
            bearing: bearing,
            zoom: zoom,
            essential: false,
          })
          isFlyingRef.current = true
          map.on('moveend', function (e) {
            if (isFlyingRef.current) {
              isFlyingRef.current = false
              if (minzoom) {
                map.setMinZoom(minzoom)
              }
              if (bounds?.longitude && bounds.latitude) {
                map.setMaxBounds([
                  [longitude - bounds.longitude, latitude - bounds.latitude],
                  [longitude + bounds.longitude, latitude + bounds.latitude],
                ])
              }
            }
          })
          if (onlyOnce) setDone(true)
        }
      })
    },
    [done, setOrigin]
  )

  return [flyTo]
}

export { useFlyTo }
