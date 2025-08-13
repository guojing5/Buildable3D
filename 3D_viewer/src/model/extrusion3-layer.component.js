import React from 'react'
import PropTypes from 'prop-types'
import { MeshLayer } from '../model/mesh-layer.component'
import { Geo } from '../utils/geo'
import { ThreeUtil } from '../utils/three-util'

/**
 * Renders extrusion created by threebox
 * @component Extrusion3Layer
 * @param {Props} props - React component properties
 * @author Sourabh Soni <https://prolincur.com>
 */
const Extrusion3Layer = (props) => {
  const { id: sourceId, stores, map, data, color, height, opacity, ...restProps } = props
  const anchorType = stores?.useStore((state) => state.sources.canonical?.anchorType)

  const meshProps = React.useMemo(() => {
    if (!anchorType) return null
    if (!data) return null
    const anchor = Geo.getAnchor(data, anchorType)
    if (!anchor) return null

    const feature = Geo.getFeature(data)
    if (feature?.geometry?.type !== 'Polygon') {
      console.error('No Polygon found in the input data')
      return null
    }
    const coordinates = feature.geometry.coordinates
    const meters = height || feature.properties?.height
    if (!meters || !coordinates) {
      console.error('No valid Polygon found in the input data')
      return null
    }

    const mesh = ThreeUtil.createExtrudeMesh(feature, anchor, meters, {
      color: color,
      opacity: opacity,
    })
    if (!mesh) return null

    return {
      id: sourceId,
      ...ThreeUtil.createMeshSource(mesh, anchor, anchorType),
    }
  }, [anchorType, data, height, color, opacity, sourceId])

  if (!meshProps) return null
  return (
    <MeshLayer
      map={map}
      stores={stores}
      {...meshProps}
      color={color}
      opacity={opacity}
      {...restProps}
    />
  )
}

Extrusion3Layer.propTypes = {
  map: PropTypes.object,
  stores: PropTypes.object,
  data: PropTypes.object, // Geojson data
  color: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
  opacity: PropTypes.number,
  height: PropTypes.number,
}

Extrusion3Layer.defaultProps = {
  color: 'lightblue',
  opacity: 1.0,
  height: null,
  data: null,
}

export { Extrusion3Layer }
