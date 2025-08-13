import React from 'react'
import PropTypes from 'prop-types'
import { MapLayerLoader } from './mapbox/map-layer-loader.component'
import { Geo } from '../utils/geo'
import { Constants } from '../utils/constants'
import { Model } from '../model/model'

const whichDebug = 1

/**
 * Renders a debug line between any two polygons
 * @component DebugLine
 * @param {Props} props - React component properties
 * @author Sourabh Soni <https://prolincur.com>
 */
const DebugLine = (props) => {
  const { stores, map, ...restProps } = props
  const key = 'debugLine'
  const footprint1 = stores?.useStore((state) => state.sources?.orientationFront?.data)
  const footprint2 = stores?.useStore((state) => state.sources?.mainBuilding?.data)
  const footprint4 = stores?.useStore(
    (state) => state.sources?.maxConstraintBox?.rawProps?.footprint
  )

  const source1 = React.useMemo(() => {
    if (!footprint1 || !footprint2 || whichDebug !== 1) return null

    const far = true
    const feature = far
      ? Geo.computeSeparationFar(footprint1, footprint2)
      : Geo.computeSeparation(footprint1, footprint2)
    if (feature) {
      return {
        data: Geo.getGeoJson(feature),
        id: Model.generateItemId(key),
        type: Constants.TYPE_GEOJSON,
        derivedProps: {},
        rawProps: {},
        displayType: 'line',
        ...Model.getDisplayProperties(key),
        color: 'red',
      }
    }
    return null
  }, [footprint1, footprint2])

  const source2 = React.useMemo(() => {
    if (!footprint4 || whichDebug !== 2) return null
    return {
      data: Geo.getGeoJson(Geo.getLineString(footprint4)),
      id: Model.generateItemId(key),
      type: Constants.TYPE_GEOJSON,
      derivedProps: {},
      rawProps: {},
      displayType: 'line',
      ...Model.getDisplayProperties(key),
      color: 'white',
    }
  }, [footprint4])

  const source = source1 || source2
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

DebugLine.propTypes = {
  map: PropTypes.object,
  stores: PropTypes.object,
}

DebugLine.defaultProps = {}

export { DebugLine }
