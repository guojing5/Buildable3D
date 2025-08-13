import React from 'react'
import PropTypes from 'prop-types'
import { MapLayerLoader } from './mapbox/map-layer-loader.component'

/**
 * Renders box of maximum possible buildable space - The Constraint Box
 * @component MaxConstraintBox
 * @param {Props} props - React component properties
 * @author Sourabh Soni <https://prolincur.com>
 */
const MaxConstraintBox = (props) => {
  const { stores, map, ...restProps } = props
  const source = stores?.useStore((state) => state.sources.maxConstraintBox)

  if (!source) return null
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

MaxConstraintBox.propTypes = {
  map: PropTypes.object,
  stores: PropTypes.object,
}

MaxConstraintBox.defaultProps = {}

export { MaxConstraintBox }
