import React from 'react'
import PropTypes from 'prop-types'
import { MapLayerLoader } from './mapbox/map-layer-loader.component'
import { ThreeUtil } from '../utils/three-util'
import { Model } from '../model/model'

/**
 * Renders a any mesh for debugging
 * @component DebugMesh
 * @param {Props} props - React component properties
 * @author Sourabh Soni <https://prolincur.com>
 */
const DebugMesh = (props) => {
  const { stores, map, ...restProps } = props
  const data = stores?.useStore((state) => state.sources.debugMesh)
  const anchorType = stores?.useStore((state) => state.sources.canonical?.anchorType)

  const source = React.useMemo(() => {
    if (!data) return null
    const { obj, anchor } = data

    const key = 'debugMesh'

    ThreeUtil.applyMaterial(obj, {
      color: 'orange',
      opacity: 1.0,
    })

    const source = {
      id: Model.generateItemId(key),
      visible: true,
      displayType: 'mesh',
      edges: 'none',
      ...ThreeUtil.createMeshSource(obj, anchor, anchorType),
    }

    console.debug('DebugMesh', source)
    return source
  }, [anchorType, data])

  if (!source || !map) return null
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

DebugMesh.propTypes = {
  map: PropTypes.object,
  stores: PropTypes.object,
}

DebugMesh.defaultProps = {}

export { DebugMesh }
