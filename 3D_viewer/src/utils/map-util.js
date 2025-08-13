import { Model } from '../model/model'
import { Constants } from './constants'

class MapUtil {
  static addLayer(map, layer, before, visible = null, zoomRange = null) {
    if (!map) return
    map.addLayer(layer, before)
    if (zoomRange) {
      const [minzoom, maxzoom] = zoomRange
      if (minzoom && maxzoom) map.tb.setLayerZoomRange(layer.id, minzoom, maxzoom)
    }
    if (visible !== null) {
      MapUtil.toggleLayer(map, layer.id, visible)
    }
  }

  static getLayerVisibility(map, layerId) {
    if (!map) return false
    if (!MapUtil.hasLayer(map, layerId)) return false
    return map.getLayoutProperty(layerId, 'visibility') === 'visible'
  }

  static toggleLayer(map, layerId, visible) {
    if (!map) return
    if (map.tb) map.tb.toggleLayer(layerId, visible)
    else {
      map.setLayoutProperty(layerId, 'visibility', visible ? 'visible' : 'none')
    }
  }

  static toggleLayersStartWith(map, startWith, visible) {
    if (!map) return
    map
      .getStyle()
      ?.layers?.filter((layer) => layer.id.startsWith(startWith))
      .forEach((layer) => {
        MapUtil.toggleLayer(map, layer.id, visible)
      })
  }

  static toggleLayersEndWith(map, endsWith, visible) {
    if (!map) return
    map
      .getStyle()
      ?.layers?.filter((layer) => layer.id.endsWith(endsWith))
      .forEach((layer) => {
        MapUtil.toggleLayer(map, layer.id, visible)
      })
  }

  static async removeLayer(map, layerId, dispose = true) {
    if (!map) return
    if (map.tb) {
      await map.tb.clear(layerId, dispose)
      map.removeLayer(layerId)
    } else {
      map.removeLayer(layerId)
    }
  }

  static removeSourceAndLayers(map, sourceId) {
    if (!map) return
    map
      .getStyle()
      ?.layers?.filter((layer) => layer.source === sourceId)
      .forEach((layer) => map.removeLayer(layer.id))

    map.removeSource(sourceId)
  }

  static hasLayer(map, layerId) {
    return !!MapUtil.getLayer(map, layerId)
  }

  static getLayer(map, layerId) {
    if (!map) return null
    // NOTE: map.getLayer() method does not sync up fast (especially when deleting and readding the layer with same id)
    const filtered = map.getStyle()?.layers?.filter((layer) => layer.id === layerId)
    if (filtered && filtered.length > 0) return filtered[0]
    return map.getLayer(layerId)
  }
  static getLayersStartWith(map, startWith) {
    if (!map) return null
    return map.getStyle()?.layers?.filter((layer) => layer.id.startsWith(startWith))
  }

  static reorderLayer(map, layerId) {
    if (!layerId) return

    const findInLayers = (array, id) => {
      let found = -1
      array?.forEach((i, index) => {
        if (found > -1) return
        if (i.startsWith(id)) found = index
      })
      return [found > -1 ? array[found] : null, found]
    }

    const layers = MapUtil.getLayersStartWith(map, Constants.PREFIX)?.map((layer) => layer.id)
    if (!layers || layers.length < 1) return

    const sortedLayers = Model.LAYERS_SORTING_ORDER.map((id) => findInLayers(layers, id)[0]).filter(
      (id) => !!id
    )
    if (sortedLayers?.length > 0) {
      const idx = findInLayers(sortedLayers, layerId)[1]
      const before = idx > -1 ? sortedLayers[idx + 1] : null
      if (before) {
        if (Constants.DEBUG_VERBOSITY === 'minimal')
          console.debug(`Moving ${layerId} before ${before}`)
        try {
          map.moveLayer(layerId, before)
        } catch (error) {
          console.error(error)
        }
      }
    }

    MapUtil._initializeThreeboxLayerId()
    if (MapUtil.THREEBOX_LAYER_BEFORE.includes(layerId)) {
      MapUtil._forceThreeboxLayer(map)
    }
  }

  static _initializeThreeboxLayerId() {
    if (!MapUtil.THREEBOX_LAYER_BEFORE) {
      MapUtil.THREEBOX_LAYER_BEFORE = Model.THREEBOX_LAYER_BEFORE.map((id) =>
        Model.generateLayerId(id)
      ).reverse()
    }
  }

  static _forceThreeboxLayer(map) {
    MapUtil._initializeThreeboxLayerId()
    const tbLayer = MapUtil.getLayer(map, 'threebox_layer')
    if (!tbLayer) return

    MapUtil.THREEBOX_LAYER_BEFORE.forEach((layerId) => {
      if (!MapUtil.hasLayer(map, layerId)) return
      try {
        if (Constants.DEBUG_VERBOSITY === 'minimal')
          console.debug(`Moving ${tbLayer.id} before ${layerId}`)
        map.moveLayer(tbLayer.id, layerId)
        return true
      } catch (error) {
        console.error(error)
      }
    })
  }

  static changeLineWidth(map, layerId, lineWidth) {
    if (MapUtil.hasLayer(map, layerId)) {
      map.setPaintProperty(layerId, 'line-width', lineWidth)
    }
  }

  static customizeRoadWidth(map) {
    // Override the default road width of mapbox style
    const factorPrime = 5
    const factorSecondTer = 5
    const factorStreet = 6
    const factorMinor = 2

    MapUtil.changeLineWidth(map, 'road-primary', [
      'interpolate',
      ['exponential', 1.5],
      ['zoom'],
      5,
      0.75 * factorPrime,
      18,
      32 * factorPrime,
    ])

    MapUtil.changeLineWidth(map, 'road-secondary-tertiary', [
      'interpolate',
      ['exponential', 1.5],
      ['zoom'],
      5,
      0.1 * factorSecondTer,
      18,
      26 * factorSecondTer,
    ])

    MapUtil.changeLineWidth(map, 'road-street', [
      'interpolate',
      ['exponential', 1.5],
      ['zoom'],
      12,
      0.5 * factorStreet,
      14,
      2 * factorStreet,
      18,
      18 * factorStreet,
    ])

    MapUtil.changeLineWidth(map, 'road-minor', [
      'interpolate',
      ['exponential', 1.5],
      ['zoom'],
      14,
      ['match', ['get', 'class'], 'track', 1 * factorMinor, 0.5 * factorMinor],
      18,
      12 * factorMinor,
    ])
  }
}

export { MapUtil }
