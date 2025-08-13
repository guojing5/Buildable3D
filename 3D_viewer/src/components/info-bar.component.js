import React from 'react'
import PropTypes from 'prop-types'
import { Constants } from '../utils/constants'

const version = 'v1.3.0'
console.log(`Starting Map 3D Viewer version ${version}`)
/**
 * Renders an information bar
 * @component InfoBar
 * @param {Props} props - React component properties
 * @author Sourabh Soni <https://prolincur.com>
 */
const InfoBar = (props) => {
  const { enabled, stores } = props
  const longitude = stores?.useStore((state) => state.currentCoordinates.longitude)
  const latitude = stores?.useStore((state) => state.currentCoordinates.latitude)
  const zoom = stores?.useStore((state) => state.zoom)
  const pitch = stores?.useStore((state) => state.pitch)
  const bearing = stores?.useStore((state) => state.bearing)
  const sideBarStyle = {
    color: 'rgba(35, 55, 75, 0.9)',
    backgroundColor: '#ffffff',
    padding: '6px 12px',
    fontFamily: 'monospace',
    zIndex: 1,
    position: 'absolute',
    top: 48,
    right: 32,
    margin: '12px',
    borderRadius: '4px',
  }

  const mouseStyle = {
    display: 'table',
    position: 'relative',
    margin: '0px auto',
    wordWrap: 'anywhere',
    whiteSpace: 'pre-wrap',
    padding: '10px',
    border: 'none',
    borderRadius: '4px',
    fontFamily: 'monospace',
    textAlign: 'center',
    color: 'rgba(35, 55, 75, 0.9)',
    backgroundColor: '#ffffff',
  }

  if (!enabled) return null
  return (
    <div style={sideBarStyle}>
      Longitude: {longitude} | Latitude: {latitude} | Zoom: {zoom} | Bearing: {bearing} | Pitch:{' '}
      {pitch} | Version: {version}
      <div id={Constants.DEBUG_POINTER_DIV} style={mouseStyle}></div>
    </div>
  )
}

InfoBar.propTypes = {
  /**
   * Stores object
   */
  stores: PropTypes.object,
  /**
   * Whether enabled or not
   */
  enabled: PropTypes.bool,
}

InfoBar.defaultProps = {
  enabled: true,
}

export { InfoBar }
