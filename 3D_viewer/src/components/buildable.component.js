import React from 'react'
import PropTypes from 'prop-types'
import { MapLayerLoader } from './mapbox/map-layer-loader.component'

/**
 * Renders a buildable0,  buildable1, or buildable2
 * @component Buildable
 * @param {Props} props - React component properties
 * @author Sourabh Soni <https://prolincur.com>
 */
const Buildable = (props) => {
  const { stores, map, which, ...restProps } = props
  // buildable0: 5 m - when no preview is active or preview of shorter adu or default
  // buildable1: 7.5 m - preview of adu with angular plane
  // buildable2:  9.5 m - preview of taller adu
  const source = stores?.useStore((state) => state.sources?.['buildable' + which])
  if (!map || !source) return null

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

Buildable.propTypes = {
  map: PropTypes.object,
  stores: PropTypes.object,
}

Buildable.defaultProps = {}

export { Buildable }
