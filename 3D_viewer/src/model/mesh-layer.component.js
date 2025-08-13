import React from 'react'
import PropTypes from 'prop-types'
import { MeshObject3dLayer } from './mesh-object3d-layer.component'
import { MeshTbModelLayer } from './mesh-tb-model-layer.component'
import { MeshImportLayer } from './mesh-import-layer.component'
import { Constants } from '../utils/constants'

/**
 * Wrapper on multiple mesh layer type
 *
 * @component
 * @author Sourabh Soni <https://prolincur.com>
 */
const MeshLayer = (props) => {
  const { type, id, ...restProps } = props

  if (type === Constants.TYPE_OBJECT3D)
    return <MeshObject3dLayer key={id} id={id} type={type} {...restProps} />
  if (type === Constants.TYPE_TBMODEL)
    return <MeshTbModelLayer key={id} id={id} type={type} {...restProps} />
  if (type === Constants.TYPE_GEOJSON) return null
  return <MeshImportLayer key={id} id={id} type={type} {...restProps} />
}

MeshLayer.propTypes = {
  /**
   * Data type
   */
  type: PropTypes.oneOf([
    'mtl',
    'gltf',
    'fbx',
    Constants.TYPE_COLLADA,
    Constants.TYPE_OBJECT3D,
    Constants.TYPE_TBMODEL,
  ]).isRequired,
}

MeshLayer.defaultProps = {}

export { MeshLayer }
