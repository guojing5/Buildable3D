import React from 'react'
import PropTypes from 'prop-types'
import { GeoJsonLayer } from './geojson-layer.component'
import { Map } from '../components/mapbox/map.component'
import { MeshLayer } from './mesh-layer.component'
import { Constants } from '../utils/constants'
/**
 * Renders MapBox symbol layer
 * @component Map
 * @param {Props} props - React component properties
 * @author Sourabh Soni <https://prolincur.com>
 */
const SymbolLayer = (props) => {
  const {
    id,
    visible,
    minzoom,
    size,
    type,
    icon,
    map,
    data,
    distanceFilter,
    onLoad,
    ...restProps
  } = props
  const { data: iconUrl, type: iconType, id: iconIdIn, ...restIcon } = icon
  const isImage = iconType !== Constants.TYPE_COLLADA
  const iconId = iconIdIn || id + '-icon'
  const [isImageLoaded, setIsImageLoaded] = React.useState(false)
  const [points, setPoints] = React.useState(null)

  const layout = React.useMemo(() => {
    if (isImage) {
      return {
        visibility: visible ? 'visible' : 'none',
        'icon-image': iconId,
        'icon-size': size,
      }
    }
    return {
      visibility: 'none',
    }
  }, [iconId, isImage, size, visible])

  React.useLayoutEffect(() => {
    let isMounted = true
    if (!(!map || !iconUrl || !isImage || isImageLoaded)) {
      Map.onStyleLoad({ current: map }, { current: false }, () => {
        if (map.hasImage(iconId)) {
          if (isMounted) setIsImageLoaded(true)
        } else {
          map.loadImage(iconUrl, (error, image) => {
            if (!error) {
              map.addImage(iconId, image)
              if (isMounted) setIsImageLoaded(true)
            }
          })
        }
      })
    }
    return () => {
      isMounted = false
    }
  }, [iconId, iconUrl, isImage, isImageLoaded, map])

  React.useLayoutEffect(() => {
    const sourceId = id
    if (!(isImage || map.getSource(sourceId) || !map || !sourceId || !data)) {
      Map.onStyleLoad({ current: map }, { current: false }, () => {
        if (!map.getSource(sourceId))
          map.addSource(sourceId, {
            type: Constants.TYPE_GEOJSON,
            data: data,
          })
      })
    }
    return () => {
      if (map && sourceId && map.getSource(sourceId)) {
        map.removeSource(sourceId)
      }
    }
  }, [data, id, isImage, map])

  React.useLayoutEffect(() => {
    let isMounted = true
    if (!isImage) {
      const sourceId = id
      Map.onStyleLoad({ current: map }, { current: false }, () => {
        if (map.getSource(sourceId) && !points) {
          const pts = map
            .getSource(sourceId)
            ?._data.features.map((f) => {
              const coords = f.geometry.coordinates
              return {
                latitude: coords[1],
                longitude: coords[0],
              }
            })
            .filter(distanceFilter)
          if (isMounted) setPoints(pts)
        }
      })
    }
    return () => {
      isMounted = false
    }
  }, [distanceFilter, id, isImage, map, points])

  if (isImage) {
    if (!isImageLoaded) return null
    return (
      <GeoJsonLayer
        type={'symbol'}
        id={id}
        map={map}
        layout={layout}
        minzoom={minzoom}
        data={data}
        onLoad={onLoad}
        {...restProps}
      />
    )
  }

  if (!points) return null
  return (
    <MeshLayer
      key={id}
      map={map}
      id={id}
      data={iconUrl}
      type={iconType}
      origin={points}
      onLoad={onLoad}
      visible={visible}
      {...restProps}
      {...restIcon}
    />
  )
}

SymbolLayer.propTypes = {
  /**
   * Whether to display or not
   */
  visible: PropTypes.bool,
  /**
   * Symbol icon
   */
  icon: PropTypes.object,
  /**
   * Symbol icon size
   */
  size: PropTypes.number,
  /**
   * Minimum zoom level to show the extrusion
   */
  minzoom: PropTypes.number,
  /**
   * Filter out certain point based on their location
   */
  distanceFilter: PropTypes.func,
}

SymbolLayer.defaultProps = {
  visible: true,
  size: 0.1,
  icon: null,
  minzoom: 16,
  distanceFilter: () => true,
}

export { SymbolLayer }
