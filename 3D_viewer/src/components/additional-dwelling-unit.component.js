import React from 'react'
import PropTypes from 'prop-types'
import { MapLayerLoader } from './mapbox/map-layer-loader.component'
import { Assets } from '../assets'
import { EditUpdate } from '../utils/edit-update'
import { Model } from '../model/model'
import { setAnimateSpinner } from './spinner.component'

const key = 'adu'

/**
 * Automatically updates the ADU on changes
 * @param {Props} props - React component properties
 * @author Sourabh Soni <https://prolincur.com>
 */
const useAduUpdater = (props) => {
  const { stores, onUpdate } = props
  const selectedAdu = stores?.useStore((state) => state.sources.selectedAduModel)
  const addSourceToStore = stores?.useStore((state) => state.addSourceToStore)
  const visible = stores?.useStore((state) => state.sources.adu?.visible)
  const mode = stores?.useStore((state) => state.sources.mode) || 0
  const mainBuildingFootprint = stores?.useStore(
    (state) => state.sources.mainBuilding?.rawProps?.footprint
  )
  const maxSuite = stores?.useStore((state) => state.sources['maxSuite' + mode])
  const buildableLength = stores?.useStore(
    (state) => state.sources['buildable' + mode]?.derivedProps?.length
  )
  const canonical = stores?.useStore((state) => state.sources.canonical)

  const adu = React.useMemo(() => {
    if (!selectedAdu) return null
    const metadata = Assets.ADU[selectedAdu]
    if (!metadata) return null
    const source = EditUpdate.generateAduSourceFor(
      maxSuite,
      { ...metadata, id: selectedAdu },
      canonical
    )?.[key]
    if (source) {
      EditUpdate.performCheckOnAdu(source, mainBuildingFootprint, buildableLength, canonical)
    }
    return source
  }, [buildableLength, canonical, mainBuildingFootprint, maxSuite, selectedAdu])

  const initialVisibility = React.useMemo(() => {
    return typeof visible === 'boolean' ? visible : Model.getDisplayProperties(key).visible
  }, [visible])

  const source = React.useMemo(() => {
    if (!adu) return null
    return {
      ...adu,
      visible: initialVisibility,
    }
  }, [adu, initialVisibility])

  React.useEffect(() => {
    if (source && addSourceToStore) {
      addSourceToStore(key, source)
      onUpdate()
    }
  }, [addSourceToStore, onUpdate, source])
  return source
}

/**
 * Renders a model of additional dwelling unit
 * @component AdditionalDwellingUnit
 * @param {Props} props - React component properties
 * @author Sourabh Soni <https://prolincur.com>
 */
const AdditionalDwellingUnit = (props) => {
  const { stores, map, onUpdate, onLoad: onLoadCb, ...restProps } = props
  // NOTE: ADU are generated on-the-fly
  const source = useAduUpdater({ stores, onUpdate })

  const updateSpinner = React.useCallback((enabled, timer = 100) => {
    const spinnerId = 'adu-spinner'
    if (timer > 0) {
      setTimeout(() => setAnimateSpinner({ enabled, id: spinnerId }), 100)
    } else {
      setAnimateSpinner({ enabled, id: spinnerId })
    }
  }, [])

  React.useEffect(() => {
    if (source) {
      updateSpinner(true, 0)
      // Auto stop after 5 seconds
      setTimeout(() => updateSpinner(false, 0), 5000)
    }
  }, [source, updateSpinner])

  const onLoad = React.useCallback(
    (data) => {
      onLoadCb && onLoadCb(data)
      updateSpinner(false)
    },
    [onLoadCb, updateSpinner]
  )

  if (!map || !source) return null
  return (
    <MapLayerLoader
      key={key} // constant key
      id={source.id}
      stores={stores}
      map={map}
      source={source}
      onLoad={onLoad}
      {...restProps}
    />
  )
}

AdditionalDwellingUnit.propTypes = {
  map: PropTypes.object,
  stores: PropTypes.object,
}

AdditionalDwellingUnit.defaultProps = {}

export { AdditionalDwellingUnit }
