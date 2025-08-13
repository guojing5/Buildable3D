import React from 'react'
import PropTypes from 'prop-types'
import { MapLayerLoader } from './mapbox/map-layer-loader.component'

/**
 * Renders box of maximum possible ADU space
 * @component MaxSuiteBox
 * @param {Props} props - React component properties
 * @author Sourabh Soni <https://prolincur.com>
 */
const MaxSuiteBox = (props) => {
  const { stores, map, which, ...restProps } = props

  // 0: when no preview is active or preview of shorter adu or default
  // 1:  preview of adu with angular plane
  // 2: preview of taller adu
  const source = stores?.useStore((state) => state.sources?.['maxSuite' + which])

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

MaxSuiteBox.propTypes = {
  map: PropTypes.object,
  stores: PropTypes.object,
  which: PropTypes.number,
}

MaxSuiteBox.defaultProps = {
  which: 0,
}

export { MaxSuiteBox }
