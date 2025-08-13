// @ts-ignore
import { AduOnMapScene } from 'abode-atlas-adu-viewer';

function InteractPage() {
    const COORDINATES = {
        latitude: 43.6569,
        longitude: -79.4199,
    };
    return (
        <div><AduOnMapScene center={COORDINATES}></AduOnMapScene></div>
    );
}

export default InteractPage;