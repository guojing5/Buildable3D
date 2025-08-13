import React from 'react'
import PropTypes from 'prop-types'
import { MapLayerLoader } from './mapbox/map-layer-loader.component'
import { EditUpdate } from '../utils/edit-update'
import { Model } from '../model/model'

/**
 * Automatically updates a separation line based on changes
 * @param {Props} props - React component properties
 * @author Sourabh Soni <https://prolincur.com>
 */
const useSeparationLineUpdater = (props) => {
  const { stores, onUpdate } = props
  const previewAdu = stores?.useStore((state) => state.sources.adu?.visible)
  const addSourceToStore = stores?.useStore((state) => state.addSourceToStore)
  const visible = stores?.useStore((state) => state.sources.separationLine?.visible)
  const aduFootprint = stores?.useStore((state) => state.sources.adu?.rawProps?.footprint)
  const mode = stores?.useStore((state) => state.sources.mode) || 0
  const msFootprint = stores?.useStore(
    (state) => state.sources['maxSuite' + mode]?.rawProps?.footprint
  )
  const canonical = stores?.useStore((state) => state.sources.canonical)
  const mainBuildingFootprint = stores?.useStore(
    (state) => state.sources.mainBuilding?.rawProps?.footprint
  )

  const selectedFootprint = React.useMemo(() => {
    return previewAdu ? aduFootprint : msFootprint
  }, [aduFootprint, msFootprint, previewAdu])

  const initialSource = React.useMemo(() => {
    if (!mainBuildingFootprint || !selectedFootprint || !canonical) return null
    const result = EditUpdate.computeSeparationLine(
      selectedFootprint,
      mainBuildingFootprint,
      canonical
    )
    return result?.separationLine
  }, [canonical, mainBuildingFootprint, selectedFootprint])

  const initialVisibility = React.useMemo(() => {
    return typeof visible === 'boolean'
      ? visible
      : Model.getDisplayProperties('separationLine').visible
  }, [visible])

  const source = React.useMemo(() => {
    if (!initialSource) return null
    return {
      ...initialSource,
      id: initialSource.id,
      visible: initialVisibility,
    }
  }, [initialSource, initialVisibility])

  React.useEffect(() => {
    if (source && addSourceToStore) {
      addSourceToStore('separationLine', source)
      onUpdate()
    }
  }, [addSourceToStore, onUpdate, source])

  return source
}

/**
 * Renders a separation line (i.e. between primary and additional dwelling units)
 * @component SeparationLine
 * @param {Props} props - React component properties
 * @author Sourabh Soni <https://prolincur.com>
 */
const SeparationLine = (props) => {
  const { stores, map, onUpdate, ...restProps } = props
  // NOTE: separation lines are generated on-the-fly
  const source = useSeparationLineUpdater({ stores, onUpdate })

  if (!map || !source) return null
  return (
    <MapLayerLoader
      key={source.id}
      id={source.id}
      stores={stores}
      map={map}
      source={source}
      {...restProps}
    />
  )
}

SeparationLine.propTypes = {
  map: PropTypes.object,
  stores: PropTypes.object,
}

SeparationLine.defaultProps = {}

export { SeparationLine }
