import { Coordinate, Box } from './models/GeoDataResult'

export function MeterToFeet(meter: number): number {
    return meter * 3.28084;
}

export function SquareMeterToSquareFeet(squareMeter: number): number {
    return squareMeter * 3.28084 * 3.28084;
}

export function ToDecimal(num: number, decimal: number): number {
    return Math.round(num * Math.pow(10, decimal)) / Math.pow(10, decimal);
}

export function DegreeToRadian(angle: number): number {
    return Math.PI / 180.0 * angle;
}

export function RadianToDegree(angle: number): number {
    return 180.0 / Math.PI * angle;
}

export function MakeExpandedBox(center: Coordinate, expandInMeter: number): Box {
    const EarthRadius = 6378137 // in meters
    const moveLngLat = (longitude: number, latitude: number, dLng: number, dLat: number) => {
        return {
            latitude:  latitude  + RadianToDegree(dLat / EarthRadius),
            longitude: longitude + RadianToDegree(dLng / EarthRadius / Math.cos(DegreeToRadian(latitude))),
        } as Coordinate;
    }
    const half = expandInMeter / 2.0;
    return {
        min: moveLngLat(center.longitude, center.latitude, -half, -half),
        max: moveLngLat(center.longitude, center.latitude, half, half),
    } as Box;

}