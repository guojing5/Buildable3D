import React from 'react'
import PropTypes from 'prop-types'
import { GeoJsonLayer } from './geojson-layer.component'
import { Constants } from '../utils/constants'
import { Map } from '../components/mapbox/map.component'

/**
 * Renders MapBox polygon layer
 * @component Map
 * @param {Props} props - React component properties
 * @author Sourabh Soni <https://prolincur.com>
 */
const PolygonLayer = (props) => {
  const {
    map,
    id: sourceId,
    visible,
    color,
    hover,
    select,
    minzoom,
    opacity,
    height,
    hoverHeight,
    selectHeight,
    baseHeight,
    texture,
    ...restProps
  } = props
  const onceRef = React.useRef(false)
  const { data: textureUrl, id: textureIdIn } = texture || {}
  const textureId = textureIdIn || sourceId + '-texture'

  const type = height > 0 ? 'fill-extrusion' : 'fill'
  const layout = React.useMemo(() => {
    return visible ? { visibility: 'visible' } : { visibility: 'none' }
  }, [visible])

  React.useLayoutEffect(() => {
    if (map && textureUrl && !map.hasImage(textureId)) {
      onceRef.current = false
      Map.onStyleLoad({ current: map }, onceRef, () => {
        if (!map.hasImage(textureId)) {
          map.loadImage(textureUrl, (error, image) => {
            if (!error) {
              if (!map.hasImage(textureId)) map.addImage(textureId, image)
            }
          })
        }
      })
    }
  })

  const paint = React.useMemo(() => {
    const paint =
      height > 0
        ? {
            'fill-extrusion-color': GeoJsonLayer.conditionalSettings('color', color, hover, select),
            'fill-extrusion-opacity': GeoJsonLayer.conditionalSettings(
              'opacity',
              opacity,
              hover,
              select
            ),
            'fill-extrusion-base': baseHeight,
            'fill-extrusion-height': height,
          }
        : {
            'fill-color': GeoJsonLayer.conditionalSettings('color', color, hover, select),
            'fill-opacity': GeoJsonLayer.conditionalSettings('opacity', opacity, hover, select),
          }
    if (texture) {
      if (height > 0) {
        paint['fill-extrusion-pattern'] = textureId
        paint['fill-extrusion-height'] = [
          'case',
          ['boolean', ['feature-state', 'select'], false],
          selectHeight,
          ['boolean', ['feature-state', 'hover'], false],
          hoverHeight,
          height,
        ]
      } else paint['fill-pattern'] = textureId
    }
    return paint
  }, [
    height,
    color,
    hover,
    select,
    opacity,
    baseHeight,
    texture,
    textureId,
    selectHeight,
    hoverHeight,
  ])

  return (
    <GeoJsonLayer
      map={map}
      id={sourceId}
      type={type}
      layout={layout}
      paint={paint}
      minzoom={minzoom}
      {...restProps}
    />
  )
}

PolygonLayer.propTypes = {
  /**
   * Whether to display or not
   */
  visible: PropTypes.bool,
  /**
   * Minimum zoom level to show the extrusion
   */
  minzoom: PropTypes.number,
  /**
   * Height - Used as a workaround for hover/selection
   */
  height: PropTypes.number,
  /**
   * Height - Used as a workaround for hover/selection
   */
  hoverHeight: PropTypes.number,
  /**
   * Height - Used as a workaround for hover/selection
   */
  selectHeight: PropTypes.number,
  /**
   * Base height - Used as a workaround for hover/selection - to handle z-fighting
   */
  baseHeight: PropTypes.number,
  /**
   * Opacity
   */
  opacity: PropTypes.number,
  /**
   * Color of extrusion
   */
  color: PropTypes.string,
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
  /**
   * Texture
   */
  texture: PropTypes.object,
}

PolygonLayer.defaultProps = {
  visible: true,
  minzoom: 16,
  height: Constants.DEFAULT_POLYGON_HEIGHT,
  hoverHeight: 10 * Constants.DEFAULT_POLYGON_HEIGHT,
  selectHeight: 10 * Constants.DEFAULT_POLYGON_HEIGHT,
  baseHeight: 0,
  color: 'green',
  hover: {
    enable: false,
    color: 'lightblue',
    opacity: 0.7,
  },
  select: {
    enable: false,
    color: 'lightgreen',
    opacity: 0.7,
  },
  opacity: 0.7,
  texture: null,
}

export { PolygonLayer }
