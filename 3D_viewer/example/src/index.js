import React from 'react'
import ReactDOM from 'react-dom'
import { AduOnMapScene, Constants } from 'abode-atlas-adu-viewer'
import './index.css'

// DB place_id - Id of Property to be rendered
const locationId = ''

// One of center of locationId must be provided
const USE_CASES = {
  center1: {
    longitude: -79.3434714288662,
    latitude: 43.670271142579224,
  },
  center2: {
    //  512 Palmerston Boulevard
    longitude: -79.41335224523414,
    latitude: 43.66281044578703,
  },
  center3: {
    //  533 Palmerston Boulevard
    longitude: -79.41299287566109,
    latitude: 43.66399841269895,
  },
  center4: {
    // 14 Polarlights - Irregular Shape
    latitude: 43.82364755885801,
    longitude: -79.23050802245236,
  },
  center5: {
    // 15 Salamander Street, Scarborough, ON, Canada  - Irregular Shape
    latitude: 43.82093797031298,
    longitude: -79.2218453099461,
  },
  center6: {
    // 32 Alma Avenue, Toronto, ON, Canada
    latitude: 43.64489706010989,
    longitude: -79.42946565641142,
  },
  center7: {
    // 195 Argyle Street, Toronto, ON, Canada - Smaller parcel (no valid maxSuite2)
    latitude: 43.64527835355789,
    longitude: -79.42671287285225,
  },
  center8: {
    // 712 Balliol Street, Toronto, ON, Canada
    latitude: 43.70192202694157,
    longitude: -79.37566104920165,
  },
  center9: {
    // 160 Bartlett Avenue, Toronto, ON, Canada - Invisible parcel (can't replicate)
    latitude: 43.66496671899664,
    longitude: -79.4351704038089,
  },
  center10: {
    // 145 Barton Avenue, Toronto, ON, Canada - Flicker due to duplicate main building
    latitude: 43.66641329572352,
    longitude: -79.4191676247004,
  },
}

const useCase = 7
const center = USE_CASES['center' + useCase]

const style = {
  height: '100%', // window.innerHeight, // '800px',
  width: '100%', //window.innerWidth, // '800px',
  padding: '0px',
  margin: '0px',
  position: 'absolute',
}

const PUBLIC_ASSETS = process.env.PUBLIC_URL + '/assets'
const ADU = {
  backPod: {
    data: PUBLIC_ASSETS + '/models/adu1/ADU_Example.dae',
    type: Constants.TYPE_COLLADA,
    rotation: {
      x: 0,
      y: 0,
      z: 0, // As the model is north facing (the bearing)
    },
    scale: 1.0,
    height: 5.642,
    length: 7.187,
    width: 8,
    wedge: false,
    defaultSeparationDistance: 7.5,
  },
  adu2: {
    data: PUBLIC_ASSETS + '/models/adu2/20210820_ADU COLLADA Converted II.dae',
    type: Constants.TYPE_COLLADA,
    rotation: {
      x: 0,
      y: 0,
      z: 0, // As the model is north facing (the bearing)
    },
    scale: 1.0,
    height: 6.5, // meters // Max height
    wedge: false,
    length: 3,
    width: 3,
  },
  aduBack: {
    data: PUBLIC_ASSETS + '/models/adu-back/20210830_ADU FINAL REVISE I.dae',
    type: Constants.TYPE_COLLADA,
    rotation: {
      x: 0,
      y: 0,
      z: 180, // As the model is south facing (the bearing)
    },
    scale: 1,
    height: 5.642,
    length: 7.187,
    wedge: false,
    width: 8,
    defaultSeparationDistance: 7.5,
  },
  aduFront: {
    data: PUBLIC_ASSETS + '/models/adu-front/20210830_ADU FINAL REVISE II.dae',
    type: Constants.TYPE_COLLADA,
    rotation: {
      x: 0,
      y: 0,
      z: 180, // As the model is south facing (the bearing)
    },
    scale: 1,
    height: 5.642,
    length: 7.187,
    wedge: false,
    width: 8,
    defaultSeparationDistance: 7.5,
  },
}

const visibility = {
  // debug: true,
  // // adu: false, // NOT NEEDED ANYMORE
  // setbacks: true,
  // angularPlane: true,
  maxConstraintBox: true,
  // separationLine: true,
  // buildable: true,
  otherBuildings: true,
  // tree: true,

  maxSuite: true,
  separationLine: true,
  setbacks: true,
  landscaping: true,
  buildable: true,
  // 'adu': false,
  angularPlane: true,
  mainBuilding: true,
  parcel: true,
  tree: true,
}

const App = () => {
  const onClick = React.useCallback((type) => {
    console.log('onClick', type)
  }, [])
  const onProgress = React.useCallback((counter, total) => {
    console.debug('Received onProgress in example app', counter, total)
  }, [])
  const onUpdate = React.useCallback((data) => {
    console.debug('Received onUpdate in example app', data)
  }, [])
  return (
    <AduOnMapScene
      locationId={locationId}
      style={style}
      center={center}
      visibility={visibility}
      catalogue={ADU}
      onClick={onClick}
      onProgress={onProgress}
      onUpdate={onUpdate}
    />
  )
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
)
