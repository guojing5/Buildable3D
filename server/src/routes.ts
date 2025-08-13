import express, { query } from 'express';
import { ClientConfig, Pool, QueryConfig, QueryResult } from 'pg';
import { AddressSearchResult } from './models/AddressSearchResult';
import { GeoDataResult, Building } from './models/GeoDataResult';
import { MainBuilding } from './models/MainBuilding';
import { Buildable } from './models/Buildable';
import { Parcel } from './models/Parcel';
import { ParcelOrientation } from './models/ParcelOrientation';
import { ErrorResponse } from './models/ErrorResponse';
import { Question } from './models/Question';
import { SquareMeterToSquareFeet, MakeExpandedBox, MeterToFeet, ToDecimal } from './utils';
import { AddressVerifyDetail } from './models/AddressVerifyDetail';
import { Adu } from './models/Adu';
import request from 'request';
import * as path from 'path';
import * as fs from 'fs';
import { LanewaySuite } from './models/LanewaySuite';
import { GOOGLE_API_KEY } from './credential';

const router = express.Router();
const addressVerifyDetailCache: AddressVerifyDetail[] = [];
let lanewaySuites: LanewaySuite[] = [];

fs.readFile(path.join(__dirname, './data/lanewaySuites.json'), 'utf8', (err, data) => {
    lanewaySuites = JSON.parse(data) as LanewaySuite[];
});

router.get('/api/faq', (req, res) => {
    const questions: Question[] = [
        {
            content: ['My property is eligible for an ADU, can I begin construction?'],
            answer: ['Yes']
        },
        {
            content: ["What factors determine a property’s eligibility for an ADU?"],
            answer: []
        },
        {
            content: ["Do I need my neighbours’ approval to build an ADU?"],
            answer: []
        },
        {
            content: ['Are there government incentives for my ADU project?'],
            answer: ['Yes']
        },
        {
            content: ['What are my options if my property is ineligible for an ADU?'],
            answer: []
        }
    ];
    return res.json(questions);
});

const pgCredential: ClientConfig = {
    user: "resparcelbldg",
    host: "18.232.217.195",
    database: "resparcelbldg",
    password: "bGAgoAA#whpY$YJmr*2XQBy2AXz8WacDze2ika",
    port: 5432
};

const pgPool = new Pool(pgCredential);

async function safePoolQuery (qry: QueryConfig) {
    try {
        return await pgPool.query(qry);
    } catch (err) {
        console.error(err);
    }
    return {
        rows: [],
    } as QueryResult;
}

router.get('/api/address/search', async (req, res) => {
    const placeId: string = (req.query.place_id ?? '').toString();
    if (typeof placeId === 'undefined') {
        res.json({
            'error': 'Please specify place_id in the request'
        });
    }
    const reqUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=GOOGLE_API_KEY&fields=geometry`;
    request(reqUrl, async (err, response, body) => {
        const obj = JSON.parse(body);
        if (!obj || !obj.result || !obj.result.geometry) {
            return res.status(400).json({ error: 'AddressNotFoundByGoogle' } as ErrorResponse)
        }
        const lat = obj.result.geometry.location.lat;
        const lng = obj.result.geometry.location.lng;
        const sql = `SELECT "OBJECTID", address_google, zone_text, parcel_area, ST_Length(front::geography) lot_frontage, ST_Length(side0::geography) lot_depth, buildable_max_sqm, lat, lon, adu0, adu1
        FROM w.webdata_2_0
        WHERE ST_Contains (geometry, ST_SetSRID(ST_Point($1,$2), 4326))`;

        const queryResult = await safePoolQuery({
            text: sql,
            values: [lng, lat]
        } as QueryConfig);
        if (queryResult.rows.length === 0) {
            return res.status(400).json({ error: 'AddressNotInDB' } as ErrorResponse);
        }

        const row = queryResult.rows[0];
        const area = row.parcel_area as number;
        const frontage = row.lot_frontage;
        const depth = row.lot_depth;

        const result: AddressSearchResult = {
            objectId: row.OBJECTID as string,
            name: row.address_google as string,
            zoneCategory: row.zone_text as string,
            lotDetail: {
                area: {squareMeter: Math.floor(area), squareFoot: Math.floor(SquareMeterToSquareFeet(area))},
                frontage: {meter: ToDecimal(frontage, 2), foot: ToDecimal(MeterToFeet(frontage), 0)},
                depth: {meter: ToDecimal(depth, 2), foot: ToDecimal(MeterToFeet(depth), 0)}
            },
            latitude: row.lat,
            longitude: row.lon,
            adu0: row.adu0,
            adu1: row.adu1
        };
        return res.json(result);
    });


});

router.post('/api/address/detail/extra', (req, res) => {
    const param = req.body as AddressVerifyDetail;
    res.status(200);
});

router.get('/api/lanewaySuites/list', (req, res) => {
    res.json(lanewaySuites);
});

router.get('/api/geo/parcel', async (req, res) => {
    const placeId: string = (req.query.pid ?? '').toString();
    const longitude: string = (req.query.lng ?? '').toString();
    const latitude: string = (req.query.lat ?? '').toString();
    const hasPlaceId = !!placeId
    const hasLongitude = !!longitude
    const hasLatitude = !!latitude
    if (!hasPlaceId && !hasLatitude && !hasLongitude) {
        return res.json({
            error: 'Invalid query - missing pid or lng/lat'
        });
    }
    if (!hasPlaceId && (!hasLatitude || !hasLongitude)) {
        return res.json({
            error: 'Invalid query - missing lng or lat'
        });
    }

    const sqlArr = [`
        SELECT geometry::jsonb, mainbldg::jsonb, buildable0_raw::jsonb, buildable1_raw::jsonb,  buildable2_raw::jsonb, buildable_max_geo::jsonb, buildable_max_geo2::jsonb, centroid::jsonb, allbldg::jsonb, place_id, mainbldg_height, mainbldg_storeys, front::jsonb, rear::jsonb, side0::jsonb, side1::jsonb, parcel_area, mainbldg_foot, adu0, adu1, lat, lon
        FROM w.webdata_2_0`,
        `WHERE place_id = $1`,
        `WHERE centroid && ST_Point($1, $2)`,
        `LIMIT 5`
    ];
    const sql = hasPlaceId ? (sqlArr[0] + ' \n ' + sqlArr[1] + ' \n ' + sqlArr[3]) : (sqlArr[0] + ' \n ' + sqlArr[2] + ' \n ' + sqlArr[3])

    const queryResult = await safePoolQuery({
        text: sql,
        values: hasPlaceId ? [placeId] : [longitude, latitude]
    } as QueryConfig);
    if (queryResult.rows.length === 0) {
        return res.status(400).json({ error: 'Address not found' } as ErrorResponse)
    }

    const row = queryResult.rows[0];
    // console.debug('ROW=>', row);
    const result: GeoDataResult = {
        id: row.place_id as string,
        buildable0: new Buildable(row, 0),
        buildable1: new Buildable(row, 1),
        buildable2: new Buildable(row, 2),
        maxAdu0: new Adu(row, 0),
        maxAdu1: new Adu(row, 1),
        mainBuilding: new MainBuilding(row),
        parcel: new Parcel(row),
        orientation: new ParcelOrientation(row),
    };

    const addComputedData = async (building : Building) => {
        if (!building?.footprint) return;

        // Add oriented box and centroid
        const boxQuery: QueryConfig = {
            text: `SELECT ST_OrientedEnvelope(ST_GeomFromGeoJSON($1))::jsonb, ST_Centroid(ST_GeomFromGeoJSON($1))::jsonb, ST_Area(ST_GeomFromGeoJSON($1)::geography) sqm`,
            values: [JSON.stringify(building.footprint)],
        }
        const boxQueryResult = await safePoolQuery(boxQuery);
        if (boxQueryResult.rows.length > 0) {
            building.orientedBox = boxQueryResult.rows[0].st_orientedenvelope;
            building.footprintCenter = {
                longitude: boxQueryResult.rows[0].st_centroid?.coordinates?.[0],
                latitude: boxQueryResult.rows[0].st_centroid?.coordinates?.[1],
            };
            if (!building.footprintArea) building.footprintArea = boxQueryResult.rows[0].sqm
        }
    }

    // Add oriented bounding box for mainBuilding also.
    await addComputedData(result.mainBuilding);
    await addComputedData(result.buildable0);
    await addComputedData(result.buildable1);
    await addComputedData(result.buildable2);
    await addComputedData(result.maxAdu0);
    await addComputedData(result.maxAdu1);

    return res.json(result);
});

router.get('/api/geo/around', async (req, res) => {
    const longitude: string = (req.query.lng ?? '').toString();
    const latitude: string = (req.query.lat ?? '').toString();
    const around: string = (req.query.around ?? '100').toString();
    const hasLongitude = !!longitude
    const hasLatitude = !!latitude
    if (!hasLatitude || !hasLongitude) {
        return res.json({
            error: 'Invalid query - missing lng or lat'
        });
    }
    const box = MakeExpandedBox({ longitude: Number(longitude), latitude: Number(latitude) }, Number(around))

    const sql = `
        SELECT geometry::jsonb, mainbldg::jsonb, buildable0_raw::jsonb, buildable1_raw::jsonb, centroid::jsonb, allbldg::jsonb, place_id, mainbldg_height, mainbldg_storeys, parcel_area, mainbldg_foot, adu0, adu1, lat, lon
        FROM w.webdata_2_0
        WHERE ST_NumGeometries(mainbldg) > 0 AND centroid && ST_MakeEnvelope($1, $2, $3, $4)`;

    const queryResult = await safePoolQuery({
        text: sql,
        values: [box.min.longitude, box.min.latitude, box.max.longitude, box.max.latitude]
    } as QueryConfig);
    if (queryResult.rows.length === 0) {
        return res.status(400).json({ error: 'Address not found' } as ErrorResponse)
    }

    const result = queryResult.rows.map((row: any) => {
        // console.debug('ROW=>', row);
        return {
            id: row.place_id as string,
            buildable0: null,
            buildable1: null,
            buildable2: null,
            maxAdu0: null,
            maxAdu1: null,
            mainBuilding: new MainBuilding(row),
            parcel: new Parcel(row),
            orientation: new ParcelOrientation(row),
        } as GeoDataResult;
    });
    return res.json(result);
});

router.get('/api/geo/tree', async (req, res) => {
    const longitude: string = (req.query.lng ?? '').toString();
    const latitude: string = (req.query.lat ?? '').toString();
    const around: string = (req.query.around ?? '50').toString();
    const limit: string = (req.query.limit ?? '7').toString();
    const hasLongitude = !!longitude
    const hasLatitude = !!latitude
    if (!hasLatitude || !hasLongitude) {
        return res.json({
            error: 'Invalid query - missing lng or lat'
        });
    }
    const box = MakeExpandedBox({ longitude: Number(longitude), latitude: Number(latitude) }, Number(around))

    const sql = `
        SELECT geometry::jsonb
        FROM i.toronto_tree_0_0
        WHERE geometry && ST_MakeEnvelope($1, $2, $3, $4)
        LIMIT ` + limit;

    const queryResult = await safePoolQuery({
        text: sql,
        values: [box.min.longitude, box.min.latitude, box.max.longitude, box.max.latitude]
    } as QueryConfig);
    if (queryResult.rows.length === 0) {
        return res.status(400).json({ error: 'Address not found' } as ErrorResponse)
    }

    const features = queryResult.rows.map((row: any) => {
        return {
            type: 'Feature',
            geometry: row.geometry
        }
    });
    const result = {
        type: 'FeatureCollection',
        features
    };

    return res.json(result);
});


export default router;