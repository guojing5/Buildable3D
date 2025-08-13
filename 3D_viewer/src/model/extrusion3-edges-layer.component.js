import React from 'react'
import PropTypes from 'prop-types'
import { MeshLayer } from '../model/mesh-layer.component'
import { Geo } from '../utils/geo'
import { ThreeUtil } from '../utils/three-util'
import { Constants } from '../utils/constants'

/**
 * Renders threejs polygon layer
 * @component Map
 * @param {Props} props - React component properties
 * @author Sourabh Soni <https://prolincur.com>
 */
const Extrusion3EdgesLayer = (props) => {
  const { map, data, stores, id: sourceId, color, opacity, height, width, ...restProps } = props
  const anchorType = stores?.useStore((state) => state.sources.canonical?.anchorType)

  const meshProps = React.useMemo(() => {
    if (!data || !anchorType) return null
    const feature = Geo.getFeature(data)
    if (feature?.geometry?.type !== 'Polygon') {
      console.error('No Polygon found in the input data')
      return null
    }
    const meters = height || feature.properties?.height
    if (!meters) {
      console.error('No valid height found in the input data')
      return null
    }

    const anchor = Geo.getAnchor(feature.geometry, anchorType)
    if (!anchor) return null

    const extrudeGeometry = ThreeUtil.createExtrudeGeometry(feature.geometry, anchor, meters)
    if (!extrudeGeometry) return null

    const materialProps = { color, opacity, linewidth: width }
    const mesh = ThreeUtil.extractEdgesMesh(extrudeGeometry, materialProps)
    ThreeUtil.safeDispose(extrudeGeometry)
    if (!mesh) return null

    return {
      id: sourceId,
      data: mesh,
      type: Constants.TYPE_OBJECT3D,
      origin: anchor,
      units: 'scene',
      anchor: anchorType,
    }
  }, [data, anchorType, height, color, opacity, width, sourceId])

  if (!meshProps) return null
  return <MeshLayer map={map} stores={stores} {...meshProps} {...restProps} />
}

Extrusion3EdgesLayer.propTypes = {
  /**
   * Whether to display or not
   */
  visible: PropTypes.bool,
  /**
   * Minimum zoom level to show the extrusion
   */
  minzoom: PropTypes.number,
  /**
   * Opacity
   */
  opacity: PropTypes.number,
  /**
   * Color of extrusion
   */
  color: PropTypes.string,
  /**
   * Line width
   */
  width: PropTypes.number,
}

Extrusion3EdgesLayer.defaultProps = {
  color: 'green',
  opacity: 1.0,
  texture: null,
  width: 1,
}

export { Extrusion3EdgesLayer }
