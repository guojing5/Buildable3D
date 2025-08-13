import React from 'react'
import PropTypes from 'prop-types'
import { Constants } from '../utils/constants'
import THREE from '../utils/three-wrapper'
import { ThreeUtil } from '../utils/three-util'
import { MeshCustomLayer } from './mesh-custom-layer.component'

/**
 * Loader mesh file e.g. Collada and textures.
 *
 * @component
 * @author Sourabh Soni <https://prolincur.com>
 */
const MeshObject3dLayer = (props) => {
  const {
    id,
    origin,
    data,
    type,
    units,
    scale,
    rotation,
    baseHeight,
    anchor,
    enableBbox,
    adjustment,
    renderOrder,
    edges: edgesVisibility,
    color,
    opacity,
    userData,
    ...restProps
  } = props

  const [origins, options] = React.useMemo(() => {
    if (!origin) return []
    if (!(data instanceof THREE.Object3D)) {
      console.error(`Incorrect data provided, expected threejs 'Object3D'`)
      return []
    }

    let origins = Array.isArray(origin) ? origin : [origin]
    if (typeof baseHeight === 'number') {
      origins = origins?.map((o) => {
        return {
          ...o,
          altitude: baseHeight,
        }
      })
    }

    const obj = ThreeUtil.applyEdgesVisibilityToMesh(
      edgesVisibility,
      data.clone(),
      { color, opacity },
      userData
    )
    if (!obj) return []

    if (typeof renderOrder === 'number') {
      obj.renderOrder = renderOrder
    }

    const options = {
      obj: obj,
      scale: scale,
      units: units,
      rotation: rotation,
      anchor: anchor,
      adjustment: adjustment,
      bbox: enableBbox,
    }
    return [origins, options]
  }, [
    adjustment,
    anchor,
    baseHeight,
    color,
    data,
    edgesVisibility,
    enableBbox,
    opacity,
    origin,
    renderOrder,
    rotation,
    scale,
    units,
    userData,
  ])

  const onAdd = React.useCallback(
    (map, context, addModel) => {
      if (!map || !addModel) return

      origins.forEach((center) => {
        const model = map.tb.Object3D(options)
        addModel(model, center)
      })
    },
    [options, origins]
  )

  if (!origins) return null
  return <MeshCustomLayer key={id} id={id} onAdd={onAdd} {...restProps} />
}

MeshObject3dLayer.propTypes = {
  /**
   * Ref to Mapbox instance
   */
  map: PropTypes.object.isRequired,
  /**
   * Coordinates {longitude,latitude} of origin
   */
  origin: PropTypes.oneOfType([
    PropTypes.shape({
      longitude: PropTypes.number,
      latitude: PropTypes.number,
    }),
    PropTypes.arrayOf(
      PropTypes.shape({
        longitude: PropTypes.number,
        latitude: PropTypes.number,
      })
    ),
  ]),
  /**
   * Three.js Mesh or Group
   */
  data: PropTypes.object.isRequired,
  /**
   * Data type
   */
  type: PropTypes.oneOf([Constants.TYPE_OBJECT3D]).isRequired,
  /**
   * Units e.g. meters
   */
  units: PropTypes.string,
  /**
   * Scale factor
   */
  scale: PropTypes.number,
  /**
   * Rotation
   */
  rotation: PropTypes.shape({
    x: PropTypes.number,
    y: PropTypes.number,
    z: PropTypes.number,
  }),
  /**
   * Position the pivotal center of the 3D models to the coords. auto value will do nothing.
   */
  anchor: PropTypes.oneOf([
    'auto',
    'top',
    'bottom',
    'left',
    'right',
    'center',
    'top-left',
    'top-right',
    'bottom-left',
    'bottom-right',
  ]),
  enableBbox: PropTypes.bool,
  edges: PropTypes.oneOf(['none', 'visible', 'only']),
  color: PropTypes.string,
  opacity: PropTypes.number,
}

MeshObject3dLayer.defaultProps = {
  units: 'meters',
  scale: 1,
  rotation: { x: 0, y: 0, z: 0 },
  anchor: 'center',
  enableBbox: Constants.ENABLE_BBOX_OBJECTS,
  edges: 'none',
  color: 'white',
  opacity: 1.0,
}

export { MeshObject3dLayer }
