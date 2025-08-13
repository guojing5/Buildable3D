import React from 'react'
import PropTypes from 'prop-types'
import { MapLayerLoader } from './mapbox/map-layer-loader.component'

/**
 * Renders a other buildings in locality
 * @component OtherBuildings
 * @param {Props} props - React component properties
 * @author Sourabh Soni <https://prolincur.com>
 */
const OtherBuildings = (props) => {
  const { stores, map, ...restProps } = props
  const source = stores?.useStore((state) => state.sources.otherBuildings)
  if (!source || !map) return null
  return (
    <MapLayerLoader
      key={source.id}
      source={source}
      id={source.id}
      map={map}
      stores={stores}
      {...restProps}
    />
  )
}

OtherBuildings.propTypes = {
  map: PropTypes.object,
  stores: PropTypes.object,
}

OtherBuildings.defaultProps = {}

export { OtherBuildings }
