import { Calc } from './calc'

const multiLayer = true
const boundRadius = 250 // in meters
const enableSelectingFeatures = false
const DEBUG = process.env.REACT_APP_ENV === 'development'
const DEBUG_SCALE_FACTOR = DEBUG ? 1 : 1 // TODO disable
const Constants = {
  DEBUG: DEBUG,
  DEBUG_SCALE_FACTOR: DEBUG_SCALE_FACTOR,
  DEBUG_VERBOSITY: DEBUG ? 'minimal' : 'none', // 'none', 'minimal', 'verbose'
  DEBUG_POINTER_DIV: 'debug-point-div',
  PREFIX: 'abode-atlas-',
  LAYER_SUFFIX: '-layer',
  OBJECT3D_SUFFIX: '-object3d',
  ENABLE_SELECTING_FEATURES: enableSelectingFeatures,
  ENABLE_SELECTING_OBJECTS: true,
  ENABLE_BBOX_OBJECTS: false,
  ENABLE_DRAGGING_OBJECTS: true,
  ENABLE_ROTATING_OBJECTS: false,
  ENABLE_SKY: true,
  ENABLE_MULTI_LAYER: multiLayer,
  PARENT_LAYER_ID: multiLayer ? 'threebox_layer' : undefined,
  TYPE_COLLADA: 'dae', // DONT CHANGE THIS - THREEBOX TYPE
  TYPE_GEOJSON: 'geojson', // DONT CHANGE THIS - MAPBOX TYPE
  TYPE_TBMODEL: 'model',
  TYPE_OBJECT3D: 'object3d',
  MIN_ZOOM: 10,
  MAX_ZOOM: 24,
  OVERRIDE_BUILDABLE: true,
  SIMPLIFIED_BUILDABLE_SUFFIX: 'Simple', // Used on not overrided i.e. OVERRIDE_BUILDABLE = false
  DEFAULT_DIMENSION_LINE_LENGTH: 0.2, // in meters,
  DEFAULT_POLYGON_HEIGHT: enableSelectingFeatures ? 0.01 : 0,
  DEFAULT_Z_FIGHTING_OFFSET: 0.002,
  DEFAULT_SHADOW_HEIGHT: 0.02,
  DEFAULT_EXTRUSION_ZOOM_OFFSET: 1,
  DEFAULT_CENTER: Calc.DEFAULT_CENTER,
  DEFAULT_BOUNDS: {
    treeMeters: boundRadius / 5,
    meters: boundRadius,
    ...Calc.meterToLngLat(boundRadius, Calc.DEFAULT_CENTER),
  },
  DEFAULT_SUNTIME: new Date(Date.UTC(2021, 8, 12, 14, 0)), // 2.00 pm UTC = 10 am Toronto
  SERVER_URL: '',
  API_PATH_PARCEL: 'api/geo/parcel?place_id=__PID__&lng=__LNG__&lat=__LAT__',
  API_PATH_LOCALITY: 'api/geo/around?lng=__LNG__&lat=__LAT__',
  API_PATH_TREE: 'api/geo/tree?lng=__LNG__&lat=__LAT__',

  DEFAULT_TREE_MODEL: 'newTree',
  DEFAULT_TREE_ONLY_ON_PARCEL: true,

  // Regulatory constraints
  BYELAWS_DISTANCE_ANGULAR_PLANE_MAIN_BUILDING: 3.5, // 3.5, // meters (i.e. 7.5 - 4)
  BYELAWS_DISTANCE_ANGULAR_PLANE_MAX_HEIGHT: 4, // meter
  BYELAWS_DISTANCE_MAX_SUITE0_MAIN_BULDING: 5, // meter
  BYELAWS_DISTANCE_MAX_SUITE1_MAIN_BULDING: 7.5, // meter
  BYELAWS_DISTANCE_MAX_SUITE2_MAIN_BULDING: 9.5, // meter
  BYELAWS_DISTANCE_MAX_SUITE_MAX_LENGTH: 10 / DEBUG_SCALE_FACTOR, // meter
  BYELAWS_DISTANCE_MAX_SUITE_MAX_WIDTH: 8 / DEBUG_SCALE_FACTOR, // meter
  BYELAWS_DISTANCE_MAX_SUITE_MAX_HEIGHT_NEAR: 4, // meter
  BYELAWS_DISTANCE_MAX_SUITE_MAX_HEIGHT_FAR: 6, // meter
  BYELAWS_DISTANCE_LANDSCAPING_FRONTAGE: 6, // meter
  BYELAWS_AREA_LANDSCAPING_SOFT_LARGE: 0.85, // 85%
  BYELAWS_AREA_LANDSCAPING_SOFT_SMALL: 0.6, // 60%
  BYELAWS_AREA_LANDSCAPING_SOFT_REAR: 0.75,
  BYELAWS_PREVIEW_ADU_OVERRIDE_MODE: true, // On true, ADU preview can override the mode
}

export { Constants }
