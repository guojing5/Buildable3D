import { Modal } from "react-bootstrap";

function ADUInfoPopup(props: {visible: boolean, onHide: () => void}) {
    return (
        <Modal show={props.visible} onHide={props.onHide}>
            <Modal.Body style={{'padding': '48px'}}>
                <p><strong style={{'fontSize': '1.5rem'}}>What are you interested in building?</strong></p>
                <p>Learn about which type of ADU might be the right choice for your needs.</p>
                <table className='home_adu_table'>
                    <tbody>
                        <tr>
                            <td style={{'width': '205px'}}></td>
                            <td style={{'width': '205px'}}><img src={process.env.PUBLIC_URL + "/img/adu1.png"} className='image_fit' alt="..." /></td>
                            <td style={{'width': '205px'}}><img src={process.env.PUBLIC_URL + "/img/adu2.png"} className='image_fit' alt="..." /></td>
                            <td style={{'width': '205px'}}><img src={process.env.PUBLIC_URL + "/img/adu3.png"} className='image_fit' alt="..." /></td>
                            <td style={{'width': '205px'}}><img src={process.env.PUBLIC_URL + "/img/adu4.png"} className='image_fit' alt="..." /></td>
                        </tr>
                        <tr className='home_adu_row_bottom_border'>
                            <td></td>
                            <td><h6>Laneway suite</h6></td>
                            <td><h6>Secondary suite</h6></td>
                            <td><h6>Floor addition</h6></td>
                            <td><h6>Garden suite</h6></td>
                        </tr>
                        <tr className='home_adu_row_small home_adu_row_bottom_border'>
                            <td><strong>ADU Description</strong></td>
                            <td>A detached living space that typically sits in the rear yard of a property, next to a laneway.</td>
                            <td>A living space within or expanded as part of the main house, and has its own food prep area and bathroom.</td>
                            <td>Create living spaces by adding a floor on top of your existing main house. </td>
                            <td>A detached living space that typically sits in the rear yard of a property.</td></tr>
                        <tr className='home_adu_row_small home_adu_row_bottom_border'>
                            <td><strong>Advantages</strong></td>
                            <td><ul><li>Separate entrance</li>
                                <li>Privacy</li>
                                <li>As-of-right eligibility</li>
                                <li>Suitable for rental</li>
                                </ul>
                            </td>
                            <td>
                                <ul><li>Utilities connected to main house</li><li>Typically cheaper construction cost</li></ul></td>
                            <td>
                                <ul>
                                    <li>
                                    Living space typically as large as main floor</li>
                                    <li>Utilities connected to main house</li>
                                    <li>Privacy</li>
                                    <li>Suitable for rental</li>
                                </ul>

                            </td>
                            <td>
                                <ul>
                                    <li>Separate entrance</li>
                                    <li>Privacy</li>
                                    <li>As-of-right eligibility</li>
                                    <li>Suitable for rental</li>
                                </ul>
                            </td>
                        </tr>
                        <tr className='home_adu_row_small'><td><strong>Approximate Cost</strong></td><td>$400 - $500 per sq. ft.</td><td>$100 - $200 per sq. ft.</td><td>$250 - $400 per sq. ft.</td><td>$400 - $500 per sq. ft.</td></tr>
                    </tbody>
                </table>
            </Modal.Body>
        </Modal>
    );
}

export default ADUInfoPopup;