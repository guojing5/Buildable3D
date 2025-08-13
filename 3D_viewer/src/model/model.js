import { Assets } from '../assets'
import { Constants } from '../utils/constants'

const MODES = [0, 1, 2]
const BOUNDARY_SUFFIX = 'Boundary'
const LEFT_SUFFIX = 'Left'
const RIGHT_SUFFIX = 'Right'
const FRONT_SUFFIX = 'Front'
const REAR_SUFFIX = 'Rear'
const Z_FIGHTING_DATA = {
  parcel: 1,
  landscaping: 2,
  landscapingHard: 2,
  buildable: 3,
  maxSuite: 4,
}

const SORTED_ONTOLOGY_ID = [
  'laneway', // Behind
  'street',
  'parcel' + BOUNDARY_SUFFIX, // line

  'parcel', // 3d

  'landscapingHardRear',
  'landscapingRear', // soft
  'landscaping',

  'buildable2',
  'buildable1',
  'buildable0',

  'angularPlane', // 3d
  'maxAdu0',
  'maxAdu1',

  'mainBuilding',
  'maxConstraintBox',
  'maxSuite2',
  'maxSuite1',
  'maxSuite0',
  'adu',
  'tree',
  'otherBuildings', // front
  'debugLine',
  'debugPoint',
  'debugMesh',

  // threebox_layer -- ends here

  'separationLine',

  'setback' + REAR_SUFFIX,
  'setback' + FRONT_SUFFIX,
  'setback' + LEFT_SUFFIX,
  'setback' + RIGHT_SUFFIX,

  'orientation', // 2d mapbox
  'orientation' + FRONT_SUFFIX,
  'orientation' + REAR_SUFFIX,
  'orientation' + LEFT_SUFFIX,
  'orientation' + RIGHT_SUFFIX,
]

const THREEBOX_LAYER_BEFORE = [
  'separationLine',

  'setback' + REAR_SUFFIX,
  // 'setback' + FRONT_SUFFIX,
  // 'setback' + LEFT_SUFFIX,
  // 'setback' + RIGHT_SUFFIX,

  // 'orientation', // 2d mapbox
  // 'orientation' + FRONT_SUFFIX,
  // 'orientation' + REAR_SUFFIX,
  // 'orientation' + LEFT_SUFFIX,
  // 'orientation' + RIGHT_SUFFIX,
]

/**
 * Fixed ontology
 */
const ONTOLOGY = [
  // Laneway
  {
    id: 'laneway',
    displayProps: {
      displayType: 'line',
      color: 'black',
      visible: false, // NOT USED
    },
  },
  // Street - NOT USED
  {
    id: 'street',
    displayProps: {
      displayType: 'line',
      color: 'black',
      visible: false, // NOT USED
    },
  },
  // Parcel
  {
    id: 'parcel',
    displayProps: {
      displayType: 'polygon3',
      color: '#D6F9AB',
      opacity: 0.75,
      texture: Assets.textures.parcelGrass,
      baseHeight: Z_FIGHTING_DATA.parcel * Constants.DEFAULT_Z_FIGHTING_OFFSET,
      renderOrder: Z_FIGHTING_DATA.parcel,
      visible: true,
      tooltip: '', // 'Lot',
      receiveShadow: true,
    },
  },
  // Parcel Boundary
  {
    id: 'parcel' + BOUNDARY_SUFFIX,
    displayProps: {
      displayType: 'line',
      color: 'black', // '#8931EF',
      width: 2,
      visible: true,
      tooltip: 'Lot lines',
    },
  },
  // Soft Landscaping
  {
    id: 'landscaping',
    displayProps: {
      displayType: 'polygon3',
      color: '#D6F9AB',
      opacity: 1.0,
      texture: Assets.textures.landscapingAreaGrass,
      visible: true,
      tooltip: 'Landscaping',
      baseHeight: Z_FIGHTING_DATA.landscaping * Constants.DEFAULT_Z_FIGHTING_OFFSET,
      renderOrder: Z_FIGHTING_DATA.landscaping,
      receiveShadow: true,
    },
  },
  // Hard Landscaping Rear
  {
    id: 'landscapingHardRear',
    displayProps: {
      displayType: 'polygon3',
      color: '#D6F9AB',
      opacity: 0.9,
      texture: Assets.textures.landscapingAreaHardLandscape,
      visible: true,
      tooltip: 'Landscaping',
      baseHeight: Z_FIGHTING_DATA.landscapingHard * Constants.DEFAULT_Z_FIGHTING_OFFSET,
      renderOrder: Z_FIGHTING_DATA.landscapingHard,
      receiveShadow: true,
    },
  },
  // Setbacks left
  {
    id: 'orientation' + LEFT_SUFFIX,
    displayProps: {
      displayType: 'line',
      color: 'black', // '#FFE814',
      width: 2,
      dashWidth: 5,
      visible: true,
      tooltip: 'Setbacks',
    },
  },
  // Setbacks Right
  {
    id: 'orientation' + RIGHT_SUFFIX,
    displayProps: {
      displayType: 'line',
      color: 'black', // '#FFE814',
      width: 2,
      dashWidth: 5,
      visible: true,
      tooltip: 'Setbacks',
    },
  },
  // Front (for debugging)
  {
    id: 'orientation' + FRONT_SUFFIX,
    displayProps: {
      displayType: 'line',
      color: 'black', // '#FFE814',
      width: 2,
      dashWidth: 5,
      visible: true,
      tooltip: 'Setbacks',
    },
  },
  // Rear
  {
    id: 'orientation' + REAR_SUFFIX,
    displayProps: {
      displayType: 'line',
      color: 'black', // '#FFE814',
      width: 2,
      dashWidth: 5,
      visible: true,
      tooltip: 'Setbacks',
      //baseHeight: Z_FIGHTING_DATA.setbacks * Constants.DEFAULT_Z_FIGHTING_OFFSET,
      //renderOrder: Z_FIGHTING_DATA.setbacks,
    },
  },
  // Buildable Area - modes -> 0/1/2
  {
    id: 'buildable',
    displayProps: {
      displayType: 'polygon3',
      color: '#FFFFFF',
      texture: Assets.textures.buildableArea,
      baseHeight: Z_FIGHTING_DATA.buildable * Constants.DEFAULT_Z_FIGHTING_OFFSET,
      renderOrder: Z_FIGHTING_DATA.buildable,
      opacity: 0.9,
      visible: true,
      tooltip: 'Buildable area',
      receiveShadow: true,
    },
  },
  // Maximum ADU  modes -> 0/1/2
  {
    id: 'maxAdu',
    displayProps: {
      displayType: 'extrusion3',
      edges: 'only',
      color: '#1862F7',
      visible: false, // NOT Used
      width: 2,
      castShadow: false,
      receiveShadow: true,
      select: {
        enable: false,
      },
      tooltip: 'Max ADU',
    },
  },
  // Max Suite - modes -> 0/1/2
  {
    id: 'maxSuite',
    displayProps: {
      displayType: 'mesh',
      baseHeight: Z_FIGHTING_DATA.maxSuite * Constants.DEFAULT_Z_FIGHTING_OFFSET,
      renderOrder: Z_FIGHTING_DATA.maxSuite,
      edges: 'none',
      color: '#1862F7',
      opacity: 0.25,
      visible: true,
      width: 2,
      enableDragging: true, // hover/selecting will happen automatically

      castShadow: false,
      hover: {
        enable: true,
        color: '#041A76',
        opacity: 0.25,
      },
      select: {
        enable: true,
        color: '#38DBFF',
        opacity: 0.25,
      },
      tooltip: 'Maximum suite size',
      enableBbox: false,
    },
  },
  {
    id: 'maxConstraintBox',
    displayProps: {
      displayType: 'mesh',
      edges: 'none',
      color: 'orange',
      opacity: 0.9,
      visible: true,
      hover: {
        enable: true,
        color: '#9CEEFF',
        opacity: 1.0,
      },
      select: {
        enable: true,
        color: '#38DBFF',
        opacity: 1.0,
      },
      // enableDragging: true,// hover/selecting will happen automatically
      enableBbox: false,
      tooltip: 'Constraint Box',
    },
  },
  // Angular Plane
  {
    id: 'angularPlane',
    displayProps: {
      displayType: 'mesh',
      color: '#ff00bd',
      opacity: 0.25,
      visible: true,
      edges: 'none',
      tooltip: 'Angular plane',
      renderOrder: 1,
    },
  },
  // Separation line
  {
    id: 'separationLine',
    displayProps: {
      displayType: 'line',
      color: 'black',
      width: 2,
      visible: true,
      tooltip: 'Separation distance',
    },
  },
  // Footprint of existing buildings
  {
    id: 'otherBuildings',
    displayProps: {
      displayType: 'extrusion',
      // As per color specification - Neighbouring houses color
      color: '#F2F3F8',
      opacity: 1.0,
      visible: true,
    },
  },
  // Footprint of Main unit
  {
    id: 'mainBuilding',
    displayProps: {
      displayType: 'extrusion3',
      // As per color specification - Main house color
      castShadow: true,
      color: '#D7DBEA',
      opacity: 1.0,
      visible: true,
      edges: 'visible',
      select: {
        enable: false,
      },
      tooltip: '', // 'Principal residence',
    },
  },
  // 3D Model of the ADU
  {
    id: 'adu',
    displayProps: {
      displayType: 'mesh',
      visible: true,
      castShadow: true,
      hover: {
        enable: true,
        opacity: 0.95,
      },
      select: {
        enable: true,
        opacity: 0.9,
      },
      enableDragging: true, // hover/selecting will happen automatically
      tooltip: 'Laneway suite',
    },
  },
  // Tree
  {
    id: 'tree',
    displayProps: {
      displayType: 'symbol',
      visible: true,
      select: {
        enable: false,
      },
      castShadow: true,
    },
  },
]

class Model {
  static ONTOLOGY = ONTOLOGY

  static _replicateForSuffix(id, suffix) {
    Model.ONTOLOGY.push({
      ...Model.ONTOLOGY.filter((item) => item.id === id)[0],
      id: id + suffix,
    })
    // Clone displayProps
    Model.ONTOLOGY[Model.ONTOLOGY.length - 1].displayProps = {
      ...Model.ONTOLOGY[Model.ONTOLOGY.length - 1].displayProps,
    }
  }
  static _replicateForModes(id) {
    const template = Model.ONTOLOGY.filter((item) => item.id === id)[0]
    if (template) {
      const defaultMode = 0
      MODES.forEach((mode) => {
        const hide = mode !== defaultMode ? { visible: false } : {}
        Model.ONTOLOGY.push({
          ...template,
          id: template.id + mode,
        })
        // Clone displayProps and hide if needed
        Model.ONTOLOGY[Model.ONTOLOGY.length - 1].displayProps = {
          ...Model.ONTOLOGY[Model.ONTOLOGY.length - 1].displayProps,
          ...hide,
        }
      })
    }
  }
  static getSortedTypes() {
    return SORTED_ONTOLOGY_ID
  }
  static getBoundaryType(id) {
    const key = id + BOUNDARY_SUFFIX
    return SORTED_ONTOLOGY_ID.filter((item) => item === key)?.[0]
  }
  static getOrientationType(id, type) {
    let suffix = null
    switch (type) {
      case 'left':
        suffix = LEFT_SUFFIX
        break
      case 'right':
        suffix = RIGHT_SUFFIX
        break
      case 'front':
        suffix = FRONT_SUFFIX
        break
      case 'rear':
        suffix = REAR_SUFFIX
        break
      default:
        break
    }
    if (!suffix) return null
    const key = id + suffix
    return SORTED_ONTOLOGY_ID.filter((item) => item === key)?.[0]
  }

  /**
   * Default Properties
   * @param {string} id
   * @returns Default properties
   */
  static getProperties(id) {
    const filtered = Model.ONTOLOGY.filter((item) => item.id === id)
    return { ...filtered[0] }
  }
  /**
   *
   * @param {string} id
   * @returns Default display properties
   */
  static getDisplayProperties(id) {
    const properties = Model.getProperties(id)
    return properties?.displayProps || {}
  }
  /**
   * Updates default display properties
   * @param {string} id
   * @param {object} props
   *
   */
  static setDisplayProperties(id, props = {}) {
    let hasUpdated = false
    Model.ONTOLOGY.forEach((item) => {
      if (item.id === id) {
        hasUpdated = true
        if (!item.displayProps) item.displayProps = {}
        Object.keys(props).forEach((k) => {
          item.displayProps[k] = props[k]
        })
      }
    })
    if (!hasUpdated) {
      Model.ONTOLOGY.push({
        id: id,
        displayProps: props,
      })
    }
  }

  static generateItemId = (key) => {
    return Constants.PREFIX + key
  }

  static generateLayerId = (key) => {
    return Model.generateItemId(key) + Constants.LAYER_SUFFIX
  }
}
// Expand as all modes
Model._replicateForModes('maxSuite')
Model._replicateForModes('buildable')
Model._replicateForModes('maxAdu')
Model._replicateForSuffix('landscaping', 'Rear')

Model.LAYERS_SORTING_ORDER = Model.getSortedTypes().map((type) => Model.generateLayerId(type))

Model.BOUNDARY_SUFFIX = BOUNDARY_SUFFIX
Model.LEFT_SUFFIX = LEFT_SUFFIX
Model.RIGHT_SUFFIX = RIGHT_SUFFIX
Model.FRONT_SUFFIX = FRONT_SUFFIX
Model.REAR_SUFFIX = REAR_SUFFIX
Model.MODES = MODES
Model.THREEBOX_LAYER_BEFORE = THREEBOX_LAYER_BEFORE

export { Model }
