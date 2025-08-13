import React from 'react'
import PropTypes from 'prop-types'
import { GeoJsonLayer } from './geojson-layer.component'

/**
 * Renders MapBox line layer
 * @component Map
 * @param {Props} props - React component properties
 * @author Sourabh Soni <https://prolincur.com>
 */
const LineLayer = (props) => {
  const { visible, color, minzoom, width, gapWidth, dashWidth, opacity, cap, join, ...restProps } =
    props
  const layout = React.useMemo(() => {
    return {
      'line-cap': cap,
      'line-join': join,
      visibility: visible ? 'visible' : 'none',
    }
  }, [cap, join, visible])

  const paint = React.useMemo(() => {
    const paint = {
      'line-color': color,
      'line-width': width,
      'line-gap-width': gapWidth,
    }
    if (dashWidth) paint['line-dasharray'] = [dashWidth, dashWidth]
    return paint
  }, [color, gapWidth, dashWidth, width])

  return (
    <GeoJsonLayer type={'line'} layout={layout} paint={paint} minzoom={minzoom} {...restProps} />
  )
}

LineLayer.propTypes = {
  /**
   * Whether to display or not
   */
  visible: PropTypes.bool,
  /**
   * Color of line
   */
  color: PropTypes.string,
  /**
   * Minimum zoom level to show the extrusion
   */
  minzoom: PropTypes.number,
  /**
   * Opacity
   */
  opacity: PropTypes.oneOfType([PropTypes.number, PropTypes.arrayOf(PropTypes.string)]),
  /**
   * Line width
   */
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.arrayOf(PropTypes.string)]),

  /**
   * line-gap-width
   */
  gapWidth: PropTypes.oneOfType([PropTypes.number, PropTypes.arrayOf(PropTypes.string)]),
  /**
   * Eqi line-dasharray
   */
  dashWidth: PropTypes.number,
  /**
   * line-join
   */
  join: PropTypes.oneOf(['bevel', 'round', 'miter']),
  /**
   * line-cap
   */
  cap: PropTypes.oneOf(['butt', 'round', 'square']),
}

LineLayer.defaultProps = {
  visible: true,
  color: 'black',
  width: 1,
  minzoom: 16,
  opacity: 1,
  gapWidth: 0,
  dashWidth: 0,
  join: 'round',
  cap: 'round',
}

export { LineLayer }
