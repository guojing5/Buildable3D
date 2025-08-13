interface Object2d {
  footprint: any; // GeoJson Feature object
  footprintArea: number; // in square meters
  footprintCenter: Coordinate; // computed
}

interface Object3d extends Object2d {
  height: number; // in meters
}

interface Building extends Object3d {
  numStoreys: number;
  orientedBox: any; // GeoJson object
  floorSpaceArea: number; // in square meters
}

interface Coordinate {
  latitude: number;
  longitude: number;
}

interface Orientation {
  left: any,
  right: any,
  rear: any,
  front: any,
  center: Coordinate,
}

interface GeoDataResult {
  id: string;
  buildable0: Building;
  buildable1: Building;
  buildable2: Building;
  mainBuilding: Building;
  maxAdu0: Building;
  maxAdu1: Building;
  parcel: Object2d;
  orientation: Orientation;
}

interface Box {
  min: Coordinate;
  max: Coordinate;
}

export { Object2d, Object3d, Building, Coordinate, Box, Orientation, GeoDataResult  };


