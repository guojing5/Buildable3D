import React from 'react'
import PropTypes from 'prop-types'
import '../../utils/three-wrapper'
import { Map } from '../../components/mapbox/map.component'

/**
 * Renders a FullscreenControl on Mapbox
 * @component FullscreenControl
 * @param {Props} props - React component properties
 * @author Sourabh Soni <https://prolincur.com>
 */
const FullscreenControl = (props) => {
  const { map } = props
  const controlRef = React.useRef(null)

  React.useLayoutEffect(() => {
    if (!controlRef.current && map) {
      controlRef.current = new Map.MapboxGl.FullscreenControl()
      map.addControl(controlRef.current)
    }

    return () => {
      if (controlRef.current && map) {
        map.removeControl(controlRef.current)
        controlRef.current = null
      }
    }
  })

  return null
}

FullscreenControl.propTypes = {
  /**
   * Instance of a map
   */
  map: PropTypes.object,
}

FullscreenControl.defaultProps = {}

export { FullscreenControl }
