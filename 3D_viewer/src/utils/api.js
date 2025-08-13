import { Constants } from './constants'
import { Assets } from '../assets'
import { Model } from '../model/model'
import { Geo } from './geo'

const API_URL_PARCEL = Constants.SERVER_URL + Constants.API_PATH_PARCEL
const API_URL_LOCALITY = Constants.SERVER_URL + Constants.API_PATH_LOCALITY
const API_URL_TREE = Constants.SERVER_URL + Constants.API_PATH_TREE
const NO_MODEL_FIELDS = ['id', 'origin']

class Api {
  /**
   * Extract json data from response
   * @param {object} response
   * @returns Promise to json data
   */
  static parseJSON(response) {
    return new Promise((resolve) => {
      if (response) {
        if (response.status === 400) {
          resolve({})
        } else {
          response
            .json()
            .then((json) => {
              if (Constants.DEBUG_VERBOSITY === 'verbose') console.debug('Response', json)
              resolve(json)
            })
            .catch(() => resolve({}))
        }
      } else {
        resolve({})
      }
    })
  }

  static parseGeoObject(object) {
    return Geo.getGeoJson(object)
  }

  static addHeightProp(source, height) {
    // extrusion, extrusion3
    if (source?.displayType?.startsWith('extrusion')) {
      height = height || source.height
      if (height) {
        source.data?.features?.forEach?.((f) => {
          if (f.properties) {
            f.properties.height = height
          }
        })
      }
    }
  }

  static parseModel(key, data, source = null) {
    if (!key) return null
    const object = data?.[key]
    if (!object && !source) return null

    if (!source) source = {}
    if (object?.footprint) source.data = Api.parseGeoObject(object.footprint)

    source = {
      ...source,
      type: Constants.TYPE_GEOJSON,
      id: Model.generateItemId(key),
      ...Model.getDisplayProperties(key),
    }
    Api.addHeightProp(source, object?.height)

    if (object) {
      source.rawProps = {
        ...object,
      }
      source.derivedProps = {}
      const footprint = source.rawProps.footprint
      if (footprint) {
        source.derivedProps.area = Geo.area(footprint)
        source.derivedProps.perimeter = Geo.length(footprint)
      }
    }
    return source
  }

  static parseSources(data, addMore = false) {
    return new Promise((resolve, reject) => {
      const sources = {}
      let isEmpty = true
      Object.keys(data).forEach((key) => {
        if (NO_MODEL_FIELDS.includes(key)) return

        const source = Api.parseModel(key, data)
        if (source) {
          sources[key] = source
          isEmpty = false

          if (!addMore) return

          // Add boundary if available
          let ky = Model.getBoundaryType(key)
          let kSource = Api.parseModel(ky, data, source)
          if (kSource) {
            sources[ky] = kSource
          }

          // Add orientation if available
          ;['left', 'right', 'front', 'rear'].forEach((ot) => {
            ky = Model.getOrientationType(key, ot)
            if (source.rawProps[ot] && ky) {
              sources[ky] = {
                data: source.rawProps[ot],
                type: Constants.TYPE_GEOJSON,
                id: Model.generateItemId(key),
                ...Model.getDisplayProperties(ky),
              }
            }
          })
        }
      })

      if (!isEmpty) {
        const center = data.orientation?.center || null
        if (center) {
          // sources.id = data.id || null
          sources.center = center
        }
        resolve(sources)
      } else resolve(null)
    })
  }

  static parseLocality(array, skipCenter) {
    return new Promise((resolve, reject) => {
      const promises = array?.map((item) => Api.parseSources(item))
      if (promises) {
        Promise.all(promises)
          .then((values) => {
            let nearestToSkipCenter = null
            const diff = { longitude: 180, latitude: 180 }
            let foundExact = false
            const featuresMap = {}
            values.forEach((sources) => {
              if (!sources) return
              const sCenter = sources.center
              if (
                skipCenter &&
                sCenter &&
                skipCenter.latitude === sCenter.latitude &&
                skipCenter.longitude === sCenter.longitude
              ) {
                foundExact = true
                return
              } else if (!foundExact) {
                if (!nearestToSkipCenter) {
                  nearestToSkipCenter = sCenter
                  diff.longitude = Math.abs(skipCenter.longitude - sCenter.longitude)
                  diff.latitude = Math.abs(skipCenter.latitude - sCenter.latitude)
                } else {
                  const dlng = Math.abs(skipCenter.longitude - sCenter.longitude)
                  const dlat = Math.abs(skipCenter.latitude - sCenter.latitude)
                  if (dlng < diff.longitude || dlat < diff.latitude) {
                    diff.longitude = dlng
                    diff.latitude = dlat
                    nearestToSkipCenter = sCenter
                  }
                }
              }
              const featuresArray = sources.mainBuilding?.data?.features
              if (featuresArray) {
                const key = '' + sCenter.longitude + sCenter.latitude
                featuresMap[key] = [...(featuresMap[key] || []), ...featuresArray]
              }
            })
            let features = []
            if (foundExact) {
              Object.keys(featuresMap).forEach((k) => features.push(...featuresMap[k]))
            } else {
              const skipKey = '' + nearestToSkipCenter.longitude + nearestToSkipCenter.latitude
              Object.keys(featuresMap).forEach((k) => {
                if (skipKey !== k) features.push(...featuresMap[k])
              })
            }

            const key = 'otherBuildings'
            const source = {
              data: {
                type: 'FeatureCollection',
                features: features,
              },
              type: Constants.TYPE_GEOJSON,
              id: Model.generateItemId(key),
              ...Model.getDisplayProperties(key),
            }
            resolve(source)
          })
          .catch((err) => reject(err))
      } else reject(new Error('No sources found'))
    })
  }

  static parseTree(data) {
    return new Promise((resolve) => {
      if (!data) resolve(null)
      else {
        if (Object.keys(data).length === 0) {
          resolve(null)
          return
        }
        const key = 'tree'
        const source = {
          data: data,
          type: Constants.TYPE_GEOJSON,
          id: Model.generateItemId(key),
          icon: Assets.TREE[Constants.DEFAULT_TREE_MODEL],
          ...Model.getDisplayProperties(key),
        }
        resolve(source)
      }
    })
  }

  /**
   * Fetch GIS data
   * @param {object} center (latitude, longitude)
   * @param {string} locationId
   * @returns Promise to json data
   */
  static fetchParcelData(center, locationId) {
    const { latitude = '', longitude = '' } = center || {}
    const url = API_URL_PARCEL.replace('__PID__', locationId || '')
      .replace('__LNG__', longitude)
      .replace('__LAT__', latitude)
    return new Promise((resolve, reject) => {
      fetch(url, {
        method: 'get',
        headers: {
          Accept: 'application/json',
        },
      })
        .then(Api.parseJSON)
        .then((data) => Api.parseSources(data, true))
        .then((result) => {
          if (result) resolve(result)
          else reject(new Error('No sources found'))
        })
        .catch((error) => reject(error))
    })
  }

  static fetchLocalityData(center) {
    const around = '&around=' + Constants.DEFAULT_BOUNDS.meters
    const { latitude = '', longitude = '' } = center || {}
    const url = API_URL_LOCALITY.replace('__LNG__', longitude).replace('__LAT__', latitude)
    return new Promise((resolve, reject) => {
      fetch(url + around, {
        method: 'get',
        headers: {
          Accept: 'application/json',
        },
      })
        .then(Api.parseJSON)
        .then((data) => Api.parseLocality(data, center))
        .then((result) => resolve(result))
        .catch((error) => reject(error))
    })
  }

  static fetchTreeData(center) {
    const around = '&around=' + Constants.DEFAULT_BOUNDS.treeMeters
    const { latitude = '', longitude = '' } = center || {}
    const url = API_URL_TREE.replace('__LNG__', longitude).replace('__LAT__', latitude)
    return new Promise((resolve, reject) => {
      fetch(url + around, {
        method: 'get',
        headers: {
          Accept: 'application/json',
        },
      })
        .then(Api.parseJSON)
        .then((data) => Api.parseTree(data, center))
        .then((result) => resolve(result))
        .catch((error) => reject(error))
    })
  }
}

export { Api }
