import React from 'react'
import PropTypes from 'prop-types'
import { Constants } from '../utils/constants'
import THREE from '../utils/three-wrapper'
import { MeshCustomLayer } from './mesh-custom-layer.component'

/**
 * Renders pre-defined threebox mesh objects
 *
 * @component
 * @author Sourabh Soni <https://prolincur.com>
 */
const MeshTbModelLayer = (props) => {
  const { id, origin, data, type, userData, ...restProps } = props

  const origins = React.useMemo(() => {
    if (!origin) return null
    if (!(data instanceof THREE.Object3D)) {
      console.error(`Incorrect data provided, expected threebox 'Object3D'`)
      return null
    }
    if (type !== Constants.TYPE_TBMODEL) {
      console.warn(`Incorrect type '${type}' provided, expected '${Constants.TYPE_TBMODEL}'`)
    }
    return Array.isArray(origin) ? origin : [origin]
  }, [data, origin, type])

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

      addUserData(data)
      origins.forEach((center) => {
        addModel(data, center)
      })
    },
    [addUserData, data, origins]
  )

  if (!origins || !data) return null
  return <MeshCustomLayer key={id} id={id} onAdd={onAdd} {...restProps} />
}

MeshTbModelLayer.propTypes = {
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
   * Threebox Object3d
   */
  data: PropTypes.object.isRequired,
  /**
   * Data type
   */
  type: PropTypes.oneOf([Constants.TYPE_TBMODEL]).isRequired,
}

MeshTbModelLayer.defaultProps = {
  units: 'meters',
  scale: 1,
  rotation: { x: 0, y: 0, z: 0 },
  anchor: 'center',
  enableBbox: Constants.ENABLE_BBOX_OBJECTS,
}

export { MeshTbModelLayer }
