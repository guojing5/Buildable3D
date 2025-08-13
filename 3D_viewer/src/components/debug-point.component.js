import React from 'react'
import PropTypes from 'prop-types'
import { Map } from './mapbox/map.component'
import { Constants } from '../utils/constants'

/**
 * Renders a debug point
 * @component DebugPoint
 * @param {Props} props - React component properties
 * @author Sourabh Soni <https://prolincur.com>
 */
const DebugPoint = (props) => {
  const { map } = props
  const doneRef = React.useRef(false)

  React.useLayoutEffect(() => {
    if (doneRef.current || !map) return

    Map.onStyleLoad({ current: map }, doneRef, () => {
      const el = document.getElementById(Constants.DEBUG_POINTER_DIV)
      if (!el) return
      map.on('mousemove', (e) => {
        el.innerHTML = JSON.stringify(e.point) + '<br />' + JSON.stringify(e.lngLat.wrap())
      })
    })
  })

  return null
}

DebugPoint.propTypes = {
  map: PropTypes.object,
  stores: PropTypes.object,
}

DebugPoint.defaultProps = {}

export { DebugPoint }
