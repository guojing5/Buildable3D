import { useState } from "react";
import { Modal } from "react-bootstrap";
import { AreaValueWithUnit } from "../models/AddressSearchResult";

function TotalAreaInputPopup(props: {visible: boolean, onHide: () => void, onSubmit: (value: AreaValueWithUnit) => void}) {
    const [unit, setUnit] = useState('m');
    const [value, setValue] = useState('');

    const onSelectUnit = (e: any, unit: string) => {
        if (e.target.checked) {
            setUnit(unit);
        }
    }

    const submit = () => {
        props.onSubmit({
            value: parseFloat(value),
            unit: unit
        });
    }

    return (
        <Modal show={props.visible} onHide={props.onHide}>
            <Modal.Body style={{'width': '840px', 'padding': '36px'}}>
                <h2 className='h2' >What is the total area of your house?</h2>
                <div className='line mbottom-1'>
                    <div style={{flex: 1, paddingRight: '10px', borderRight: '1px #bcc6cc solid', display: 'flex', flexDirection: 'column', justifyContent: 'space-between'}}>
                        <div>
                            <p className='mbottom-0'>The combined total area of all floors of the main house, including the attic and finished basement.</p>
                            <p className='mbottom-2'><button className='button_link'>Further details and exceptions</button></p>
                            <p className='mbottom-4 p-bold'>Total area of principal residence</p>
                            <div className='line mbottom-2' style={{'gap': '24px', 'alignItems': 'center'}}>
                                <input type='text' onChange={(e) => setValue(e.target.value)} value={value} className='interaction_area_input' />
                                <div>
                                    <div className='interaction_area_radio_line'><input checked={unit === 'ft'} type='radio' onChange={(e) => onSelectUnit(e, 'ft')} /> sq. ft</div>
                                    <div className='interaction_area_radio_line'><input checked={unit === 'm'} type='radio' onChange={(e) => onSelectUnit(e, 'm')} /> sq. m</div>
                                </div>
                            </div>
                        </div>
                        <div style={{textAlign: 'center'}}><button className='appbutton appbutton-primary' style={{width: '100%', opacity: value.length > 0 ? '1': '0.5'}} onClick={() => submit()}>Done</button></div>
                    </div>
                    <div style={{flex: 1, paddingLeft: '10px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between'}}>
                        <p className='mbottom-1'>If you are unsure, please check your property documents or log onto Municipal Property Assessment Corporation’s (MPAC) <strong>aboutmyproperty.ca</strong> using the Roll Number and Access Key provided in your Property Assessment Notice.</p>
                        <div style={{textAlign: 'center'}}><button style={{width: '100%'}} className='appbutton appbutton-secondary'>Visit aboutmyproperty.ca</button></div>
                    </div>
                </div>
                <p className='mbottom-0' style={{textAlign: 'center'}}><button className='button_link'>Unable to provide at this time</button></p>
            </Modal.Body>
        </Modal>
    );
}

export default TotalAreaInputPopup;