import React from 'react'
import PropTypes from 'prop-types'
import '../../utils/three-wrapper'
import { Map } from '../../components/mapbox/map.component'

/**
 * Renders a NavigationControl on Mapbox
 * @component NavigationControl
 * @param {Props} props - React component properties
 * @author Sourabh Soni <https://prolincur.com>
 */
const NavigationControl = (props) => {
  const { map, showCompass, showZoom, visualizePitch } = props
  const controlRef = React.useRef(null)

  React.useLayoutEffect(() => {
    if (!controlRef.current && map) {
      const options = {
        showCompass: showCompass,
        showZoom: showZoom,
        visualizePitch: visualizePitch,
      }
      controlRef.current = new Map.MapboxGl.NavigationControl(options)
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

NavigationControl.propTypes = {
  /**
   * Instance of a map
   */
  map: PropTypes.object,
  /**
   * If true the compass button is included.
   */
  showCompass: PropTypes.bool,
  /**
   * If true the zoom buttons is included.
   */
  showZoom: PropTypes.bool,
  /**
   * If true the pitch is visualized by rotating X-axis of compass.
   */
  visualizePitch: PropTypes.bool,
}

NavigationControl.defaultProps = {
  showCompass: true,
  showZoom: true,
  visualizePitch: false,
}

export { NavigationControl }
