import { Modal } from "react-bootstrap";

function FinishedBasementPopup(props: {visible: boolean, onHide: () => void}) {
    return (
        <Modal show={props.visible} onHide={props.onHide}>
            <Modal.Body style={{'padding': '24px'}}>
                <div style={{'width': '942px'}}>
                    <h4 style={{'fontWeight': 800, 'marginBottom': '24px'}}>Finished Basement</h4>
                    <div style={{display: 'flex', gap: '14px'}}>
                        <div><img style={{'width': '200px'}} src={process.env.PUBLIC_URL + "/img/finished-basement.png"} /></div>
                        <div><p>A basement is considered as finished when it has permanent electrical, heating and cooling systems. The walls and floor need to be finished, with no exposed concrete or plywood, while the ceiling needs to be level. The basement should also have an accessible entrance or stairway.</p></div>
                    </div>
                </div>
            </Modal.Body>
        </Modal>
    );
}

export default FinishedBasementPopup;