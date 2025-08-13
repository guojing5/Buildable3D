import React from 'react'
import PropTypes from 'prop-types'
import { MapLayerLoader } from './mapbox/map-layer-loader.component'

/**
 * Renders a parcel and parcel boundary
 * @component Parcel
 * @param {Props} props - React component properties
 * @author Sourabh Soni <https://prolincur.com>
 */
const Parcel = (props) => {
  const { stores, map, ...restProps } = props
  const parcelSource = stores?.useStore((state) => state.sources.parcel)
  if (!parcelSource || !map) return null

  return (
    <MapLayerLoader
      key={parcelSource.id}
      source={parcelSource}
      id={parcelSource.id}
      map={map}
      stores={stores}
      {...restProps}
    />
  )
}

Parcel.propTypes = {
  map: PropTypes.object,
  stores: PropTypes.object,
}

Parcel.defaultProps = {}

export { Parcel }
