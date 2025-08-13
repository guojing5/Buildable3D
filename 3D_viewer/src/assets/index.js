import { Constants } from '../utils/constants'
import DeciduousTree from './models/deciduous-tree.dae'
import EverGreenTree from './models/evergreen-tree.dae'
import NewTree from './models/new-tree.dae'
import LandscapingAreaGrassTexture from './textures/landscaping-area-grass-texture.png'
import LandscapingAreaHardLandscapeTexture from './textures/landscaping-area-hard-landscape-texture.png'
import ParcelGrassTexture from './textures/parcel-grass-texture.png'
import BuildableAreaTexture from './textures/buildable-area-texture.png'

const Assets = {
  // Filled by the app
  ADU: {},
  TREE: {
    deciduousTree: {
      data: DeciduousTree,
      type: Constants.TYPE_COLLADA,
      rotation: {
        x: 0,
        y: 0,
        z: 0,
      },
      scale: 1,
    },
    everGreenTree: {
      data: EverGreenTree,
      type: Constants.TYPE_COLLADA,
      rotation: {
        x: 0,
        y: 0,
        z: 0,
      },
      scale: 1,
    },
    newTree: {
      data: NewTree,
      type: Constants.TYPE_COLLADA,
      rotation: {
        x: 0,
        y: 0,
        z: 0,
      },
      scale: 0.001, // It's in mm
    },
  },
  textures: {
    landscapingAreaGrass: {
      data: LandscapingAreaGrassTexture,
    },
    parcelGrass: {
      data: ParcelGrassTexture,
    },
    landscapingAreaHardLandscape: {
      data: LandscapingAreaHardLandscapeTexture,
    },
    buildableArea: {
      data: BuildableAreaTexture,
    },
  },
}

export { Assets }
