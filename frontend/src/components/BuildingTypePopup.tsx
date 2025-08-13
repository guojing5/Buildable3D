import { Modal } from "react-bootstrap";

function BuildingTypePopup(props: {visible: boolean, onHide: () => void}) {
    return (
        <Modal show={props.visible} onHide={props.onHide}>
            <Modal.Body style={{'padding': '24px'}}>
                <div style={{'width': '1200px'}}>
                    <h4 style={{'fontWeight': 800}}>Building types</h4>
                    <p style={{'marginTop': '24px'}}>Building types are usually described using the term 'dwelling', which is a living space with a kitchen and bathroom exclusive to its occupants, and is not shared with other dwellings within the same building.</p>
                    <div className='verify_building_type_grid_container'>
                        <div><img src={process.env.PUBLIC_URL + "/img/building-type-detached-house.png"} className='home_card_img' /></div>
                        <div><img src={process.env.PUBLIC_URL + "/img/building-type-semi-detached-house.png"} className='home_card_img' /></div>
                        <div><img src={process.env.PUBLIC_URL + "/img/building-type-duplex.png"} className='home_card_img' /></div>
                        <div><img src={process.env.PUBLIC_URL + "/img/building-type-triplex.png"} className='home_card_img' /></div>
                        <div><img src={process.env.PUBLIC_URL + "/img/building-type-fourplex.png"} className='home_card_img' /></div>
                        <div><img src={process.env.PUBLIC_URL + "/img/building-type-townhouse.png"} className='home_card_img' /></div>
                        <div><h6>Detached house</h6><p><small>A stand-alone house where the space is designed to be used as a dwelling for a single family.</small></p></div>
                        <div><h6>Semi-detached house</h6><p><small>This is a single family house that shares a common wall with another house. Both houses have their separate entrances and direct access to a street.</small></p></div>
                        <div style={{gridColumnStart: 3, gridColumnEnd: 6}}><h6>Duplex, Triplex, Fourplex</h6><p><small>A building that has 2, 3, or 4 dwelling units within it. The units have separate entrances, but share the same roof. Unit arrangements do not matter as they can be above, below, or beside each other, as represented by the dashed lines.</small></p></div>
                        <div><h6>Townhouse</h6><p><small>This is a multi-floor, single family house that shares common walls with neighbouring houses. It is individually owned, unlike a duplex, triplex, and fourplex.</small></p></div>
                    </div>
                    <p style={{'marginTop': '24px', 'marginBottom': '0'}}><strong><small>By-law reference</small></strong></p>
                    <p style={{'marginBottom': 0}}><a href='#'><small>800.50</small></a></p>
                </div>
            </Modal.Body>
        </Modal>
    );
}

export default BuildingTypePopup;