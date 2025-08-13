import { Orientation, Coordinate } from './GeoDataResult';

export class ParcelOrientation implements Orientation {
  front: any;
  rear: any;
  right: any;
  left: any;
  center: Coordinate;

  constructor (record: any) {
    this.front = record.front;
    this.rear = record.rear;
    this.right = record.side0;
    this.left = record.side1;
    this.center = {
      latitude: record.lat as number,
      longitude: record.lon as number,
    } as Coordinate;
  }
}