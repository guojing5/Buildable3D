import React from 'react'
import PropTypes from 'prop-types'
import { Constants } from '../utils/constants'
import { InternalStores } from '../stores'
import { MapSceneCustomData } from './map-scene-custom-data.component'
import { Map } from '../components/mapbox/map.component'

const getDimensionInPixels = (w, full) => {
  if (typeof w === 'string') {
    if (w.endsWith('%')) {
      w = Number(w.replace('%', ''))
      return (w * full) / 100
    }
    if (w.endsWith('px')) {
      w = Number(w.replace('px', ''))
      return w
    }
  } else if (typeof w === 'number') {
    return w
  }
  console.error('unsupported dimension', w)
  return w
}

const wrapperStyle = {
  display: 'flex',
  flexFlow: 'row nowrap',
}

/**
 * Renders 3D model of Additional Dwelling Unit (ADU) on Map
 * @component AduOnMapScene
 * @param {Props} props - React component properties
 * @author Sourabh Soni <https://prolincur.com>
 */
const AduOnMapScene = (props) => {
  const { style, center, ...restProps } = props
  const localRef = React.useRef()
  const [width, height, mapWidth, mapHeight, restStyle] = React.useMemo(() => {
    const { width = window.innerWidth, height = window.innerHeight, ...restStyle } = style
    const containerWidth = getDimensionInPixels(width, window.innerWidth) + 'px'
    const containerHeight = getDimensionInPixels(height, window.innerHeight) + 'px'
    return [containerWidth, containerHeight, containerWidth, containerHeight, restStyle]
  }, [style])

  React.useLayoutEffect(() => {
    const onWindowResize = (e) => {
      const element = localRef.current
      if (element) {
        const rect = element.getBoundingClientRect()
        if (Constants.DEBUG_VERBOSITY === 'minimal') console.debug('resize container', e, rect)
        const w = typeof rect.width === 'number' && rect.width > 0 ? rect.width : width
        // const h = typeof rect.height === 'number' && rect.height > 0 ? rect.height : height

        const mapDiv = Map.containerRef?.current
        if (mapDiv) mapDiv.style.width = w + 'px'

        const mapCanvas = document.getElementsByClassName('mapboxgl-canvas')?.[0]
        if (mapCanvas) {
          mapCanvas.style.width = w + 'px'
          // mapCanvas.width = w
        }

        const map = Map.ref?.current
        if (map) map.resize()
      }
    }
    window.addEventListener('resize', onWindowResize, false)
    return () => {
      window.removeEventListener('resize', onWindowResize)
    }
  }, [localRef, width])

  return (
    <div ref={localRef}>
      <div style={{ width, height, ...restStyle }}>
        <div style={{ ...wrapperStyle }}>
          <MapSceneCustomData
            stores={InternalStores}
            style={{ width: mapWidth, height: mapHeight }}
            center={center || Constants.DEFAULT_CENTER}
            enableFullscreen={false}
            {...restProps}
          />
        </div>
      </div>
    </div>
  )
}

AduOnMapScene.propTypes = {
  /**
   * Id of Property to be rendered
   */
  locationId: PropTypes.string.isRequired,
  /**
   * Coordinates {longitude,latitude} of center of map
   */
  center: PropTypes.shape({
    longitude: PropTypes.number,
    latitude: PropTypes.number,
  }),
  /**
   * Container style
   */
  style: PropTypes.object,
}

AduOnMapScene.defaultProps = {
  style: {},
  center: Constants.DEFAULT_CENTER,
}

export { AduOnMapScene }
