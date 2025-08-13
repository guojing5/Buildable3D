import { Modal } from "react-bootstrap";

function StoreyPopup(props: {visible: boolean, onHide: () => void}) {
    return (
        <Modal show={props.visible} onHide={props.onHide}>
            <Modal.Body style={{'padding': '24px'}}>
                <div style={{'width': '1030px'}}>
                    <h4 style={{'fontWeight': 800, 'marginBottom': '24px'}}>Storey</h4>
                    <p>A storey	refers to a level of a building, other than a basement, located between any floor and the floor, ceiling or roof immediately above it.</p>

                    <p style={{'marginTop': '24px', 'marginBottom': '0'}}><strong><small>By-law reference</small></strong></p>
                    <p style={{'marginBottom': 0}}><a href='#'><small>800.50</small></a></p>
                </div>
            </Modal.Body>
        </Modal>
    );
}

export default StoreyPopup;