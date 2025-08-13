import React from 'react'
import PropTypes from 'prop-types'

/**
 * Wrapper to create button control in mapbox -gl
 * @see https://stackoverflow.com/a/51683226
 * @author Sourabh Soni <https://prolincur.com>
 */
class _MapButtonControl {
  constructor(params) {
    if (Array.isArray(params)) {
      this.params = params
    } else {
      this.params = [params]
    }
    this.className = params.className
    this.tooltip = params.tooltip
    this.onClick = params.onClick
  }

  onAdd(map) {
    this._container = document.createElement('div')
    this._container.className = 'mapboxgl-ctrl-group mapboxgl-ctrl-group-horizontal mapboxgl-ctrl'
    this.params.forEach((param) => {
      const { className = '', tooltip = '', onClick = () => {}, disabled = false } = param || {}

      const btn = document.createElement('button')
      btn.className = 'mapboxgl-ctrl-icon ' + className
      btn.type = 'button'
      btn.title = tooltip
      btn.onclick = onClick
      if (disabled) btn.disabled = true
      this._container.appendChild(btn)
    })

    return this._container
  }

  onRemove() {
    this._container.parentNode.removeChild(this._container)
    this._map = undefined
  }
}
/**
 * Add a button in mapbox viewer
 * @component MapButtonControl
 * @param {Props} props - React component properties
 * @author Sourabh Soni <https://prolincur.com>
 */
const MapButtonControl = (props) => {
  const { map, anchor, buttons } = props
  React.useLayoutEffect(() => {
    if (map) {
      const control = new _MapButtonControl(buttons)

      map.addControl(control, anchor)

      return () => {
        map.removeControl(control)
      }
    }
  }, [anchor, buttons, map])

  return null
}

MapButtonControl.propTypes = {
  /**
   * Map instance
   */
  map: PropTypes.object,
  /**
   * Buttons
   */
  buttons: PropTypes.arrayOf(
    PropTypes.shape({
      /**
       * CSS class name
       */
      className: PropTypes.string,
      /**
       * Tool tip
       */
      tooltip: PropTypes.string,
      /**
       * Callback on click
       */
      onClick: PropTypes.func,
    })
  ),
  /**
   * Anchor position for button
   */
  anchor: PropTypes.oneOf(['top-right', 'bottom-right', 'bottom-left', 'top-left']),
}

MapButtonControl.defaultProps = {
  map: null,
  buttons: [],
  anchor: 'top-right',
}

export { MapButtonControl }
