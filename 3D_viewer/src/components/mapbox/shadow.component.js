import React from 'react'
import PropTypes from 'prop-types'
import { Constants } from '../../utils/constants'
import { MapUtil } from '../../utils/map-util'
import { Map } from '../mapbox/map.component'
import THREE from '../../utils/three-wrapper'
import { MapButtonControl } from './map-button-control'

const ShadowButton = (props) => {
  const { stores, map } = props
  const toggleShadows = stores?.useStore((state) => state.toggleShadows)

  const onClickButton = React.useCallback(() => {
    const current = stores?.useStore?.getState()?.shadow?.enable
    toggleShadows?.(!current)
  }, [stores?.useStore, toggleShadows])

  const buttonData = React.useMemo(() => {
    return [
      {
        className: 'mapboxgl-ctrl-shadow',
        tooltip: 'Shadow',
        onClick: onClickButton,
      },
    ]
  }, [onClickButton])

  return <MapButtonControl key={'shadow'} map={map} buttons={buttonData} anchor={'top-right'} />
}

/**
 * Toggle for shadows
 * @component Shadow
 * @param {Props} props - React component properties
 * @author Sourabh Soni <https://prolincur.com>
 */
const Shadow = (props) => {
  const { stores, map } = props
  const enabled = stores?.useStore((state) => state.shadow.enable)

  const shadowExtrusions = stores?.useStore((state) => state.shadow.extrusions)
  const onceRef = React.useRef(false)
  const offLightsRef = React.useRef(null)
  const onLightsRef = React.useRef(null)

  React.useLayoutEffect(() => {
    if (!map?.tb || !enabled) return

    // One time setup

    if (!onceRef.current) {
      // Reimplement / override
      map.tb.setSunlight = function (newDate = Constants.DEFAULT_SUNTIME, coords) {
        if (offLightsRef.current && onLightsRef.current) return

        if (!this.lights.dirLight) {
          return
        }
        var date = new Date(newDate.getTime())
        if (coords) {
          if (coords.lng && coords.lat) this.mapCenter = coords
          else this.mapCenter = { lng: coords[0], lat: coords[1] }
        } else {
          this.mapCenter = this.map.getCenter()
        }

        if (
          this.lightDateTime &&
          this.lightDateTime.getTime() === date.getTime() &&
          this.lightLng === this.mapCenter.lng &&
          this.lightLat === this.mapCenter.lat
        ) {
          return //setSunLight could be called on render, so due to performance, avoid duplicated calls
        }

        this.lightDateTime = date
        this.lightLng = this.mapCenter.lng
        this.lightLat = this.mapCenter.lat
        this.sunPosition = this.getSunPosition(date, [this.mapCenter.lng, this.mapCenter.lat])
        let altitude = this.sunPosition.altitude
        let azimuth = Math.PI + this.sunPosition.azimuth

        const WORLD_SIZE = 1024000
        let radius = WORLD_SIZE / 2
        let alt = Math.sin(altitude)
        let altRadius = Math.cos(altitude)
        let azCos = Math.cos(azimuth) * altRadius
        let azSin = Math.sin(azimuth) * altRadius

        const previousLights = {}
        Object.keys(this.lights).forEach((k) => {
          previousLights[k] = this.lights[k]?.clone()
        })
        offLightsRef.current = previousLights

        this.lights.dirLight.position.set(azSin, azCos, alt)
        this.lights.dirLight.position.multiplyScalar(radius)

        const SHADOW_MAP_SIZE = 2048
        this.lights.dirLight.shadow.mapWidth = SHADOW_MAP_SIZE
        this.lights.dirLight.shadow.mapHeight = SHADOW_MAP_SIZE
        this.lights.dirLight.shadow.bias = 0.0001
        this.lights.dirLight.intensity = Math.max(alt, 0)
        this.lights.hemiLight.intensity = Math.max(alt * 1, 0.1)

        // Workaround to make shadow less intense. Refer - https://github.com/mrdoob/three.js/pull/14087#issuecomment-431003830
        const reduceIntensity = (light, name) => {
          const light2 = light.clone()
          light2.castShadow = false
          light2.intensity = 1 - light.intensity
          light.parent.add(light2)
          this.lights[name] = light2
        }
        reduceIntensity(this.lights.dirLight, 'reduceLight')

        this.lights.dirLight.updateMatrixWorld()
        this.updateLightHelper()

        onLightsRef.current = { ...this.lights }
      }

      map.tb.realSunlight()
      onceRef.current = true
    }
  }, [enabled, map])

  React.useLayoutEffect(() => {
    if (!map?.tb) return

    const addLights = (lights) => {
      if (!lights) return
      Object.keys(lights).forEach((l) => {
        const light = lights[l]
        map.tb.lights[l] = light
        if (light) {
          map.tb.scene.add(light)
        }
      })
    }

    const removeLights = (lights) => {
      if (!lights) return
      Object.keys(lights).forEach((l) => {
        const light = lights[l]
        map.tb.lights[l] = undefined
        if (light) map.tb.scene.remove(light)
      })
    }

    // toggle
    Map.onStyleLoad({ current: map }, { current: false }, () => {
      if (offLightsRef.current && onLightsRef.current) {
        if (enabled) {
          removeLights(offLightsRef.current)
          addLights(onLightsRef.current)
        } else {
          removeLights(onLightsRef.current)
          addLights(offLightsRef.current)
        }
      }

      map.tb.renderer.shadowMap.enabled = enabled
      map.tb.renderer.shadowMap.type = THREE.PCFSoftShadowMap
      map.tb.world.traverse(function (child) {
        if (child.material) {
          child.material.needsUpdate = true
        }
      })

      map.tb.repaint()
    })
  }, [map, enabled])

  React.useLayoutEffect(() => {
    if (!enabled || !map?.tb) return
    if (!map?.style?.sourceCaches?.composite) {
      // console.error('composite cache not found')
      return
    }

    shadowExtrusions?.forEach((extrusionId) => {
      map.tb.setBuildingShadows({
        layerId: extrusionId + '-shadows',
        buildingsLayerId: extrusionId,
        minAltitude: Constants.DEFAULT_SHADOW_HEIGHT,
      })
    })

    return () => {
      shadowExtrusions?.forEach((extrusionId) => {
        MapUtil.removeLayer(map, extrusionId + '-shadows', true)
      })
    }
  }, [map, enabled, shadowExtrusions])

  return <ShadowButton map={map} stores={stores} />
}

Shadow.propTypes = {
  /**
   * Stores object
   */
  stores: PropTypes.object,
  /**
   * Map instance
   */
  map: PropTypes.object,
  /**
   * Whether enabled or not
   */
}

Shadow.defaultProps = {}

export { Shadow }
