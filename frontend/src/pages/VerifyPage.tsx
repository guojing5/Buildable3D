import './pageShared.css'
import { Form } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import BuildingTypePopup from '../components/BuildingTypePopup';
import StoreyPopup from '../components/StoreyPopup';
import TopBar from '../components/TopBar';
import Footer from '../components/Footer';
import { AddressSearchResult } from '../models/AddressSearchResult';
import { PlaceInfo, placeInfo, setCoordinate, setExtraInfo, setPlaceInfo } from '../global/state';
import { GOOGLE_API_KEY } from '../global/credential';
import FinishedBasementPopup from '../components/FinishedBasementPopup';
import DataSourcePopup from '../components/DataSourcePopup';
import { ErrorResponse } from '../models/ErrorResponse';
import { useHistory } from 'react-router-dom';
import { AddressVerifyDetail } from '../models/AddressVerifyDetail';

function VerifyPage() {
    const [DataSourcePopupVisible, setDataSourcePopupVisible] = useState(false);
    const [FinishedBasementPopupVisible, setFinishedBasementPopupVisible] = useState(false);
    const [BuildingTypePopupVisible, setBuildingTypePopupVisible] = useState(false);
    const [StoreyPopupVisible, setStoreyPopupVisible] = useState(false);
    const [addressDetail, setAddressDetail] = useState<AddressSearchResult | undefined>(undefined);
    const [error, setError] = useState<ErrorResponse | undefined>(undefined);
    const [buildingType, setBuildingType] = useState('detached');
    const [storey, setStorey] = useState(1);
    const [hasFinishedBasement, setHasFinishedBasement] = useState(false);
    const [otherExistingBuildings, setOtherExistingBuildings] = useState<string[]>([]);
    const [acceptDisclaimer, setAcceptDisclaimer] = useState(false);
    const history = useHistory();

    useEffect(() => {

        if (!placeInfo?.name || !placeInfo.id) return;
        /*
        fetch(`https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeInfo.id}&fields=address_component&key=${GOOGLE_API_KEY}`)
        .then(response => response.json())
        .then(data => {
            data.result.address_components
        })
        */

        fetch('api/address/search?place_id=' + placeInfo?.id)
        .then(async response => {
            if (response.status === 400) {
                setError(await response.json());
            } else if (response.ok) {
                const detail = (await response.json()) as AddressSearchResult; 
                setAddressDetail(detail);
                const newPlaceInfo: PlaceInfo = {...placeInfo!, detail: detail};
                setPlaceInfo(newPlaceInfo);
                setCoordinate(detail.latitude, detail.longitude);
                setError(undefined);
            }
        });
    }, []);

    const onCheckEligibility = () => {
        const extraInfo: AddressVerifyDetail = {
            buildingType: buildingType,
            storey: storey,
            hasFinishedBasement: hasFinishedBasement,
            otherExistingBuildings: otherExistingBuildings,
            mainHouseArea: undefined
        };
        setExtraInfo(extraInfo);

        fetch('api/address/detail/extra', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(extraInfo)
        }).then();
        history.push('/eligibility');
    }

    const onHome = () => {
        history.push('/home');
    }

    const onSelectBuildingType = (e: any, type: string) => {
        if (e.target.checked) {
            setBuildingType(type);
        }
    }

    const onHasFinishedBasementSelect = (e: any, value: boolean) => {
        if (e.target.checked) {
            setHasFinishedBasement(value);
        }
    }

    const onSelectStorey = (e: any) => {
        setStorey(parseInt(e.target.value));
    }

    const onSelectOtherExistingBuilding = (e: any, building: string) => {
        if (e.target.checked) {
            if (!otherExistingBuildings.includes(building)) {
                setOtherExistingBuildings([...otherExistingBuildings, building]);
            }
        } else {
            if (otherExistingBuildings.includes(building)) {
                setOtherExistingBuildings([...otherExistingBuildings.filter(b => b !== building)]);
            }
        }
    }

    const getAddressNotFound = () => {
        return (
            <>
                <h1 className='h1' style={{marginTop: '84px'}}>Sorry, we are at a dead end &#x1F6A7;</h1>
                <p className='mbottom-2'>We were unable to fetch property data for this address. This may be because:</p>
                <p className='mbottom-0'>1. The address you have entered is not a valid residential address.</p>
                <p className='mbottom-1'>2. The address is outside of our coverage. We are working to expand our municipality coverage and will announce them as we do so.</p>
                <div className='mbottom-5' style={{'textAlign': 'center'}}><button className='appbutton appbutton-primary' onClick={onHome}>Try a different address</button></div>
            </>);
    }

    const getBody = () => {
        if (!error && !addressDetail) {
            return null;
        }
        else if (!!error || !addressDetail) {
            return getAddressNotFound();
        } else {
            const imageUrl = `https://maps.googleapis.com/maps/api/streetview?location=${placeInfo!.name.replaceAll(', ', ',').replaceAll(' ', '+')}&size=1200x800&key=${GOOGLE_API_KEY}`;
            return (<>
                <section className='verify_breadcrumb_section'>
                    <div><button onClick={onHome} className='button_link'>Enter property address</button><span className='verify_breadcrumb_to'>&gt;</span><span className='p-bold'>About the property</span><span className='verify_breadcrumb_to'>&gt;</span>Property report</div>
                </section>
                <section className='verify_summary_section mbottom-6'>
                    <h1 className='h1' style={{marginBottom: '24px'}}>About the property &#x1F3E1;</h1>
                    <div className='line'>
                        <div>
                            <img src={imageUrl} style={{width: '387px', height: '377px', borderRadius: '5px 0 0 5px'}} alt='' />
                        </div>
                        <div className='verify_summary_text'>
                            <div><p className='mbottom-3 verify_summary_line'>Property address</p><p className='mbottom-1 verify_summary_line p-bold'>{placeInfo!.name}</p></div>
                            <div><p className='mbottom-3 verify_summary_line'>Zone Category</p><p className='mbottom-1 verify_summary_line p-bold'>{addressDetail.zoneCategory}</p></div>
                            <div><p className='mbottom-3 verify_summary_line'>Lot area</p><p className='mbottom-1 verify_summary_line p-bold'>{addressDetail.lotDetail.area.squareMeter} sq. metres</p></div>
                            <div><p className='mbottom-3 verify_summary_line'>Lot frontage</p><p className='mbottom-1 verify_summary_line p-bold'>{addressDetail.lotDetail.frontage.meter ?? 0} metres</p></div>
                            <button className='button_link' onClick={() => setDataSourcePopupVisible(true)}>How are these details obtained?</button>
                        </div>
                    </div>
                </section>
                <section className='mbottom-1'>
                    <div className='verify_status_line' style={{marginBottom: '37px'}}>Almost there! Please provide the following details.</div>
                    <div>
                        <p className='verify_question_line'><strong>1. Which building type best describes your house?</strong>&nbsp; <button className='button_link' onClick={() => setBuildingTypePopupVisible(true)}>Info</button></p>
                        <div className='verify_building_type_radio_button_group'>
                            <Form.Check checked={buildingType==='detached'} type='radio' id='verify_buildingtype_detached_radio' label='Detached House' onChange={e => onSelectBuildingType(e, 'detached')} />
                            <Form.Check checked={buildingType==='triplex'} type='radio' id='verify_buildingtype_triplex_radio' label='Triplex' onChange={e => onSelectBuildingType(e, 'triplex')} />
                            <Form.Check checked={buildingType==='semidetached'} type='radio' id='verify_buildingtype_semidetached_radio' label='Semi-detached House' onChange={e => onSelectBuildingType(e, 'semidetached')} />
                            <Form.Check checked={buildingType==='fourplex'} type='radio' id='verify_buildingtype_fourplex_radio' label='Fourplex' onChange={e => onSelectBuildingType(e, 'fourplex')} />
                            <Form.Check checked={buildingType==='duplex'} type='radio' id='verify_buildingtype_duplex_radio' label='Duplex' onChange={e => onSelectBuildingType(e, 'duplex')} />
                            <Form.Check checked={buildingType==='townhouse'} type='radio' id='verify_buildingtype_townhouse_radio' label='Townhouse' onChange={e => onSelectBuildingType(e, 'townhouse')} />
                        </div>
                    </div>
                    <div className='line_divider mtop-2 mbottom-1'></div>
                    <div>
                        <p className='verify_question_line'><strong>2. How many above-ground storeys (floors) does your house have?</strong>&nbsp; <button className='button_link' onClick={() => setStoreyPopupVisible(true)}>Info</button></p>
                        <div className='verify_question_select_line'>
                            <Form.Control as="select" value={storey} onChange={onSelectStorey}>
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                            <option value="4">4</option>
                            </Form.Control>
                        </div>
                    </div>
                    <div className='line_divider mtop-2 mbottom-1'></div>
                    <div>
                        <p className='verify_question_line'><strong>3. Does your house have a finished basement?</strong>&nbsp; <button className='button_link' onClick={() => setFinishedBasementPopupVisible(true)}>Info</button></p>
                        <div>
                            <Form.Check checked={!hasFinishedBasement} onChange={e => onHasFinishedBasementSelect(e, false)} type='radio' id='verify_basement_no_radio' className='verify_question_line' label='No' />
                            <Form.Check checked={hasFinishedBasement} onChange={e => onHasFinishedBasementSelect(e, true)} type='radio' id='verify_basement_yes_radio' label='Yes' />
                        </div>
                    </div>
                    <div className='line_divider mtop-2 mbottom-1'></div>
                    <div>
                        <p className='verify_question_line'><strong>4. Any legally existing ancillary structures on your property you plan to retain, in addition to the potential laneway suite? Select all that apply.</strong></p>
                        <div>
                            <Form.Check checked={otherExistingBuildings.includes('detachedgarage')} onChange={e => onSelectOtherExistingBuilding(e, 'detachedgarage')} type='checkbox' id='verify_extra_garage_radio' className='verify_question_line' label='Detached garage' />
                            <Form.Check checked={otherExistingBuildings.includes('lanewaysuite')} onChange={e => onSelectOtherExistingBuilding(e, 'lanewaysuite')} type='checkbox' id='verify_extra_laneway_radio' label='Laneway suite' />
                        </div>
                    </div>
                    <div className='line_divider mtop-2 mbottom-1'></div>
                    <div className='mbottom-1'>
                        <p className='mbottom-2'><span style={{color: '#BB4952'}}>*</span> This web service is for informational and illustrative purposes only. We cannot guarantee that this information is up-to-date or accurate, and provide no warranties. While some information is pulled from government sources, this web service is not a substitute for confirming the legality of any action you wish to take with your local municipality and/or legal counsel. Your use of this web service is at your own risk.</p>
                        <Form.Check style={{display: 'inline-block'}} checked={acceptDisclaimer} onChange={(e) => setAcceptDisclaimer(e.target.checked)} className='mbottom-0' label='I understand'></Form.Check> <span style={{color: '#BB4952'}}>*</span>
                    </div>
                </section>
                <div className='mbottom-5' style={{'textAlign': 'center'}}><button className='appbutton appbutton-primary' style={{'opacity': acceptDisclaimer ? 1 : 0.5}} disabled={!acceptDisclaimer} onClick={onCheckEligibility}>Check property potential</button></div>
            </>);
        }
    }
    return (
    <div>
        <TopBar selected=''/>
        <div className='container'>
            {getBody()}
        </div>
        <DataSourcePopup visible={DataSourcePopupVisible} onHide={() => setDataSourcePopupVisible(false)} />
        <FinishedBasementPopup visible={FinishedBasementPopupVisible} onHide={() => setFinishedBasementPopupVisible(false)} />
        <BuildingTypePopup visible={BuildingTypePopupVisible} onHide={() => setBuildingTypePopupVisible(false)} />
        <StoreyPopup visible={StoreyPopupVisible} onHide={() => setStoreyPopupVisible(false)} />
        <Footer />
    </div>);
}

export default VerifyPage;