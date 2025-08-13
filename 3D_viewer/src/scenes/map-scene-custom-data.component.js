import React from 'react'
import PropTypes from 'prop-types'
import { MapScene } from './map-scene.component'
import { Api } from '../utils/api'
import { useFlyToFront } from '../hooks/use-fly-to-front.hook'
import { Parcel } from '../components/parcel.component'
import { Buildable } from '../components/buildable.component'
import { MainBuilding } from '../components/main-building.component'
import { AdditionalDwellingUnit } from '../components/additional-dwelling-unit.component'
import { OtherBuildings } from '../components/other-buildings.component'
import { Trees } from '../components/trees.component'
import { ParcelBoundary } from '../components/parcel-boundary.component'
import { MaxConstraintBox } from '../components/max-constraint-box.component'
import { SeparationLine } from '../components/separation-line.component'
import { Setbacks } from '../components/setbacks.component'
import { AngularPlane } from '../components/angular-plane.component'
import { MaxSuiteBox } from '../components/max-suite-box.component'
import { Constants } from '../utils/constants'
import { AutoGenerate } from '../utils/auto-generate'
import { DebugLine } from '../components/debug-line.component'
import { DebugPoint } from '../components/debug-point.component'
import { Assets } from '../assets'
import { DebugMesh } from '../components/debug-mesh.component'
import { MouseUtil } from '../utils/mouse-util'
import { Landscaping } from '../components/landscaping.component'
import { LandscapingRear } from '../components/landscaping-rear.component'
import { ExternalStores } from '../stores'
import { setAnimateSpinner } from '../components/spinner.component'
import { SnappingControl } from '../components/snapping-control.component'
import { DebugUtil } from '../utils/debug-util'

/**
 * Renders 3D model of Additional Dwelling Unit (ADU) on Map
 * @component MapSceneCustomData
 * @param {Props} props - React component properties
 * @author Sourabh Soni <https://prolincur.com>
 */
const MapSceneCustomData = (props) => {
  const {
    center,
    stores,
    locationId,
    visibility,
    onProgress,
    catalogue,
    onClick: onClickCb,
    onUpdate,
    ...restProps
  } = props
  const addSourceToStore = stores?.useStore((state) => state.addSourceToStore)
  const addSourcesToStore = stores?.useStore((state) => state.addSourcesToStore)
  const pushToMessageQueue = stores?.useStore((state) => state.flashMessages.pushToQueue)
  const [apiDone1, setApiDone1] = React.useState(false)
  const [apiDone2, setApiDone2] = React.useState(false)
  const [apiDone3, setApiDone3] = React.useState(false)
  const [apiDone4, setApiDone4] = React.useState(false)

  const hasErrorRef = React.useRef(false)
  const progressRef = React.useRef(0)
  const maxProgressRef = React.useRef(4)
  const loadedItemCounterRef = React.useRef([]) // count upto 18
  const [map, setMap] = React.useState(null)
  const [flyTo, initial] = useFlyToFront({ stores, center })

  const updateSpinner = React.useCallback((enabled, timer = 100) => {
    // Force spinner to stop on errors.
    if (hasErrorRef.current) enabled = false

    if (timer > 0) {
      setTimeout(() => setAnimateSpinner({ enabled }), 100)
    } else {
      setAnimateSpinner({ enabled })
    }
  }, [])

  const updateProgress = React.useCallback(() => {
    const mustSteps = 4
    const safeExtraSteps = 15
    maxProgressRef.current =
      progressRef.current < mustSteps
        ? mustSteps
        : progressRef.current < safeExtraSteps
        ? safeExtraSteps
        : maxProgressRef.current
    progressRef.current += 1
    if (progressRef.current <= maxProgressRef.current) {
      console.debug(`Progress status: ${progressRef.current} out of ${maxProgressRef.current}`)
      onProgress(progressRef.current, maxProgressRef.current)
    } else {
      maxProgressRef.current += 1
      console.debug(`Progress status: ${progressRef.current} out of ${maxProgressRef.current}`)
      onProgress(progressRef.current, maxProgressRef.current)
    }
  }, [onProgress])

  const updateProgressOnError = React.useCallback(
    (error, what) => {
      hasErrorRef.current = true
      updateProgress()
      const msg = (Constants.DEBUG ? error?.message : null) || 'Failed to load ' + what
      pushToMessageQueue?.(msg)
      // Stop the spinner
      updateSpinner(false)
    },
    [pushToMessageQueue, updateProgress, updateSpinner]
  )

  const onLoad = React.useCallback(
    (value) => {
      setMap(value)
      updateProgress()
    },
    [updateProgress]
  )

  React.useMemo(() => {
    if (!catalogue || typeof catalogue !== 'object') return
    Assets.ADU = {
      ...Assets.ADU,
      ...catalogue,
    }
  }, [catalogue])

  React.useMemo(() => {
    if (!Constants.DEBUG || !visibility.debug) visibility.debug = false

    Object.keys(visibility).forEach((key) => {
      const value = visibility[key]
      ExternalStores._setInitialVisibility(key, value)
    })
  }, [visibility])

  React.useLayoutEffect(() => {
    if (apiDone1) return
    DebugUtil.initialize()
    Api.fetchParcelData(center, locationId)
      .then((data) => {
        const { center, ...source } = data
        addSourcesToStore(source)
        flyTo({ center, front: source?.orientationFront?.data })
        setApiDone1(true)
        updateProgress()
      })
      .catch((err) => {
        updateProgressOnError(err, 'parcel')
      })
  }, [
    addSourcesToStore,
    apiDone1,
    center,
    flyTo,
    locationId,
    updateProgress,
    updateProgressOnError,
  ])

  React.useLayoutEffect(() => {
    if (apiDone2) return

    Api.fetchLocalityData(center)
      .then((data) => {
        addSourceToStore('otherBuildings', data)
        setApiDone2(true)
        updateProgress()
      })
      .catch((err) => {
        updateProgressOnError(err, 'locality')
      })
  }, [addSourceToStore, apiDone2, center, updateProgress, updateProgressOnError])

  React.useLayoutEffect(() => {
    if (apiDone3) return

    Api.fetchTreeData(center)
      .then((data) => {
        if (data) addSourceToStore('tree', data)
        setApiDone3(true)
        updateProgress()
      })
      .catch((err) => {
        updateProgressOnError(err, 'trees')
      })
  }, [addSourceToStore, apiDone3, center, updateProgress, updateProgressOnError])

  React.useLayoutEffect(() => {
    if (!apiDone1 || !apiDone2) return
    if (apiDone4) return

    const sources = stores?.useStore.getState().sources
    const genSources = new AutoGenerate(sources).generate()
    if (!isNaN(Number(genSources.canonical?.bearing))) {
      flyTo({ center, bearing: genSources.canonical.bearing })
    }

    if (genSources) addSourcesToStore(genSources)

    setApiDone4(true)
  }, [apiDone1, apiDone2, addSourcesToStore, stores?.useStore, flyTo, center, apiDone4])

  const onClick = React.useCallback(
    (type) => {
      MouseUtil.debounceOnClick(type, onClickCb, 3)
    },
    [onClickCb]
  )

  const onEachLoad = React.useCallback(
    (data) => {
      if (loadedItemCounterRef.current.includes(data)) return

      loadedItemCounterRef.current.push(data)
      updateProgress()
      if (
        hasErrorRef.current ||
        (maxProgressRef.current === progressRef.current && progressRef.current > 16)
      ) {
        updateSpinner(false)
      }
    },
    [updateProgress, updateSpinner]
  )

  React.useLayoutEffect(() => {
    let keepSpinning =
      !apiDone1 ||
      !apiDone2 ||
      !apiDone3 ||
      !apiDone4 ||
      maxProgressRef.current !== progressRef.current
    if (hasErrorRef.current) keepSpinning = false

    if (keepSpinning) updateSpinner(keepSpinning, 0)
    // start spinner immediately
    else updateSpinner(keepSpinning)
  }, [apiDone1, apiDone2, apiDone3, apiDone4, updateSpinner])

  const renderCustomData = () => {
    if (!apiDone1 || !apiDone2 || !apiDone3 || !apiDone4) return null
    return (
      <React.Fragment>
        <Parcel
          map={map}
          stores={stores}
          onClick={() => onClick('parcel')}
          onLoad={() => onEachLoad(1)}
        />
        <ParcelBoundary
          map={map}
          stores={stores}
          onClick={() => onClick('parcel')}
          onLoad={() => onEachLoad(2)}
        />
        <Buildable
          map={map}
          stores={stores}
          which={0}
          onClick={() => onClick('buildable')}
          onLoad={() => onEachLoad(3)}
        />
        <Buildable
          map={map}
          stores={stores}
          which={1}
          onClick={() => onClick('buildable')}
          onLoad={() => onEachLoad(4)}
        />
        <Buildable
          map={map}
          stores={stores}
          which={2}
          onClick={() => onClick('buildable')}
          onLoad={() => onEachLoad(5)}
        />
        <Landscaping
          map={map}
          stores={stores}
          onClick={() => onClick('landscaping')}
          onUpdate={() => onUpdate('landscaping')}
          onLoad={() => onEachLoad(6)}
        />
        <LandscapingRear
          map={map}
          stores={stores}
          onClick={() => onClick('landscaping')}
          onUpdate={() => onUpdate('landscaping')}
          onLoad={() => onEachLoad(7)}
        />

        <MainBuilding
          map={map}
          stores={stores}
          onClick={() => onClick('mainBuilding')}
          onLoad={() => onEachLoad(8)}
        />
        <MaxConstraintBox
          map={map}
          stores={stores}
          onClick={() => onClick('maxConstraintBox')}
          onLoad={() => onEachLoad(9)}
        />
        <AngularPlane
          map={map}
          stores={stores}
          onClick={() => onClick('angularPlane')}
          onLoad={() => onEachLoad(10)}
        />
        <MaxSuiteBox
          map={map}
          stores={stores}
          which={0}
          onClick={() => onClick('maxSuite')}
          onLoad={() => onEachLoad(11)}
        />
        <MaxSuiteBox
          map={map}
          stores={stores}
          which={1}
          onClick={() => onClick('maxSuite')}
          onLoad={() => onEachLoad(12)}
        />
        <MaxSuiteBox
          map={map}
          stores={stores}
          which={2}
          onClick={() => onClick('maxSuite')}
          onLoad={() => onEachLoad(13)}
        />
        <AdditionalDwellingUnit
          map={map}
          stores={stores}
          onClick={() => onClick('adu')}
          onUpdate={() => onUpdate('adu')}
          onLoad={() => onEachLoad(18)}
        />
        <Trees
          map={map}
          stores={stores}
          onClick={() => onClick('tree')}
          onLoad={() => onEachLoad(14)}
        />
        <OtherBuildings
          map={map}
          stores={stores}
          onClick={() => onClick('otherBuildings')}
          onLoad={() => onEachLoad(15)}
        />

        <DebugLine
          map={map}
          stores={stores}
          onClick={() => onClick('debug')}
          onLoad={() => onEachLoad(19)}
        />
        <DebugMesh
          map={map}
          stores={stores}
          onClick={() => onClick('debug')}
          onLoad={() => onEachLoad(20)}
        />
        <DebugPoint
          map={map}
          stores={stores}
          onClick={() => onClick('debug')}
          onLoad={() => onEachLoad(21)}
        />

        <SeparationLine
          map={map}
          stores={stores}
          onClick={() => onClick('separationLine')}
          onUpdate={() => onUpdate('separationLine')}
          onLoad={() => onEachLoad(16)}
        />
        <Setbacks
          map={map}
          stores={stores}
          onClick={() => onClick('setbacks')}
          onLoad={() => onEachLoad(17)}
        />
      </React.Fragment>
    )
  }
  if (!center) return null
  return (
    <MapScene center={center} stores={stores} onLoad={onLoad} {...initial} {...restProps}>
      {renderCustomData()}
      <SnappingControl map={map} stores={stores} />
    </MapScene>
  )
}

MapSceneCustomData.propTypes = {
  /**
   * Coorindates {longitude,latitude} of center of map
   */
  center: PropTypes.shape({
    longitude: PropTypes.number,
    latitude: PropTypes.number,
  }).isRequired,
  /**
   * Container style
   */
  style: PropTypes.object,
  stores: PropTypes.object,
  visibility: PropTypes.object,
  onProgress: PropTypes.func,
  onClick: PropTypes.func,
  onUpdate: PropTypes.func,
}

MapSceneCustomData.defaultProps = {
  style: {},
  stores: null,
  visibility: {},
  onProgress: () => {},
  onClick: () => {},
  onUpdate: () => {},
}

export { MapSceneCustomData }
