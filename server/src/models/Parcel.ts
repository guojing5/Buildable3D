import { Object2d, Coordinate } from './GeoDataResult';

export class Parcel implements Object2d {
  footprint: any; // geometry
  footprintArea: number; // parcel_area
  footprintCenter: Coordinate; // computed
  constructor (record: any) {
    this.footprint = record.geometry;
    this.footprintArea = record.parcel_area;
    this.footprintCenter = null; // computed
  }
}