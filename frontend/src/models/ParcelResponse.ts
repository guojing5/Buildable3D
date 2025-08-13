export interface OrientationProps {
    id: string;
    mimeType: string;
    rawProps: {
        center: {
            latitude: number;
            longitude: number;
        };
        /* Example: [ [-79.413202967, 43.663898135001], [-79.413244523, 43.66400099] ] */
        front: LineGeometry;
        left: LineGeometry;
        rear: LineGeometry;
        right: LineGeometry;
    }
}

export interface Buildable {
    footprint: PolygonGeometry;
    footprintArea: number;
    footprintCenter: {
        longitude: number;
        latitude: number;
    };
    height: number;
    numStoreys: number;
    orientedBox: PolygonGeometry
}

export interface ADU {
    allowed: boolean;
    floorSpaceArea: number;
    footprint: PolygonGeometry;
    footprintArea: number;
    footprintCenter: {
        longitude: number;
        latitude: number;
    };
    height: number;
    numStoreys: number;
    orientedBox: PolygonGeometry;
}

export interface PolygonGeometry {
    type: string;
    coordinates: number[][][];
}

export interface LineGeometry {
    type: string;
    coordinates: number[][];
}