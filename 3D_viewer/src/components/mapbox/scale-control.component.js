import React from 'react'
import PropTypes from 'prop-types'
import '../../utils/three-wrapper'
import { Map } from '../../components/mapbox/map.component'

/**
 * Renders a ScaleControl on Mapbox
 * @component ScaleControl
 * @param {Props} props - React component properties
 * @author Sourabh Soni <https://prolincur.com>
 */
const ScaleControl = (props) => {
  const { map, unit, maxWidth } = props
  const controlRef = React.useRef(null)

  React.useLayoutEffect(() => {
    if (!controlRef.current && map) {
      const options = {
        unit: unit,
        maxWidth: maxWidth,
      }
      controlRef.current = new Map.MapboxGl.ScaleControl(options)
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

ScaleControl.propTypes = {
  /**
   * Instance of a map
   */
  map: PropTypes.object,
  /**
   * Unit of the distance ( 'imperial' , 'metric' or 'nautical' ).
   */
  unit: PropTypes.oneOf(['imperial', 'metric', 'nautical']),
  /**
   * The maximum length of the scale control in pixels.
   */
  maxWidth: PropTypes.number,
}

ScaleControl.defaultProps = {
  unit: 'metric',
  maxWidth: 100,
}

export { ScaleControl }
