import React from 'react'
import PropTypes from 'prop-types'
import { MeshLayer } from '../model/mesh-layer.component'
import { Geo } from '../utils/geo'
import { Constants } from '../utils/constants'
import { ThreeUtil } from '../utils/three-util'

/**
 * Renders line created by threebox
 * @component Line3Layer
 * @param {Props} props - React component properties
 * @author Sourabh Soni <https://prolincur.com>
 */
const Line3Layer = (props) => {
  const {
    id: sourceId,
    stores,
    map,
    width,
    dashWidth,
    data,
    color,
    height,
    opacity,
    ...restProps
  } = props
  const tb = map?.tb
  const anchorType = stores?.useStore((state) => state.sources.canonical?.anchorType)

  const meshProps = React.useMemo(() => {
    if (!anchorType || !tb) return null
    if (!data) return null
    const anchor = Geo.getAnchor(data, anchorType)
    if (!anchor) return null

    const lineMesh = ThreeUtil.createLineMesh(data, anchor, {
      color,
      opacity,
      width,
      dashWidth,
    })
    if (!lineMesh) return null

    return {
      id: sourceId,
      data: lineMesh,
      origin: anchor,
      type: Constants.TYPE_OBJECT3D,
      units: 'scene',
      anchor: anchorType,
    }
  }, [anchorType, tb, data, color, opacity, width, dashWidth, sourceId])

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

Line3Layer.propTypes = {
  map: PropTypes.object,
  stores: PropTypes.object,
  data: PropTypes.object, // Geojson data
  color: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
  opacity: PropTypes.number,
  width: PropTypes.number,
}

Line3Layer.defaultProps = {
  color: 'lightblue',
  opacity: 1.0,
  width: 1,
  data: null,
}

export { Line3Layer }
