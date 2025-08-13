import React from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'
import { UrlUtil } from '../../utils/url-util'
import { TilesUtil } from '../../utils/tiles-util'
import { Constants } from '../../utils/constants'

const RADIO_MENU_STYLE = {
  position: 'absolute',
  background: '#FFFFFF',
  color: 'rgba(35, 55, 75, 0.9)',
  padding: '6px 12px',
  fontFamily: 'monospace',
  zIndex: 1,
  top: 0,
  right: 32,
  margin: '12px',
  borderRadius: '4px',
}

/**
 * Toggle dark or lights tiles based on time of the day
 * @component Tiles
 * @param {Props} props - React component properties
 * @author Sourabh Soni <https://prolincur.com>
 */
const Tiles = (props) => {
  const { map } = props
  const selectedRef = React.useRef(TilesUtil.getLastTileKey())
  const elementRef = React.useRef(null)

  const onChangeValue = React.useCallback(
    (event) => {
      if (!map?.tb) return

      const tileKey = event.target.value
      if (selectedRef.current !== tileKey) {
        map.setStyle(TilesUtil.getTilesetUrl(tileKey))
        TilesUtil.setLastTileKey(tileKey)
        // there is no other better way than reload the full page
        UrlUtil.reloadPage()
      }
    },
    [map]
  )

  React.useMemo(() => {
    if (!elementRef.current) elementRef.current = document.getElementById('root')
  }, [])

  const renderButtons = React.useCallback(() => {
    return (
      <div onChange={onChangeValue} style={RADIO_MENU_STYLE}>
        {TilesUtil.ALL_TILESET_KEYS.map((tileKey) => {
          const checked = selectedRef.current === tileKey ? 'checked' : undefined
          return (
            <>
              <input
                key={tileKey}
                id={tileKey}
                type="radio"
                name="rtoggle"
                value={tileKey}
                defaultChecked={checked}
              />
              <label htmlFor={tileKey}>{tileKey}</label>
            </>
          )
        })}
      </div>
    )
  }, [onChangeValue])

  if (!map || !elementRef.current || !Constants.DEBUG) return null
  return ReactDOM.createPortal(renderButtons(), elementRef.current)
}

Tiles.propTypes = {
  /**
   * Map instance
   */
  map: PropTypes.object,
}

Tiles.defaultProps = {}

export { Tiles }
