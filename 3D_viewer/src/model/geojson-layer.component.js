import React from 'react'
import PropTypes from 'prop-types'
import { Map } from '../components/mapbox/map.component'
import { Constants } from '../utils/constants'
import { Geo } from '../utils/geo'
import { MapUtil } from '../utils/map-util'

const tooltipRef = React.createRef(null)

/**
 * Renders MapBox GeoJson layer of any type including 'fill-extrusion', 'fill', 'line' and so on.
 * @component Map
 * @param {Props} props - React component properties
 * @author Sourabh Soni <https://prolincur.com>
 */
const GeoJsonLayer = (props) => {
  const {
    map,
    id: sourceId,
    type,
    data,
    layout,
    paint,
    before,
    stores,
    onLoad,
    canCastShadow,
    rawProps,
    derivedProps,
    enableDragging,
    tooltip,
    onMouseEnter: onMouseEnterCb,
    onMouseLeave: onMouseLeaveCb,
    ...restProps
  } = props

  const doneRef = React.useRef(false)
  const layerId = sourceId + Constants.LAYER_SUFFIX

  React.useLayoutEffect(() => {
    if (!tooltipRef.current) {
      const popup = new Map.MapboxGl.Popup({
        closeButton: false,
        closeOnClick: false,
      })
      tooltipRef.current = {
        popup: popup, // popup box
        counter: 0, // 0 - not added on map. +1 on add, -1 on remove
      }
    }
  })

  const tooltipCoords = React.useMemo(() => {
    if (!tooltip) return null
    const anchor = Geo.getAnchor(data, 'center')
    return !anchor ? null : [anchor.longitude, anchor.latitude]
  }, [data, tooltip])

  const onMouseEnter = React.useCallback(
    (e) => {
      onMouseEnterCb && onMouseEnterCb(e)
      if (!tooltipCoords || !tooltipRef.current) return null

      // Ensure that if the map is zoomed out such that multiple
      // copies of the feature are visible, the popup appears
      // over the copy being pointed to.
      while (Math.abs(e.lngLat.lng - tooltipCoords[0]) > 180) {
        tooltipCoords[0] += e.lngLat.lng > tooltipCoords[0] ? 360 : -360
      }

      const p = tooltipRef.current.popup.setLngLat(tooltipCoords).setHTML(tooltip)
      if (tooltipRef.current.counter === 0) p.addTo(map)
      tooltipRef.current.counter++
    },
    [map, onMouseEnterCb, tooltip, tooltipCoords]
  )

  const onMouseLeave = React.useCallback(
    (e) => {
      onMouseLeaveCb && onMouseLeaveCb(e)
      if (!tooltipCoords) return null

      tooltipRef.current.counter--
      if (tooltipRef.current.counter === 0) tooltipRef.current.popup.remove()
    },
    [onMouseLeaveCb, tooltipCoords]
  )

  const [eventHandlers, layerProps] = React.useMemo(() => {
    const eventHandlers = []
    const layerProps = {}
    Object.keys(restProps).forEach((key) => {
      if (key.startsWith('on')) {
        eventHandlers.push({
          event: key.toLowerCase().replace('on', ''),
          handler: restProps[key],
        })
      } else {
        layerProps[key] = restProps[key]
      }
    })
    if (tooltip || onMouseEnterCb)
      eventHandlers.push({
        event: 'mouseenter',
        handler: onMouseEnter,
      })
    if (tooltip || onMouseLeaveCb)
      eventHandlers.push({
        event: 'mouseleave',
        handler: onMouseLeave,
      })
    return [eventHandlers, layerProps]
  }, [onMouseEnter, onMouseEnterCb, onMouseLeave, onMouseLeaveCb, restProps, tooltip])

  React.useLayoutEffect(() => {
    if (doneRef.current || !map || !sourceId || !data) return
    Map.onStyleLoad({ current: map }, doneRef, () => {
      if (!map.getSource(sourceId)) {
        map.addSource(sourceId, {
          type: Constants.TYPE_GEOJSON,
          data: data,
        })
      }

      if (!MapUtil.hasLayer(map, layerId)) {
        MapUtil.addLayer(
          map,
          {
            id: layerId,
            type: type,
            source: sourceId,
            paint: paint,
            layout: layout,
            ...layerProps,
          },
          before
        )
        onLoad({
          layer: layerId,
        })
        eventHandlers.forEach((item) => map.on(item.event, layerId, item.handler))
        if (Constants.DEBUG_VERBOSITY === 'verbose' && layerProps)
          console.debug('Extra layer props', layerProps)
        if (Constants.DEBUG_VERBOSITY === 'verbose' && eventHandlers.length > 0)
          console.debug('Registered event handlers', eventHandlers)
      }
    })

    return () => {
      if (doneRef.current && map && sourceId && map.getSource(sourceId)) {
        eventHandlers.forEach((item) => map.off(item.event, layerId, item.handler))
        MapUtil.removeSourceAndLayers(map, sourceId)
        doneRef.current = false
      }
    }
  })

  return null
}

GeoJsonLayer.propTypes = {
  /**
   * Map instance
   */
  map: PropTypes.object.isRequired,
  /**
   * Source id
   */
  id: PropTypes.string.isRequired,
  /**
   * Type of geojson layer to be created
   */
  type: PropTypes.oneOf(['fill-extrusion', 'fill', 'line', 'symbol']).isRequired,
  /**
   * Url or data string of geojson
   */
  data: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
  /**
   * Mapbox layout object
   */
  layout: PropTypes.object,
  /**
   * Mapbox paint object
   */
  paint: PropTypes.object,
  /**
   * Callback
   */
  onLoad: PropTypes.func,
  /**
   * Callback
   */
  onClick: PropTypes.func,
  /**
   * Before layer id
   */
  before: PropTypes.string,
  /**
   * Whether or not can cast shadow
   */
  canCastShadow: PropTypes.bool,
  /**
   * Tooltip
   */
  tooltip: PropTypes.string,
  /**
   * Callback
   */
  onMouseEnter: PropTypes.func,
  /**
   * Callback
   */
  onMouseLeave: PropTypes.func,
}

GeoJsonLayer.defaultProps = {
  onLoad: () => {},
  onClick: () => {},
  layout: {},
  paint: {},
  before: Constants.PARENT_LAYER_ID,
  canCastShadow: false, // only extrusion can cast shadow
  onMouseEnter: null,
  onMouseLeave: null,
}

// Helper method
GeoJsonLayer.conditionalSettings = (key, prop, hover, select) => {
  const hoverEnabled = hover?.enable || false
  const hoverProp = hover?.[key] || prop
  const selectEnabled = select?.enable || false
  const selectProp = select?.[key] || prop
  if (hoverEnabled && selectEnabled) {
    return [
      'case',
      ['boolean', ['feature-state', 'select'], false],
      selectProp,
      ['boolean', ['feature-state', 'hover'], false],
      hoverProp,
      prop,
    ]
  }

  if (selectEnabled) {
    return ['case', ['boolean', ['feature-state', 'select'], false], selectProp, prop]
  }

  if (hoverEnabled) {
    return ['case', ['boolean', ['feature-state', 'hover'], false], hoverProp, prop]
  }

  return prop
}

export { GeoJsonLayer }
