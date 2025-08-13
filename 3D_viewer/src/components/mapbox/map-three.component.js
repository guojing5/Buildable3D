import React from 'react'
import PropTypes from 'prop-types'
import '../../utils/three-wrapper'
import { Map } from './map.component'
import { Constants } from '../../utils/constants'

/**
 * Renders a MapThree scene on Mapbox
 * @component MapThree
 * @param {Props} props - React component properties
 * @author Sourabh Soni <https://prolincur.com>
 */
const MapThree = (props) => {
  const { map: mapRef, onLoad: onLoadCb, realSunlight, sky, ...restProps } = props
  const tbRef = React.useRef(null)
  const doneRef = React.useRef(false)
  const onceRef = React.useRef(false)

  const setSuntime = () => {
    const tb = tbRef.current
    if (sky && !realSunlight && tb) {
      if (!tb.sky) tb.sky = true
      tb.setSunlight(Constants.DEFAULT_SUNTIME)
      tb.updateSunSky(tb.getSunSky(Constants.DEFAULT_SUNTIME))
    }
  }
  const onLoad = () => {
    if (!doneRef.current) {
      doneRef.current = true
      setSuntime()
      mapRef.current.on('render', function () {
        tbRef.current.update()
      })
      onLoadCb(tbRef.current)
    }
  }

  React.useLayoutEffect(() => {
    // Clean up required - when page is 'back' and 'forward' from browser
    if (tbRef.current && mapRef.current && !mapRef.current.tb) {
      tbRef.current = undefined
      window.tb = undefined
    }
  })

  React.useLayoutEffect(() => {
    if (tbRef.current || !mapRef.current) return
    const Threebox = window.Threebox
    const context = mapRef.current.getCanvas().getContext('webgl')
    tbRef.current = new Threebox(mapRef.current, context, {
      realSunlight,
      sky: sky && realSunlight,
      ...restProps,
    })
    mapRef.current.tb = tbRef.current
    window.tb = tbRef.current

    onceRef.current = false
    Map.onStyleLoad(mapRef, onceRef, onLoad)

    return async () => {
      // Don't unmount the map/threebox
      // await tbRef.current?.clear()
      // await tbRef.current?.dispose()
      // window.tb = null
    }
  })

  return null
}

MapThree.propTypes = {
  /**
   * Callback invoke on load of map
   */
  onLoad: PropTypes.func,
  /**
   * Instance of a map
   */
  map: PropTypes.object.isRequired,
  /**
   * Whether to update sky and sunlight based on real world time
   */
  realSunlight: PropTypes.bool,
}

MapThree.defaultProps = {
  onLoad: () => {},
  realSunlight: false,
}

export { MapThree }
