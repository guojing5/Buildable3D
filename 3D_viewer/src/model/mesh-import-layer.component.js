import React from 'react'
import PropTypes from 'prop-types'
import { Constants } from '../utils/constants'
import { MeshCustomLayer } from './mesh-custom-layer.component'
import { ThreeUtil } from '../utils/three-util'

/**
 * Loader mesh file e.g. Collada and textures.
 *
 * @component
 * @author Sourabh Soni <https://prolincur.com>
 */
const MeshImportLayer = (props) => {
  const {
    id,
    map,
    origin,
    data,
    type,
    units,
    scale,
    rotation,
    anchor,
    enableBbox,
    adjustment,
    userData,
    ...restProps
  } = props

  const [origins, options] = React.useMemo(() => {
    if (!origin) return []
    if (!(typeof data === 'string')) {
      console.error(`Incorrect data provided, expected 'string'`)
      return []
    }
    const origins = Array.isArray(origin) ? origin : [origin]
    const options = {
      obj: data,
      type: type,
      scale: scale,
      units: units,
      rotation: rotation,
      clone: false,
      anchor: anchor,
      adjustment: adjustment,
      bbox: enableBbox,
    }
    return [origins, options]
  }, [adjustment, anchor, data, enableBbox, origin, rotation, scale, type, units])

  const addUserData = React.useCallback(
    (model) => {
      if (model?.children?.[0]?.children?.[0] && userData) {
        const obj = model.children[0].children[0]
        if (!obj.userData) obj.userData = {}
        obj.userData = {
          ...obj.userData,
          ...userData,
        }
      }
    },
    [userData]
  )

  const onAdd = React.useCallback(
    (map, context, addModel) => {
      if (!map || !addModel) return

      if (origins.length > 1) {
        let meshBase = null
        origins.forEach((center) => {
          map.tb.loadObj(options, function (model) {
            const org = model.model
            let mesh = null
            if (!meshBase) {
              mesh = ThreeUtil.mergeIntoSingleMesh(org, true)
              meshBase = mesh
            } else {
              mesh = meshBase.clone()
            }
            mesh.name = org.name
            mesh.position.set(org.position.x, org.position.y, org.position.z)
            org.parent.add(mesh)
            org.parent.remove(org)
            ThreeUtil.safeDispose(org)

            addUserData(model)
            addModel(model, center)
          })
        })
      } else {
        map.tb.loadObj(options, function (model) {
          addUserData(model)
          addModel(model, origins[0])
        })
      }
    },
    [addUserData, options, origins]
  )
  if (!origins) return null
  return <MeshCustomLayer key={id} id={id} map={map} onAdd={onAdd} {...restProps} />
}

MeshImportLayer.propTypes = {
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
   * Url of data to load
   */
  data: PropTypes.string.isRequired,
  /**
   * Data type
   */
  type: PropTypes.oneOf(['mtl', 'gltf', 'fbx', 'dae']).isRequired,
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
}

MeshImportLayer.defaultProps = {
  units: 'meters',
  scale: 1,
  rotation: { x: 0, y: 0, z: 0 },
  anchor: 'center',
  enableBbox: Constants.ENABLE_BBOX_OBJECTS,
}

export { MeshImportLayer }
