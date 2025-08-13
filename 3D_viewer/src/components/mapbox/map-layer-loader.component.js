import React from 'react'
import PropTypes from 'prop-types'
import { Constants } from '../../utils/constants'
import { ExtrusionLayer } from '../../model/extrusion-layer.component'
import { Extrusion3Layer } from '../../model/extrusion3-layer.component'
import { PolygonLayer } from '../../model/polygon-layer.component'
import { Polygon3Layer } from '../../model/polygon3-layer.component'
import { LineLayer } from '../../model/line-layer.component'
import { SymbolLayer } from '../../model/symbol-layer.component'
import { MeshLayer } from '../../model/mesh-layer.component'
import { MapUtil } from '../../utils/map-util'
import { Line3Layer } from '../../model/line3-layer.component'

/**
 * Renders a layer on Mapbox from GeoJson or Collada data
 * @component MapLayerLoader
 * @param {Props} props - React component properties
 * @author Sourabh Soni <https://prolincur.com>
 */
const MapLayerLoader = (props) => {
  const { source, map, onLoad: onLoadCb, ...restProps } = props
  const { data, type, displayType, ...restSource } = source
  const { raycasted, receiveShadow, castShadow, ...rest } = { ...restProps, ...restSource }

  const applySetting3d = React.useCallback(
    (object3d) => {
      if (!object3d) return

      const traveseChildMesh = (obj, callback) => {
        if (obj?.type === 'Mesh') {
          callback(obj)
        }
        obj?.children?.forEach?.((o) => {
          traveseChildMesh(o, callback)
        })
      }

      if (typeof raycasted === 'boolean') object3d.raycasted = raycasted
      if (typeof receiveShadow === 'boolean') {
        object3d.receiveShadow = receiveShadow
        traveseChildMesh(object3d, (mesh) => {
          mesh.receiveShadow = receiveShadow
        })
      }
      if (typeof castShadow === 'boolean') {
        object3d.castShadow = castShadow
        traveseChildMesh(object3d, (mesh) => {
          mesh.castShadow = castShadow
        })
      }
    },
    [castShadow, raycasted, receiveShadow]
  )

  const onLoad = React.useCallback(
    (data) => {
      if (data.object3d) {
        if (Array.isArray(data.object3d)) {
          data.object3d.forEach((obj) => applySetting3d(obj))
        } else {
          applySetting3d(data.object3d)
        }
      }

      const layerId = data?.layer
      MapUtil.reorderLayer(map, layerId)

      onLoadCb(data)
    },
    [applySetting3d, map, onLoadCb]
  )

  if (!data || !map) return null

  if (displayType === 'extrusion3' && type === Constants.TYPE_GEOJSON)
    return <Extrusion3Layer map={map} data={data} onLoad={onLoad} {...rest} />
  if (displayType === 'extrusion' && type === Constants.TYPE_GEOJSON)
    return <ExtrusionLayer map={map} data={data} onLoad={onLoad} {...rest} />
  if (displayType === 'polygon' && type === Constants.TYPE_GEOJSON)
    return <PolygonLayer map={map} data={data} onLoad={onLoad} {...rest} />
  if (displayType === 'polygon3' && type === Constants.TYPE_GEOJSON)
    return <Polygon3Layer map={map} data={data} onLoad={onLoad} {...rest} />
  if (displayType === 'line' && type === Constants.TYPE_GEOJSON)
    return <LineLayer map={map} data={data} onLoad={onLoad} {...rest} />
  if (displayType === 'line3' && type === Constants.TYPE_GEOJSON)
    return <Line3Layer map={map} data={data} onLoad={onLoad} {...rest} />
  if (displayType === 'symbol')
    return <SymbolLayer map={map} data={data} type={type} onLoad={onLoad} {...rest} />
  if (displayType === 'mesh')
    return <MeshLayer map={map} data={data} type={type} onLoad={onLoad} {...rest} />
  return null
}

MapLayerLoader.propTypes = {
  map: PropTypes.object,
  id: PropTypes.string.isRequired,
  source: PropTypes.object.isRequired,
  onLoad: PropTypes.func,
  onClick: PropTypes.func,
}

MapLayerLoader.defaultProps = {
  onLoad: () => {},
  onClick: () => {},
}

export { MapLayerLoader }
