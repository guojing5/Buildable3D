import React from 'react'
import PropTypes from 'prop-types'
import mapboxgl from '!mapbox-gl' // eslint-disable-line import/no-webpack-loader-syntax
import 'mapbox-gl/dist/mapbox-gl.css'
import dotenv from 'dotenv'
import { MapThree } from './map-three.component'
import { Constants } from '../../utils/constants'
import { TilesUtil } from '../../utils/tiles-util'
import { MapUtil } from '../../utils/map-util'

dotenv.config()
// Setup Mapbox
mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN

const onStyleLoad = (mapRef, doneRef, onLoad) => {
  if (!mapRef.current?.isStyleLoaded()) {
    setTimeout(() => onStyleLoad(mapRef, doneRef, onLoad), 200)
  } else {
    // isStyleLoaded might be called multiple times by mapbox - so doneRef ensure we invoke onLoad once
    if (!doneRef.current) {
      doneRef.current = true
      onLoad()
    }
  }
}

const mapRef = React.createRef(null)
const mapContainerRef = React.createRef(null)

/**
 * Renders a Map using MapBox
 * @component Map
 * @param {Props} props - React component properties
 * @author Sourabh Soni <https://prolincur.com>
 */
const Map = (props) => {
  const {
    stores,
    style,
    tileset,
    center,
    zoom,
    minzoom,
    maxzoom,
    pitch,
    bearing,
    bounds,
    enableThree,
    onLoad,
    threeOptions,
    ...restProps
  } = props
  const { latitude, longitude } = center
  const localRef = React.useRef(null)
  const setOrigin = stores?.useStore((state) => state.setOrigin)
  const setCoordinates = stores?.useStore((state) => state.setCurrentCoordinates)
  const setZoom = stores?.useStore((state) => state.setZoom)
  const setPitch = stores?.useStore((state) => state.setPitch)
  const setBearing = stores?.useStore((state) => state.setBearing)
  const onceRef = React.useRef(false)

  React.useEffect(() => {
    setOrigin?.(longitude, latitude)
    setCoordinates?.(longitude, latitude)
    setZoom?.(zoom)
  }, [latitude, longitude, setCoordinates, setOrigin, setZoom, zoom])

  const onMove = React.useCallback(
    (map) => {
      return () => {
        setCoordinates?.(
          Number(map.getCenter().lng.toFixed(4)),
          Number(map.getCenter().lat.toFixed(4))
        )
        setZoom?.(Number(map.getZoom().toFixed(2)))
        setPitch?.(map.getPitch())
        setBearing?.(map.getBearing())
      }
    },
    [setBearing, setCoordinates, setPitch, setZoom]
  )

  React.useLayoutEffect(() => {
    const removeMap = async () => {
      try {
        const tb = window.tb
        const map = mapRef.current
        window.tb = undefined
        map.tb = undefined
        if (tb) {
          await tb.clear()
          await tb.dispose()
        } else {
          map.remove()
        }
      } catch (err) {
        console.error(err)
      }
    }

    // Clean up required - when page is 'back' and 'forward' from browser
    if (
      mapContainerRef.current &&
      localRef.current &&
      mapContainerRef.current !== localRef.current
    ) {
      if (mapRef.current) {
        removeMap()
        mapRef.current = null
        mapContainerRef.current = null
        window.tb = undefined
      }
    }
  })

  React.useEffect(() => {
    const map = mapRef.current
    if (map) return

    const options = {
      center: [longitude, latitude],
      antialias: true,
      pitch: pitch,
      bearing: bearing,
      zoom: zoom,
      maxZoom: maxzoom,
      minZoom: minzoom,
    }
    if (bounds?.longitude && bounds.latitude) {
      options.maxBounds = [
        [longitude - bounds.longitude, latitude - bounds.latitude],
        [longitude + bounds.longitude, latitude + bounds.latitude],
      ]
    }
    mapContainerRef.current = localRef.current
    try {
      mapRef.current = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: TilesUtil.getTilesetUrl(),
        ...options,
        ...restProps,
      })
    } catch (err) {
      if (err.message) {
        alert(err.message)
      }
      return
    }
    mapRef.current.boxZoom?.disable?.()
    mapRef.current.on('move', onMove(mapRef.current))
    onceRef.current = false
    onStyleLoad(mapRef, onceRef, () => {
      // Workaround: Switch off 'building' as the tile data and geojson appear mis-aligned
      MapUtil.toggleLayersStartWith(mapRef.current, 'building', false)
      MapUtil.toggleLayersEndWith(mapRef.current, 'label', false)
      MapUtil.toggleLayer(mapRef.current, 'road-label', true)
      MapUtil.customizeRoadWidth(mapRef.current)
    })

    onLoad(mapRef.current)
  }, [
    latitude,
    longitude,
    onLoad,
    zoom,
    tileset,
    onMove,
    pitch,
    bearing,
    restProps,
    maxzoom,
    minzoom,
    bounds,
    style,
  ])

  return (
    <React.Fragment>
      <div ref={localRef} style={style} />
      {enableThree && <MapThree map={mapRef} {...threeOptions} />}
    </React.Fragment>
  )
}

Map.propTypes = {
  /**
   * Stores object
   */
  stores: PropTypes.object,
  /**
   * Callback invoke on load of map
   */
  onLoad: PropTypes.func,
  /**
   * Container Style
   */
  style: PropTypes.object,
  /**
   * Mapbox tileset name
   * @see https://docs.mapbox.com/api/maps/styles/#mapbox-styles
   */
  tileset: PropTypes.string,
  /**
   * Coordindates {longitude,latitude} of center
   */
  center: PropTypes.shape({
    longitude: PropTypes.number,
    latitude: PropTypes.number,
  }).isRequired,
  /**
   * Zoom level
   */
  zoom: PropTypes.number,
  /**
   * Min zoom level
   */
  minzoom: PropTypes.number,
  /**
   * Max zoom level
   */
  maxzoom: PropTypes.number,
  /**
   * Initial pitch (tilt) of the map in degrees
   */
  pitch: PropTypes.number,
  /**
   * Initial bearing (rotation) of the map in degrees counter-clockwise from north
   */
  bearing: PropTypes.number,
  /**
   * threebox options
   */
  threeOptions: PropTypes.object,
  /**
   * Bounds to restrict panning
   */
  bounds: PropTypes.shape({
    meters: PropTypes.number,
    longitude: PropTypes.number.isRequired,
    latitude: PropTypes.number.isRequired,
  }),
}

Map.defaultProps = {
  onLoad: () => {},
  zoom: Constants.MIN_ZOOM,
  minzoom: Constants.MIN_ZOOM,
  maxzoom: Constants.MAX_ZOOM,
  pitch: 0,
  bearing: 0,
  threeOptions: {},
  bounds: null,
}

Map.onStyleLoad = onStyleLoad
Map.MapboxGl = mapboxgl
Map.ref = mapRef
Map.containerRef = mapContainerRef

export { Map }
