import React from 'react'
import PropTypes from 'prop-types'
import { MapLayerLoader } from './mapbox/map-layer-loader.component'
import { Geo } from '../utils/geo'
import { Constants } from '../utils/constants'

/**
 * Renders a other buildings in locality
 * @component Trees
 * @param {Props} props - React component properties
 * @author Sourabh Soni <https://prolincur.com>
 */
const Trees = (props) => {
  const { stores, map, ...restProps } = props
  const source = stores?.useStore((state) => state.sources.tree)
  const parcelGeom = stores?.useStore((state) => state.sources.parcel?.rawProps?.footprint)

  const treeFilter = React.useCallback(
    (anchor) => {
      if (parcelGeom && Constants.DEFAULT_TREE_ONLY_ON_PARCEL) {
        return Geo.isPointInsidePolygon([anchor.longitude, anchor.latitude], parcelGeom)
      }
      return true
    },
    [parcelGeom]
  )

  if (!source || !map) return null
  return (
    <MapLayerLoader
      key={source.id}
      source={source}
      id={source.id}
      map={map}
      stores={stores}
      distanceFilter={treeFilter}
      {...restProps}
    />
  )
}

Trees.propTypes = {
  map: PropTypes.object,
  stores: PropTypes.object,
}

Trees.defaultProps = {}

export { Trees }
