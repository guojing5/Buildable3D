import { Building, Coordinate } from './GeoDataResult';

export class Buildable implements Building {
  footprint: any; // buildable0_raw or buildable1_raw
  footprintArea: number; // buildable0_foot or buildable1_foot
  footprintCenter: Coordinate; // computed centroid
  floorSpaceArea: number; // buildable0_sqm or buildable1_sqm
  height: number; // 4 or 6
  numStoreys: number; // 1 or 2
  orientedBox: any; // computed box
  constructor (record: any, which: number) {
    if (which === 2) {
      this.footprint = record.buildable2_raw
      this.height = 6;
      this.numStoreys = 2;
      return
    }
    this.footprint = which === 0 ? record.buildable0_raw : record.buildable1_raw;
    this.footprintArea =  which === 0 ? record.buildable0_foot : record.buildable1_foot;
    this.footprintCenter =  null; // computed
    this.floorSpaceArea =  which === 0 ? record.buildable0_sqm : record.buildable1_sqm;
    this.height =  which === 0 ? 4 : 6;
    this.numStoreys = which === 0 ? 1 : 2;
    this.orientedBox = null; // computed
  }
}
