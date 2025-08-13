import React from 'react'
import PropTypes from 'prop-types'
import { Map } from '../components/mapbox/map.component'
import { useRefWhen } from '../hooks/use-ref-when.hook'
import { InfoBar } from '../components/info-bar.component'
import { NavigationControl } from '../components/mapbox/navigation-control.component'
import { FullscreenControl } from '../components/mapbox/fullscreen-control.component'
import { Constants } from '../utils/constants'
import { PopupFeature } from '../components/mapbox/popup-feature.component'
import { Shadow } from '../components/mapbox/shadow.component'
import { Tiles } from '../components/mapbox/tiles.component'
import { ScaleControl } from '../components/mapbox/scale-control.component'
import { FlashMessage } from '../components/flash-message.component'
import { AppSpinner } from '../components/spinner.component'
import { ResetViewControl } from '../components/mapbox/reset-view-control.component'

const MapScene = (props) => {
  const {
    children,
    style,
    center,
    stores,
    onLoad: onLoadCb,
    enableFullscreen,
    enableScale,
    enableCompass,
    ...restProps
  } = props
  const [mapWRef, WhenMap] = useRefWhen(null)
  const map = mapWRef.get()
  const enableInfoBar = Constants.DEBUG
  const threeOptions = {
    defaultLights: true,
    realSunlight: false,
    sky: Constants.ENABLE_SKY,
    enableTooltips: false,
    enableSelectingFeatures: Constants.ENABLE_SELECTING_FEATURES,
    enableSelectingObjects: Constants.ENABLE_SELECTING_OBJECTS,
    enableDraggingObjects: Constants.ENABLE_DRAGGING_OBJECTS,
    enableDraggingObjectsCustom: Constants.ENABLE_DRAGGING_OBJECTS,
    enableRotatingObjects: Constants.ENABLE_ROTATING_OBJECTS,
    multiLayer: Constants.ENABLE_MULTI_LAYER,
  }
  const onLoad = (value) => {
    if (!map) {
      mapWRef.set(value)
      onLoadCb(value)
    }
  }

  return (
    <React.Fragment>
      <Map
        style={style}
        center={center}
        onLoad={onLoad}
        stores={stores}
        enableThree={true}
        threeOptions={threeOptions}
        {...restProps}
      />
      <WhenMap>
        {enableCompass && <NavigationControl map={map} />}
        {enableScale && <ScaleControl map={map} />}
        {enableFullscreen && <FullscreenControl map={map} />}
        <ResetViewControl map={map} stores={stores} />
        <Shadow map={map} stores={stores} />
        {children}
        <PopupFeature map={map} />
        <Tiles map={map} />
      </WhenMap>
      {enableInfoBar && <InfoBar stores={stores} />}
      <FlashMessage stores={stores} />
      <AppSpinner style={style} />
    </React.Fragment>
  )
}

MapScene.propTypes = {
  children: PropTypes.node,
  center: PropTypes.shape({
    longitude: PropTypes.number,
    latitude: PropTypes.number,
  }).isRequired,
  style: PropTypes.object,
  stores: PropTypes.object,
  onLoad: PropTypes.func,
  enableFullscreen: PropTypes.bool,
  enableScale: PropTypes.bool,
  enableCompass: PropTypes.bool,
}

MapScene.defaultProps = {
  style: {},
  stores: null,
  onLoad: () => {},
  enableFullscreen: true,
  enableScale: true,
  enableCompass: true,
}

export { MapScene }
