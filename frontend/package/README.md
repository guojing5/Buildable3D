# Buildable3D Viewer

Buildable3D Viewer ADU project is developed using [MapBox](https://docs.mapbox.com/), [three.js](https://threejs.org/) and [react](https://reactjs.org/) technology. `MapBox` is used for mapping services, `three.js`  for rendering 3D objects and `react` for other HTML5 elements. 

## Getting Started with Library

### Setup

- Make ensure you have `yarn` installed on your machine. Run following command to check.

`yarn --version`

- In case `yarn` is not not installed, refer [these installation steps.](https://classic.yarnpkg.com/en/docs/install)

- Next, run following command in the project directory to install all the project dependendies. This command will create `node_modules` folder in your project directory.

`yarn install`

### Available Scripts

After setup is done, you can run any of following scripts in your project directory:

#### yarn start

`yarn start` script transpile the library in the development mode and create the deployable library in `dist` folder.

#### yarn build

`yarn start` script transpile the library in the production mode and create the deployable library in `dist` folder.


#### yarn lint

`yarn lint` script performs error checking using `eslint`. Manual fix the errors which are shown on the command prompt.

#### yarn prettier

`yarn prettier` script performs code style checking and fixing using `prettier`.

## Consuming Library in a React app

### Setup

- Ensure that you have setup `ssh` or command line access to gitlab repository.

- Add dependency

`yarn add git+ssh://git@gitlab.com:abodeatlas/abode-atlas-adu-viewer.git`

- Use component `AduOnMapScene` in your app

```
import React from 'react'
import ReactDOM from 'react-dom'
import { AduOnMapScene } from 'abode-atlas-adu-viewer'

const COORDINATES = {
  latitude: 43.6569,
  longitude: -79.4199,
}
const style = {
  height: '800px', // window.innerHeight, // '800px',
  width: '800px', // window.innerWidth, // '800px',
}

const App = () => {
  return <AduOnMapScene center={COORDINATES} style={style} />
}
```

### Example

Run following command to run the `example` React app.

- `cd example`
- `yarn start`

## Components

### AduOnMapScene

`AduOnMapScene` renders ADU on specified location on the map. It would automatically gather and render the details about additional layers including `parcel`, `buildable-area` and `footprint`. `AduOnMapScene` takes following `props` as input.

- `center` Object `{ latitude, longitude }` in WGS84
- `style` Container style with data like `{ width, height }`
- `zoom` Zoom level. Default value is `20`

### MapScene

`MapScene` is internally used by `AduOnMapScene` to render the data on map. It takes layer data as explicit input `source` and manages `stores` to capture / share the state with other UI components.


### Supported Web Browsers

Mozilla Firefox, Microsoft Edge, Chrome

### Author


