import React from 'react'
import PropTypes from 'prop-types'
import { MapButtonControl } from './mapbox/map-button-control'
import './mapbox/map-button-control.css'
import { EditUpdate } from '../utils/edit-update'
import { Model } from '../model/model'

const SnappingControl = (props) => {
  const { map, stores } = props
  const separationMode = stores?.useStore((state) => state.sources.mode) || 0 // 0, 1, 2
  const existingAduId = stores?.useStore((state) => state.sources?.selectedAduModel)
  const maxSuite0 = stores?.useStore((state) => state.sources?.maxSuite0)
  const maxSuite1 = stores?.useStore((state) => state.sources?.maxSuite1)
  const maxSuite2 = stores?.useStore((state) => state.sources?.maxSuite2)
  const isDirty = stores?.useStore((state) => state.dirty)

  const [enabled, setEnabled] = React.useState(true)

  const validModes = React.useMemo(() => {
    const validModes = []
    const minMode = existingAduId ? EditUpdate.getModeFor(existingAduId) : 0
    const array = [maxSuite0, maxSuite1, maxSuite2]
    Model.MODES.forEach((i) => {
      if (i < minMode) return
      if (array[i]) {
        validModes.push(i)
      }
    })
    return validModes
  }, [existingAduId, maxSuite0, maxSuite1, maxSuite2])

  const validModeIdx = React.useMemo(() => {
    const idx = validModes.indexOf(separationMode)
    if (idx < 0) return 0
    return idx
  }, [separationMode, validModes])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(() => {
    if (existingAduId) {
      if (!enabled) setEnabled(true)
    } else if (isDirty) {
      let shouldEnable = false
      validModes.forEach((i) => {
        if (EditUpdate.getVisibility('maxSuite' + i)) shouldEnable = true
      })
      if (shouldEnable !== enabled) setEnabled(shouldEnable)
    }
  }, [enabled, existingAduId, isDirty, validModes])

  const moveForward = React.useCallback(() => {
    if (validModeIdx === 0) return
    const newSeparationMode = validModes[validModeIdx - 1]
    if (typeof newSeparationMode === 'number') EditUpdate.updateMode(newSeparationMode)
  }, [validModeIdx, validModes])

  const moveBackward = React.useCallback(() => {
    if (validModeIdx >= validModes.length - 1) return
    const newSeparationMode = validModes[validModeIdx + 1]
    if (typeof newSeparationMode === 'number') EditUpdate.updateMode(newSeparationMode)
  }, [validModeIdx, validModes])

  const buttons = React.useMemo(() => {
    return [
      {
        className: 'mapboxgl-ctrl-arrow-forward',
        tooltip: 'Move forward',
        onClick: moveForward,
        disabled: validModeIdx === 0,
      },
      {
        className: 'mapboxgl-ctrl-bluebox',
        disabled: true,
      },
      {
        className: 'mapboxgl-ctrl-arrow-backward',
        tooltip: 'Move back',
        onClick: moveBackward,
        disabled: validModeIdx >= validModes.length - 1,
      },
    ]
  }, [moveBackward, moveForward, validModeIdx, validModes.length])

  if (!enabled) return null
  return <MapButtonControl map={map} buttons={buttons} anchor={'top-right'} />
}

SnappingControl.propTypes = {
  /**
   * Map instance
   */
  map: PropTypes.object,
}

SnappingControl.defaultProps = {}

export { SnappingControl }
