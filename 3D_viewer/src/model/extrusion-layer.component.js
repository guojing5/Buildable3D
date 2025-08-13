import React from 'react'
import PropTypes from 'prop-types'
import { GeoJsonLayer } from './geojson-layer.component'
import { Constants } from '../utils/constants'

/**
 * Renders MapBox fill-extrusion layer
 * @component Map
 * @param {Props} props - React component properties
 * @author Sourabh Soni <https://prolincur.com>
 */
const ExtrusionLayer = (props) => {
  const {
    visible,
    color,
    hover,
    select,
    animate,
    minzoom,
    offzoom,
    height,
    baseHeight,
    opacity,
    ...restProps
  } = props

  const layout = React.useMemo(() => {
    return visible ? { visibility: 'visible' } : { visibility: 'none' }
  }, [visible])

  const paint = React.useMemo(() => {
    return {
      'fill-extrusion-color': GeoJsonLayer.conditionalSettings('color', color, hover, select),
      'fill-extrusion-opacity': GeoJsonLayer.conditionalSettings('opacity', opacity, hover, select),
      'fill-extrusion-base': baseHeight,
      'fill-extrusion-height':
        animate && minzoom
          ? ['interpolate', ['linear'], ['zoom'], minzoom, 0, minzoom + 0.05, height]
          : height,
    }
  }, [color, hover, select, opacity, baseHeight, animate, minzoom, height])

  return (
    <GeoJsonLayer
      type={'fill-extrusion'}
      layout={layout}
      paint={paint}
      minzoom={minzoom - offzoom}
      canCastShadow={true}
      {...restProps}
    />
  )
}

ExtrusionLayer.propTypes = {
  /**
   * Map instance
   */
  map: PropTypes.object.isRequired,
  /**
   * Whether to display or not
   */
  visible: PropTypes.bool,
  /**
   * Whether to animate the extrusion or not
   */
  animate: PropTypes.bool,
  /**
   * Minimum zoom level to show the extrusion
   */
  minzoom: PropTypes.number,
  /**
   * Zoom level offset to show the extrusion as polygon
   */
  offzoom: PropTypes.number,
  /**
   * Height (fixed or array)
   */
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.arrayOf(PropTypes.string)]),
  /**
   * Base height
   */
  baseHeight: PropTypes.oneOfType([PropTypes.number, PropTypes.arrayOf(PropTypes.string)]),
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
}

ExtrusionLayer.defaultProps = {
  visible: true,
  animate: true,
  minzoom: 17,
  opacity: 0.9,
  height: ['get', 'height'],
  baseHeight: 0,
  color: '#AAA',
  hover: {
    enable: false,
    color: 'lightblue',
    opacity: 0.9,
  },
  select: {
    enable: false,
    color: 'lightgreen',
    opacity: 0.9,
  },
  offzoom: Constants.DEFAULT_EXTRUSION_ZOOM_OFFSET,
}

export { ExtrusionLayer }
