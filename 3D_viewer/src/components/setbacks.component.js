import React from 'react'
import PropTypes from 'prop-types'
import { MapLayerLoader } from './mapbox/map-layer-loader.component'

/**
 * Renders a parcel  boundary
 * @component Setbacks
 * @param {Props} props - React component properties
 * @author Sourabh Soni <https://prolincur.com>
 */
const Setbacks = (props) => {
  const { stores, map, ...restProps } = props
  const rightSource = stores?.useStore((state) => state.sources.setbackRight)
  const leftSource = stores?.useStore((state) => state.sources.setbackLeft)
  const rearSource = stores?.useStore((state) => state.sources.setbackRear)
  const frontSource = stores?.useStore((state) => state.sources.setbackFront)
  if (!map) return null

  return (
    <React.Fragment>
      {rightSource && (
        <MapLayerLoader
          key={rightSource.id}
          source={rightSource}
          id={rightSource.id}
          map={map}
          stores={stores}
          {...restProps}
        />
      )}
      {leftSource && (
        <MapLayerLoader
          key={leftSource.id}
          source={leftSource}
          id={leftSource.id}
          map={map}
          stores={stores}
          {...restProps}
        />
      )}
      {rearSource && (
        <MapLayerLoader
          key={rearSource.id}
          source={rearSource}
          id={rearSource.id}
          map={map}
          stores={stores}
          {...restProps}
        />
      )}
      {frontSource && (
        <MapLayerLoader
          key={frontSource.id}
          source={frontSource}
          id={frontSource.id}
          map={map}
          stores={stores}
          {...restProps}
        />
      )}
    </React.Fragment>
  )
}

Setbacks.propTypes = {
  map: PropTypes.object,
  stores: PropTypes.object,
}

Setbacks.defaultProps = {}

export { Setbacks }
