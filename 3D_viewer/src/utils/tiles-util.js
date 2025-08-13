import { UrlUtil } from './url-util'

const ALL_TILESET = {
  light: 'light-v10',
  dark: 'dark-v10',
  streets: 'streets-v11',
  satellite: 'satellite-v9',
  outdoors: 'outdoors-v11',
}

const ALL_TILESET_KEYS = Object.keys(ALL_TILESET)

class TilesUtil {
  static ALL_TILESET = ALL_TILESET
  static ALL_TILESET_KEYS = ALL_TILESET_KEYS

  static isValidTileKey(tileKey) {
    return tileKey && ALL_TILESET_KEYS.includes(tileKey)
  }
  static getLastTileKey() {
    const tileKey = UrlUtil.restoreFromStorage('TILESET')
    if (TilesUtil.isValidTileKey(tileKey)) return tileKey
    return 'streets'
  }

  static setLastTileKey(tileKey) {
    if (tileKey) {
      UrlUtil.saveToStorage('TILESET', tileKey)
    }
  }

  static getTilesetUrl(tileKey) {
    if (!TilesUtil.isValidTileKey(tileKey)) tileKey = TilesUtil.getLastTileKey()
    return 'mapbox://styles/mapbox/' + ALL_TILESET[tileKey]
  }
}
export { TilesUtil }
