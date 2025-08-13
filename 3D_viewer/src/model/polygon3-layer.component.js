import React from 'react'
import PropTypes from 'prop-types'
import { MeshLayer } from '../model/mesh-layer.component'
import { Geo } from '../utils/geo'
import { ThreeUtil } from '../utils/three-util'

/**
 * Renders threejs polygon layer
 * @component Map
 * @param {Props} props - React component properties
 * @author Sourabh Soni <https://prolincur.com>
 */
const Polygon3Layer = (props) => {
  const {
    map,
    stores,
    data,
    id: sourceId,
    color,
    opacity,
    texture,
    height,
    renderOrder,
    ...restProps
  } = props
  const anchorType = stores?.useStore((state) => state.sources.canonical?.anchorType)
  const { data: textureUrl } = texture || {}

  const getTexture = React.useCallback(() => {
    return ThreeUtil.getTextureMap(textureUrl)
  }, [textureUrl])

  const meshProps = React.useMemo(() => {
    if (!data) return null
    if (!anchorType) return null
    const anchor = Geo.getAnchor(data, anchorType)
    if (!anchor) return null

    const materialProps = {
      opacity,
      color,
    }
    materialProps.map = getTexture()
    if (materialProps.map && materialProps.opacity < 1.0) {
      //     materialProps.depthWrite = false
    }

    const mesh = ThreeUtil.createPolygonMesh(data, anchor, materialProps)
    if (!mesh) return null
    if (typeof renderOrder === 'number') {
      mesh.renderOrder = renderOrder
    }

    return {
      id: sourceId,
      ...ThreeUtil.createMeshSource(mesh, anchor, anchorType),
    }
  }, [anchorType, color, data, getTexture, opacity, renderOrder, sourceId])

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

Polygon3Layer.propTypes = {
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
   * Texture
   */
  texture: PropTypes.object,
}

Polygon3Layer.defaultProps = {
  color: 'green',
  opacity: 1.0,
  texture: null,
}

export { Polygon3Layer }
