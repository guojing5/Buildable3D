import React from 'react'
import PropTypes from 'prop-types'
import { Map } from '../components/mapbox/map.component'
import { Constants } from '../utils/constants'
import { MouseUtil } from '../utils/mouse-util'
import { MapUtil } from '../utils/map-util'
import { ThreeUtil } from '../utils/three-util'

/**
 * Custom mesh layer - load mesh from onAdd callback
 *
 * @component
 * @author Sourabh Soni <https://prolincur.com>
 */
const MeshCustomLayer = (props) => {
  const {
    map,
    onAdd: onAddCallback,
    visible,
    onLoad,
    onClick,
    id,
    before,
    children,
    tooltip,
    label,
    minzoom,
    maxzoom,
    stores,
    hover,
    select,
    enableDragging,
    rawProps,
    derivedProps,
    ...restProps
  } = props
  const disposingRef = React.useRef(false)
  const isAddedToStoreRef = React.useRef(false)
  const isAddedToLayerRef = React.useRef(false)
  const removeMouseSettingsRef = React.useRef(null)
  const layerId = id + Constants.LAYER_SUFFIX
  const modelId = id + Constants.OBJECT3D_SUFFIX
  const onceRef = React.useRef(false)

  const applyMouseSettings = React.useCallback(
    (model) => {
      removeMouseSettingsRef.current = MouseUtil.applySettings(model, map, {
        hover,
        select,
        enableDragging,
        onClick: onClick,
      })
    },
    [enableDragging, hover, map, onClick, select]
  )

  const addModel = React.useCallback(
    (model, center) => {
      model.name = modelId
      if (tooltip) {
        model.addTooltip(tooltip, true)
      }
      if (label) {
        model.addLabel('<div>' + label + '</div>')
      }

      const coords = [center.longitude, center.latitude]
      if (center.altitude) coords.push(center.altitude)
      model.setCoords(coords)

      model.frustumCulled = false
      map.tb.add(model, layerId)

      applyMouseSettings(model)
      isAddedToStoreRef.current = true
    },
    [applyMouseSettings, label, layerId, map.tb, modelId, tooltip]
  )

  const getCustomLayer = () => {
    return {
      id: layerId,
      type: 'custom',
      renderingMode: '3d',
      onAdd: function (map, context) {
        onAddCallback(map, context, addModel)
      },
      render: function (gl, matrix) {
        if (!Constants.ENABLE_MULTI_LAYER) map.tb.update()
      },
      ...restProps,
    }
  }

  React.useLayoutEffect(() => {
    if (!map) return

    const createLayer = () => {
      const customLayer = getCustomLayer()
      if (!MapUtil.hasLayer(map, layerId)) {
        MapUtil.addLayer(map, customLayer, before, visible, [minzoom, maxzoom])

        let sent = false
        // There can more than one object created with same name
        let object3d = ThreeUtil.getObjectsByName(map.tb, modelId)
        const sendOnLoadEvent = () => {
          if (object3d.length === 0) object3d = ThreeUtil.getObjectsByName(map.tb, modelId)
          if (object3d.length !== 0 && !sent) {
            sent = true
            onLoad({ layer: layerId, object3d })
            // Trigger repaint - to ensure textures are visible
            setTimeout(() => map?.tb?.repaint(), 10)
          } else {
            setTimeout(sendOnLoadEvent, 100)
          }
        }
        sendOnLoadEvent()
      }
      isAddedToLayerRef.current = true
    }

    onceRef.current = false
    Map.onStyleLoad({ current: map }, onceRef, () => {
      if (disposingRef.current) {
        disposingRef.current.then(() => {
          disposingRef.current = null
          createLayer()
        })
      } else {
        createLayer()
      }
    })

    const dispose = async () => {
      if (!map) return
      if (removeMouseSettingsRef.current) {
        removeMouseSettingsRef.current()
        removeMouseSettingsRef.current = null
      }
      if (isAddedToStoreRef.current) {
        isAddedToStoreRef.current = false
      }
      if (isAddedToLayerRef.current) {
        isAddedToLayerRef.current = false
        return await MapUtil.removeLayer(map, layerId)
      }
    }

    return () => {
      if (!disposingRef.current) disposingRef.current = dispose()
    }
  })

  return children
}

MeshCustomLayer.propTypes = {
  /**
   * Ref to Mapbox instance
   */
  map: PropTypes.object.isRequired,
  /**
   * Child components
   */
  children: PropTypes.node,
  /**
   * Id of the custom 3d layer
   */
  id: PropTypes.string.isRequired,
  /**
   * Callback
   */
  onLoad: PropTypes.func,
  /**
   * Callback
   */
  onClick: PropTypes.func,
  /**
   * Before layer
   */
  before: PropTypes.string,
  /**
   * Minimum zoom level to show the extrusion
   */
  minzoom: PropTypes.number,
  /**
   * Tooltip
   */
  tooltip: PropTypes.string,
  /**
   * Label
   */
  label: PropTypes.string,
  /**
   * Behaviour on hover
   */
  hover: PropTypes.shape({
    /**
     * Is enabled or not
     */
    enable: PropTypes.bool,
    /**
     * Color on hover
     */
    color: PropTypes.string,
    /**
     * Opacity on hover
     */
    opacity: PropTypes.number,
  }),
  /**
   * Behaviour on select
   */
  select: PropTypes.shape({
    /**
     * Is enabled or not
     */
    enable: PropTypes.bool,
    /**
     * Color on select
     */
    color: PropTypes.string,
    /**
     * Opacity on select
     */
    opacity: PropTypes.number,
  }),
}

MeshCustomLayer.defaultProps = {
  onLoad: () => {},
  onClick: () => {},
  children: null,
  before: Constants.PARENT_LAYER_ID,
  minzoom: null,
  maxzoom: Constants.MAX_ZOOM,
  tooltip: null,
  label: null,
  hover: {
    enable: false,
  },
  select: {
    enable: false,
  },
}

export { MeshCustomLayer }
