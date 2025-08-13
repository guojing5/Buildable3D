import { Building, Coordinate } from './GeoDataResult';

export class Adu implements Building {
  footprint: any; // buildable_max_geo or buildable_max_geo2
  footprintArea: number; // computed
  footprintCenter: Coordinate; // computed centroid
  floorSpaceArea: number; // null
  height: number; // 4 or 6
  numStoreys: number; // 1 or 2
  orientedBox: any; // computed box
  allowed: boolean; // adu0 or adu1
  constructor (record: any, which: number) {
    this.footprint = which === 0 ? record.buildable_max_geo : record.buildable_max_geo2;
    this.footprintArea =  which === 0 ? record.buildable0_foot : record.buildable1_foot;
    this.footprintCenter =  null; // computed
    this.floorSpaceArea =  null;
    this.height =  which === 0 ? 4 : 6;
    this.numStoreys = which === 0 ? 1 : 2;
    this.orientedBox = null; // computed
    this.allowed = which === 0 ? record.adu0 : record.adu1;
  }
}
