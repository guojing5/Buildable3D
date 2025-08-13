import { Building, Coordinate } from './GeoDataResult';

export class MainBuilding implements Building  {
  footprint: any; // mainbldg
  footprintArea: number; // mainbldg_foot
  footprintCenter: Coordinate; // computed centroid
  floorSpaceArea: number; //
  height: number; // mainbldg_height
  numStoreys: number;
  orientedBox: any; // computed box
  constructor (record: any) {
    this.footprint = record.mainbldg;
    this.footprintArea = record.mainbldg_foot;
    this.footprintCenter = null; // computed
    this.floorSpaceArea = null; // TODO - is it available in database
    this.height = record.mainbldg_height;
    this.numStoreys = record.mainbldg_storeys; // TODO - is it available in database
    this.orientedBox = null; // computed
  }
}
