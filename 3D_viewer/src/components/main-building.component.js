import React from 'react'
import PropTypes from 'prop-types'
import { MapLayerLoader } from './mapbox/map-layer-loader.component'

/**
 * Renders a main building
 * @component MainBuilding
 * @param {Props} props - React component properties
 * @author Sourabh Soni <https://prolincur.com>
 */
const MainBuilding = (props) => {
  const { stores, map, ...restProps } = props
  const source = stores?.useStore((state) => state.sources.mainBuilding)
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

MainBuilding.propTypes = {
  map: PropTypes.object,
  stores: PropTypes.object,
}

MainBuilding.defaultProps = {}

export { MainBuilding }
