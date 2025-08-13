import React from 'react'
import PropTypes from 'prop-types'
import { MapLayerLoader } from './mapbox/map-layer-loader.component'
import { EditUpdate } from '../utils/edit-update'
import { Model } from '../model/model'
import { Geo } from '../utils/geo'
import { Constants } from '../utils/constants'

/**
 * Automatically updates a landscaping based on changes
 * @param {Props} props - React component properties
 * @author Sourabh Soni <https://prolincur.com>
 */
const useLandscapingRearUpdater = (props) => {
  const { stores, width, onUpdate } = props

  const previewAdu = stores?.useStore((state) => state.sources.adu?.visible)
  const addSourcesToStore = stores?.useStore((state) => state.addSourcesToStore)
  const visible = stores?.useStore((state) => state.sources.landscaping?.visible)
  const aduFootprint = stores?.useStore((state) => state.sources.adu?.rawProps?.footprint)
  const mode = stores?.useStore((state) => state.sources.mode) || 0
  const msFootprint = stores?.useStore(
    (state) => state.sources['maxSuite' + mode]?.rawProps?.footprint
  )
  const canonical = stores?.useStore((state) => state.sources.canonical)
  const frontLineGeom = stores?.useStore((state) => state.sources.orientationFront?.data)
  const parcelGeom = stores?.useStore((state) => state.sources.parcel?.rawProps?.footprint)
  const rearLineGeom = stores?.useStore((state) => state.sources.orientationRear?.data)

  const selectedFootprint = React.useMemo(() => {
    return previewAdu ? aduFootprint : msFootprint
  }, [aduFootprint, msFootprint, previewAdu])

  const key = 'landscaping'
  const suffix = 'Rear'
  const initialSources = React.useMemo(() => {
    if (
      !selectedFootprint ||
      !canonical ||
      !width ||
      !parcelGeom ||
      !rearLineGeom ||
      !frontLineGeom
    )
      return null

    const result = EditUpdate.computeLandscaping(
      selectedFootprint,
      rearLineGeom,
      width,
      frontLineGeom,
      parcelGeom,
      canonical,
      suffix,
      true
    )
    return result
  }, [canonical, frontLineGeom, parcelGeom, rearLineGeom, selectedFootprint, width])

  const initialVisibility = React.useMemo(() => {
    return typeof visible === 'boolean' ? visible : Model.getDisplayProperties(key + suffix).visible
  }, [visible])

  const sources = React.useMemo(() => {
    if (!initialSources) return null
    const sources = {}
    let hasData = false
    if (initialSources[key + suffix]) {
      sources[key + suffix] = {
        ...initialSources[key + suffix],
        visible: initialVisibility,
      }
      hasData = true
    }
    if (initialSources[key + 'Hard' + suffix]) {
      sources[key + 'Hard' + suffix] = {
        ...initialSources[key + 'Hard' + suffix],
        visible: initialVisibility,
      }
      hasData = true
    }
    if (!hasData) return null
    return sources
  }, [initialSources, initialVisibility])

  React.useEffect(() => {
    if (sources && addSourcesToStore) {
      addSourcesToStore(sources)
      onUpdate()
    }
  }, [addSourcesToStore, onUpdate, sources])

  return sources
}

const LandscapingRear = (props) => {
  const { stores, map, onUpdate, ...restProps } = props
  const rearLineGeom = stores?.useStore((state) => state.sources.orientationRear?.data)

  const width = React.useMemo(() => {
    if (!rearLineGeom) return null
    return Geo.length(rearLineGeom) * Constants.BYELAWS_AREA_LANDSCAPING_SOFT_REAR
  }, [rearLineGeom])

  // NOTE: landscaping are generated on-the-fly
  const { landscapingHardRear: sourceHard, landscapingRear: sourceSoft } =
    useLandscapingRearUpdater({ stores, onUpdate, width }) || {}

  if (!map) return null

  return (
    <React.Fragment>
      {sourceHard && (
        <MapLayerLoader
          key={sourceHard.id}
          id={sourceHard.id}
          stores={stores}
          map={map}
          source={sourceHard}
          {...restProps}
        />
      )}
      {sourceSoft && (
        <MapLayerLoader
          key={sourceSoft.id}
          id={sourceSoft.id}
          stores={stores}
          map={map}
          source={sourceSoft}
          {...restProps}
        />
      )}
    </React.Fragment>
  )
}

LandscapingRear.propTypes = {
  map: PropTypes.object,
  stores: PropTypes.object,
}

LandscapingRear.defaultProps = {}

export { LandscapingRear }
