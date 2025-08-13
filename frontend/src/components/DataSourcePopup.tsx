import { Modal } from "react-bootstrap";

function DataSourcePopup(props: {visible: boolean, onHide: () => void}) {
    return (
        <Modal show={props.visible} onHide={props.onHide}>
            <Modal.Body style={{'padding': '36px'}}>
                <div style={{'width': '1200px'}}>
                    <h1 className='h1'>Source of property details</h1>
                    <p style={{'marginBottom': 0}}>Property details were generated using datasets under City of Toronto’s Open Data.</p>
                </div>
            </Modal.Body>
        </Modal>
    );
}

export default DataSourcePopup;