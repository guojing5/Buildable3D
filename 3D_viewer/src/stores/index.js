import { Model } from '../model/model'
import { Constants } from '../utils/constants'
import { DebugUtil } from '../utils/debug-util'
import { EditUpdate } from '../utils/edit-update'
import { MapStore } from './map.store'

const InternalStores = MapStore

const ORIENTATION_LIST = [
  Model.LEFT_SUFFIX,
  Model.RIGHT_SUFFIX,
  Model.REAR_SUFFIX,
  Model.FRONT_SUFFIX,
]

const DEBUG_ONLY = [Model.LEFT_SUFFIX, Model.RIGHT_SUFFIX, Model.FRONT_SUFFIX]

const toInternalKeys = (key) => {
  switch (key) {
    case 'buildable':
    case 'maxSuite':
    case 'maxAdu':
      return [key]
    case 'landscaping':
      return ['landscaping', 'landscapingRear', 'landscapingHardRear']
    case 'setbacks':
      return ORIENTATION_LIST.map((k) => {
        if (!DEBUG_ONLY.includes(k) || Constants.DEBUG) return 'setback' + k
        return null
      }).filter((item) => !!item)
    case 'debug':
      return [
        'maxConstraintBox',
        ...DEBUG_ONLY.map((id) => 'orientation' + id),
        ...DEBUG_ONLY.map((id) => 'setback' + id),
        // 'maxAdu0',
        // 'maxAdu1',
        // 'maxAdu2',
        'debugLine',
        'debugPoint',
      ]
    default:
      return [key]
  }
}

InternalStores.fromExternalKey = toInternalKeys

class ExternalStores {
  static setVisibility(key, value) {
    const VALID_KEYS = [
      'buildable',
      'setbacks',
      'maxSuite',
      'angularPlane',
      'landscaping',
      'maxConstraintBox',
      ...Model.getSortedTypes(),
    ]
    if (Constants.DEBUG) VALID_KEYS.push('debugLine')

    toInternalKeys(key).forEach((intKey) => {
      switch (intKey) {
        case 'adu':
          console.error(
            'Instead of setVisibility("adu", [true|false]), use previewAdu([selectedAduId | false]).'
          )
          break
        case 'buildable':
        case 'maxSuite':
        case 'maxAdu':
          EditUpdate.setVisibilityMulti(intKey, value)
          break
        default:
          EditUpdate.setVisibility(intKey, value)
          break
      }
    })

    if (!VALID_KEYS.includes(key))
      throw new Error(`Invalid key: ${key}. Valid keys are ${JSON.stringify(VALID_KEYS)}`)
  }
  static _setInitialVisibility(key, value) {
    const VALID_KEYS = [
      'debug',
      'buildable',
      'setbacks',
      'maxSuite',
      'angularPlane',
      'landscaping',
      'maxConstraintBox',
      ...Model.getSortedTypes(),
    ]
    if (Constants.DEBUG) {
      VALID_KEYS.push('debugLine')
      VALID_KEYS.push('debug')
    }

    toInternalKeys(key).forEach((intKey) => {
      switch (intKey) {
        case 'adu':
          // skip
          break
        case 'buildable':
        case 'maxSuite':
        case 'maxAdu':
          EditUpdate.setInitialVisibilityMulti(intKey, value) // 0/1/2
          break
        default:
          EditUpdate.setInitialVisibility(intKey, value)
          break
      }
    })

    if (!VALID_KEYS.includes(key))
      throw new Error(`Invalid key: ${key}. Valid keys are ${JSON.stringify(VALID_KEYS)}`)
  }

  static previewAdu(id) {
    EditUpdate.updateStateForPreview(id)
  }

  static setSeparationMode(mode) {
    if (mode === 0 || mode === 1 || mode === 2) {
      EditUpdate.updateMode(mode)
    } else {
      console.error('Invalid input to setSeparationMode(0|1|2])', mode)
    }
  }

  static getSeparationMode() {
    return EditUpdate.getActiveMode()
  }

  static toggleShadows(value) {
    MapStore.useStore.getState().toggleShadows(value)
  }

  static _getGeoJson() {
    // Only for debugging purposes
    return DebugUtil.getGeoJson()
  }

  static getState(key) {
    const VALID_KEYS = [
      'buildable',
      'setbacks',
      'maxSuite',
      'angularPlane',
      'separationLine',
      'landscaping',
      'adu',
    ]
    if (Constants.DEBUG) VALID_KEYS.push('debugLine')
    const getSource = (key) => {
      return MapStore.useStore.getState().sources[key]
    }
    if (!VALID_KEYS.includes(key))
      throw new Error(`Invalid key: ${key}. Valid keys are ${JSON.stringify(VALID_KEYS)}`)

    const result = {}
    switch (key) {
      case 'setbacks':
        ORIENTATION_LIST.forEach((k) => {
          if (!DEBUG_ONLY.includes(k) || Constants.DEBUG) {
            let gap = getSource('setback' + k)?.derivedProps?.gap
            if (gap) {
              k = k.toLowerCase()
              if (!result.setbacks) result.setbacks = {}
              result.setbacks[k] = gap
            }
          }
        })
        break
      case 'buildable':
      case 'maxSuite':
      case 'maxAdu':
        toInternalKeys(key).forEach((intKey) => {
          result[key] = getSource(intKey + EditUpdate.getActiveMode())?.derivedProps || {}
        })
        break
      case 'landscaping':
        result[key] = {}
        const keyMap = {
          landscaping: 'soft',
          landscapingHard: 'hard',
          landscapingRear: 'rearSoft',
          landscapingHardRear: 'rearHard',
        }
        toInternalKeys(key).forEach((intKey) => {
          let k = keyMap[intKey]
          let derivedProps = getSource(intKey)?.derivedProps
          if (derivedProps) result[key][k] = derivedProps

          intKey = intKey + EditUpdate.getActiveMode()
          k = keyMap[intKey]
          derivedProps = getSource(intKey)?.derivedProps
          if (derivedProps) result[key][k] = derivedProps
        })
        break
      case 'adu':
        toInternalKeys(key).forEach((intKey) => {
          result[intKey] = getSource(intKey)?.derivedProps || {}
        })
        if (result.adu?.validation) {
          const v = result.adu.validation
          const angularPlane = !EditUpdate.checkAduMeshIntersectAngularPlaneMesh()
          result.adu = {
            ...result.adu,
            validation: {
              ...v,
              angularPlane,
            },
          }
        }

        break
      default:
        toInternalKeys(key).forEach((intKey) => {
          result[intKey] = getSource(intKey)?.derivedProps || {}
        })
        break
    }
    return result
  }
}

// For debugging only
if (Constants.DEBUG) {
  window.ViewerControl = ExternalStores
}

export { ExternalStores, InternalStores }
