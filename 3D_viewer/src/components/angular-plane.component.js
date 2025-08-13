import React from 'react'
import PropTypes from 'prop-types'
import { MapLayerLoader } from './mapbox/map-layer-loader.component'

const AngularPlane = (props) => {
  const { stores, map, ...restProps } = props

  const source = stores?.useStore((state) => state.sources?.angularPlane)
  if (!map || !source) return null

  return (
    <MapLayerLoader
      key={source.id}
      id={source.id}
      stores={stores}
      map={map}
      source={source}
      {...restProps}
    />
  )
}

AngularPlane.propTypes = {
  map: PropTypes.object,
  stores: PropTypes.object,
}

AngularPlane.defaultProps = {}

export { AngularPlane }
