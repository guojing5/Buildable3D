import React from 'react'
import PropTypes from 'prop-types'
import { MapLayerLoader } from './mapbox/map-layer-loader.component'

/**
 * Renders a parcel  boundary
 * @component ParcelBoundary
 * @param {Props} props - React component properties
 * @author Sourabh Soni <https://prolincur.com>
 */
const ParcelBoundary = (props) => {
  const { stores, map, ...restProps } = props
  const parcelBoundarySource = stores?.useStore((state) => state.sources.parcelBoundary)
  if (!parcelBoundarySource || !map) return null

  return (
    <MapLayerLoader
      key={parcelBoundarySource.id}
      source={parcelBoundarySource}
      id={parcelBoundarySource.id}
      map={map}
      stores={stores}
      {...restProps}
    />
  )
}

ParcelBoundary.propTypes = {
  map: PropTypes.object,
  stores: PropTypes.object,
}

ParcelBoundary.defaultProps = {}

export { ParcelBoundary }
