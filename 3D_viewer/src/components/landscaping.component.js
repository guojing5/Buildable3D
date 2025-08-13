import React from 'react'
import PropTypes from 'prop-types'
import { MapLayerLoader } from './mapbox/map-layer-loader.component'
import { EditUpdate } from '../utils/edit-update'
import { Model } from '../model/model'
import { Geo } from '../utils/geo'

/**
 * Automatically updates a landscaping based on changes
 * @param {Props} props - React component properties
 * @author Sourabh Soni <https://prolincur.com>
 */
const useLandscapingUpdater = (props) => {
  const { stores, width, onUpdate } = props
  const previewAdu = stores?.useStore((state) => state.sources.adu?.visible)
  const addSourceToStore = stores?.useStore((state) => state.addSourceToStore)
  const visible = stores?.useStore((state) => state.sources.landscaping?.visible)
  const aduFootprint = stores?.useStore((state) => state.sources.adu?.rawProps?.footprint)
  const mode = stores?.useStore((state) => state.sources.mode) || 0
  const msFootprint = stores?.useStore(
    (state) => state.sources['maxSuite' + mode]?.rawProps?.footprint
  )
  const canonical = stores?.useStore((state) => state.sources.canonical)
  const mainBuildingFootprint = stores?.useStore(
    (state) => state.sources.mainBuilding?.rawProps?.footprint
  )
  const frontLineGeom = stores?.useStore((state) => state.sources.orientationFront?.data)
  const parcelGeom = stores?.useStore((state) => state.sources.parcel?.rawProps?.footprint)

  const selectedFootprint = React.useMemo(() => {
    return previewAdu ? aduFootprint : msFootprint
  }, [aduFootprint, msFootprint, previewAdu])

  const initialSource = React.useMemo(() => {
    if (
      !mainBuildingFootprint ||
      !selectedFootprint ||
      !canonical ||
      !width ||
      !parcelGeom ||
      !frontLineGeom
    )
      return null

    const result = EditUpdate.computeLandscaping(
      mainBuildingFootprint,
      selectedFootprint,
      width,
      frontLineGeom,
      parcelGeom,
      canonical
    )
    return result?.landscaping
  }, [canonical, frontLineGeom, mainBuildingFootprint, parcelGeom, selectedFootprint, width])

  const initialVisibility = React.useMemo(() => {
    return typeof visible === 'boolean'
      ? visible
      : Model.getDisplayProperties('landscaping').visible
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
      addSourceToStore('landscaping', source)
      onUpdate()
    }
  }, [addSourceToStore, onUpdate, source])

  return source
}

/**
 * Renders a landscaping (i.e. between primary and additional dwelling units)
 * @component Landscaping
 * @param {Props} props - React component properties
 * @author Sourabh Soni <https://prolincur.com>
 */
const Landscaping = (props) => {
  const { stores, map, onUpdate, ...restProps } = props
  const frontLineGeom = stores?.useStore((state) => state.sources.orientationFront?.data)

  const width = React.useMemo(() => {
    if (!frontLineGeom) return null
    return EditUpdate.getLandscapingWidth(Geo.length(frontLineGeom))
  }, [frontLineGeom])

  // NOTE: landscaping are generated on-the-fly
  const source = useLandscapingUpdater({ stores, onUpdate, width })

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

Landscaping.propTypes = {
  map: PropTypes.object,
  stores: PropTypes.object,
}

Landscaping.defaultProps = {}

export { Landscaping }
