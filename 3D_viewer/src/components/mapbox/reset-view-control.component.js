import React from 'react'
import PropTypes from 'prop-types'
import '../../utils/three-wrapper'
import { MapButtonControl } from './map-button-control'
import { useFlyToFront } from '../../hooks/use-fly-to-front.hook'

/**
 * Renders a control on Mpbox to revert the view with initial pitch, bearing and zoom.
 * @component ResetViewControl
 * @param {Props} props - React component properties
 * @author Sourabh Soni <https://prolincur.com>
 */
const ResetViewControl = (props) => {
  const { map, stores } = props
  const center = stores?.useStore((state) => state.origin)
  const bearing = stores?.useStore((state) => state.sources?.canonical?.bearing)

  const [flyTo] = useFlyToFront({ stores, center })

  const onClick = React.useCallback(() => {
    flyTo({ center, isOrigin: false, bearing, onlyOnce: false })
  }, [bearing, center, flyTo])

  const buttonData = React.useMemo(() => {
    return [
      {
        className: 'mapboxgl-ctrl-reset-view',
        tooltip: 'Reset view',
        onClick: onClick,
      },
    ]
  }, [onClick])

  if (center)
    return (
      <MapButtonControl
        key={'reset-view-control'}
        map={map}
        buttons={buttonData}
        anchor={'top-right'}
      />
    )
  return null
}

ResetViewControl.propTypes = {
  /**
   * Instance of a map
   */
  map: PropTypes.object,

  /**
   * Stores
   */
  stores: PropTypes.object,
}

ResetViewControl.defaultProps = {}

export { ResetViewControl }
