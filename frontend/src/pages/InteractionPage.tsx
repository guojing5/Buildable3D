// @ts-ignore
import { AduOnMapScene, ViewerControl } from 'abode-atlas-adu-viewer';
// @ts-ignore
import { Api } from 'abode-atlas-adu-viewer/dist/utils/api';
import { lanewaySuites, placeInfo, setAdu0, setArea, setBuildable0, setLanewaySuites } from '../global/state';
import info from './../icons/info.svg';
import house from './house.svg';
import laws from './laws.svg';
import objects from './objects.svg';
import viewReport from './viewReport.svg';
import exit from './exit.svg';
import { GOOGLE_API_KEY } from '../global/credential';
import React, { useState } from 'react';
import maxSuiteSize from './maxSuiteSize.svg';
import separationDistance from './separationDistance.svg';
import setBacks from './setBacks.svg';
import landscaping from './landscaping.svg';
import lotAreaCoverage from './lotAreaCoverage.svg';
import backarrow from './backarrow.svg';
import buildableSpace from './buildableSpace.svg';
import checked1 from './checked1.svg';
import crossed from './crossed.svg';
import tree from './tree.svg';
import powerpole from './powerpole.svg';
import angularPlane from './angularPlane.svg';
import garagestorageshet from './garagestorageshet.svg';
import { AddressVerifyDetail } from '../models/AddressVerifyDetail';
import { GetBuildingTypeText, GetAdditionBuildingType } from '../utils/stringUtils';
import TotalAreaInputPopup from '../components/TotalAreaInputPopup';
import { AreaValueWithUnit } from '../models/AddressSearchResult';
import { RoundToDecimal, SquareFeetToSquareMeter, SquareMeterToSquareFeet } from '../utils/conversion';
import { useEffect } from 'react';
import { createContext } from 'react';
import regulationTreeItem from './regulationTreeItem.svg';
import firefighter from './firefighter.svg';
import parking from './parking.svg';
import { AduModelInfo, LanewaySuite } from '../models/LanewaySuite';
import { ADU, Buildable } from '../models/ParcelResponse';
import { ADUState, MaxSuiteState, SeparationDistanceState, SetbackState } from '../models/ViewerControlState';
import { useContext } from 'react';
import { useHistory } from 'react-router-dom';

const NAV_WIDTH = 256
const TAB_WIDTH = 414
const MAP_WIDTH = window.innerWidth - NAV_WIDTH - TAB_WIDTH
let setTabState: React.Dispatch<React.SetStateAction<string>> | undefined = undefined;
let setRegulationTabState: React.Dispatch<React.SetStateAction<string>> | undefined = undefined;
let setDetailedLanewaySuiteState: React.Dispatch<React.SetStateAction<LanewaySuite | undefined>> | undefined = undefined;
let selectedLanewaySuiteState: LanewaySuite | undefined = undefined;

function PropertyInfo() {
    const [TotalAreaInputPopupVisible, setTotalAreaInputPopupVisible] = useState(false);
    const [propertyArea, setPropertyArea] = useState(placeInfo?.extraInfo?.mainHouseArea);

    const extraInfo: AddressVerifyDetail | undefined = placeInfo?.extraInfo;

    const getAdditionalBuilding = () => {
        if (!extraInfo) {
            return <div><strong>-</strong></div>;
        }
        if (!extraInfo.otherExistingBuildings || extraInfo.otherExistingBuildings.length === 0) {
            return <div><strong>None</strong></div>;
        }
        return <div><strong>{extraInfo.otherExistingBuildings.map(GetAdditionBuildingType).join(', ')}</strong></div>;
    }

    const getAreaText = () => {
        if (!propertyArea) {
            return <strong>-</strong>;
        }
        if (propertyArea.unit === 'm') {
            return <><strong>{propertyArea.value} sq. m</strong> ({Math.round(SquareMeterToSquareFeet(propertyArea.value))} sq. ft)</>;
        }
        if (propertyArea.unit === 'ft') {
            return <><strong>{Math.round(SquareFeetToSquareMeter(propertyArea.value))} sq. m</strong> ({propertyArea.value} sq. ft)</>;
        }
        return <strong>-</strong>;
    }

    const onSubmitArea = (area: AreaValueWithUnit) => {
        setArea(area);
        setPropertyArea(area);
        setTotalAreaInputPopupVisible(false);
    }

    const imageUrl = `https://maps.googleapis.com/maps/api/streetview?location=${placeInfo!.name.replaceAll(', ', ',').replaceAll(' ', '+')}&size=1200x800&key=${GOOGLE_API_KEY}`;
    return (<>
    <div className='interaction_tab_heading_line mbottom-1 p-bold'>Property info</div>
    <div className='interaction_property_into_row' style={{'marginTop': '36px'}}><img src={imageUrl} className='interaction_property_info_img' alt="..." /></div>
    <div className='interaction_property_into_row'>
        <div>Address</div>
        <div><strong>{placeInfo!.name}</strong></div>
    </div>
    <div className='interaction_property_into_row'>
        <div>Zoning category</div>
        <div><strong>{placeInfo!.detail!.zoneCategory}</strong></div>
    </div>
    <div className='interaction_property_into_row'>
        <div>Lot area</div>
        <div className='p-bold'>{placeInfo!.detail!.lotDetail.area.squareMeter} sq. metres</div>
    </div>
    <div className='interaction_property_into_row'>
        <div>Lot frontage</div>
        <div><strong>{RoundToDecimal(placeInfo?.detail?.lotDetail.frontage.meter!, 1).toFixed(1)} metres</strong></div>
    </div>
    <div className='interaction_property_into_row'>
        <div className='line' style={{justifyContent: 'space-between'}}><div>Building type of main house</div><button className='button_link'>Edit</button></div>
        <div><strong>{!extraInfo ? '-' :(GetBuildingTypeText(extraInfo.buildingType))}</strong></div>
    </div>
    <div className='interaction_property_into_row'>
        <div className='line' style={{justifyContent: 'space-between'}}><div>Total area of main house</div><button className='button_link' onClick={() => setTotalAreaInputPopupVisible(true)}>Edit</button></div>
        <div>{getAreaText()}</div>
    </div>
    <div className='interaction_property_into_row'>
        <div className='line' style={{justifyContent: 'space-between'}}><div>Storey</div><button className='button_link'>Edit</button></div>
        <div><strong>{!extraInfo ? '-' : extraInfo.storey}</strong></div>
    </div>
    <div className='interaction_property_into_row'>
        <div className='line' style={{justifyContent: 'space-between'}}><div>Finished basement</div><button className='button_link'>Edit</button></div>
        <div><strong>{(!extraInfo) ? '-' : (extraInfo.hasFinishedBasement ? 'Yes' : 'No')}</strong></div>
    </div>
    <div className='interaction_property_into_row'>
        <div className='line' style={{justifyContent: 'space-between'}}><div>Additional buildings on property</div><button className='button_link'>Edit</button></div>
        <div><strong>{getAdditionalBuilding()}</strong></div>
    </div>
    <TotalAreaInputPopup visible={TotalAreaInputPopupVisible} onHide={() => setTotalAreaInputPopupVisible(false)} onSubmit={onSubmitArea} />
    </>);
}

function _evaluateCompliance(lanewaySuite: LanewaySuite | undefined): Compliance | undefined {
    if (!lanewaySuite) return undefined;
    const maxSuiteState = ViewerControl.getState('maxSuite') as MaxSuiteState;
    const separationDistanceState: SeparationDistanceState = ViewerControl.getState('separationLine');
    const roundedSeparationDistance = RoundToDecimal(separationDistanceState.separationLine.length, 1);
    const maxHeight: number = roundedSeparationDistance < 7.5 ? 4.0 : 6.0;
    const aduState = ViewerControl.getState('adu') as ADUState;

    let compliance: Compliance = {
        maximumSuiteSize: {
            currentHeightMetre: RoundToDecimal(lanewaySuite.aduModelInfo.height, 1),
            currentLengthMetre: RoundToDecimal(lanewaySuite.aduModelInfo.length, 1),
            currentWidthMetre: RoundToDecimal(lanewaySuite.aduModelInfo.width, 1),
            maxLengthMetre: RoundToDecimal(maxSuiteState.maxSuite.length, 1),
            maxWidthMetre: RoundToDecimal(maxSuiteState.maxSuite.width, 1),
            maxHeightMetre: maxHeight,
            sizeCompliant: RoundToDecimal(lanewaySuite.aduModelInfo.length, 1) <= RoundToDecimal(maxSuiteState.maxSuite.length, 1) &&
                RoundToDecimal(lanewaySuite.aduModelInfo.width, 1) <= RoundToDecimal(maxSuiteState.maxSuite.width, 1),
            heightCompliant: RoundToDecimal(lanewaySuite.aduModelInfo.height, 1) <= RoundToDecimal(maxHeight, 1),
            compliant: RoundToDecimal(lanewaySuite.aduModelInfo.height, 1) <= RoundToDecimal(maxHeight, 1) && 
                RoundToDecimal(lanewaySuite.aduModelInfo.length, 1) <= RoundToDecimal(maxSuiteState.maxSuite.length, 1) &&
                RoundToDecimal(lanewaySuite.aduModelInfo.width, 1) <= RoundToDecimal(maxSuiteState.maxSuite.width, 1)
        },
        angularPlane: {
            compliant: aduState?.adu.validation?.angularPlane
        },
        lotCoverage: {
            currentAreaSqMetre: RoundToDecimal(aduState.adu.area, 1),
            lotAreaSqMetre: placeInfo?.detail?.lotDetail.area.squareMeter!,
            maxAreaSqMetre: placeInfo?.detail?.lotDetail.area.squareMeter! * 0.3,
            compliant: RoundToDecimal(aduState.adu.area, 1) < RoundToDecimal(placeInfo?.detail?.lotDetail.area.squareMeter! * 0.3, 1)
        },
        separationDistance: {
            metre: roundedSeparationDistance,
            compliant: roundedSeparationDistance >= 5.0
        }
    }
    // @ts-ignore
    window.compliance = compliance;
    return compliance;
}

function LaneWaySuiteDetail(props: {suite: LanewaySuite, onBack: () => void}) {
    const { selectedLanewaySuite, setSelectedLanewaySuite, setEvaluation } = useContext(PageContext);
    const getPreviewElement = (suite: LanewaySuite) => {
        if (!!selectedLanewaySuite && selectedLanewaySuite.propertyId === suite.propertyId) {
            return (<button className='appbutton appbutton-secondary' onClick={() => {
                ViewerControl.previewAdu(false);
                selectedLanewaySuiteState = undefined; 
                setSelectedLanewaySuite(undefined);
                setEvaluation(undefined);
            }}>Remove</button>)
        } else {
            return (<button className='appbutton appbutton-primary' onClick={() => {
                selectedLanewaySuiteState = props.suite;
                setSelectedLanewaySuite(props.suite);
                ViewerControl.previewAdu(props.suite.propertyId);
                setTimeout(() => {
                    setEvaluation(_evaluateCompliance(suite));
                }, 1000);
            }}>Preview</button>);

        }
    }
    return (
    <>
        <div className='interaction_tab_heading_line mbottom-1'><img src={backarrow} alt='' onClick={() => props.onBack()} /></div>
        <h2 className='h2 mbottom-3'>{props.suite.name}</h2>
        <p className='mbottom-2'>by <button className='button_link'>{props.suite.studioName}</button></p>
        <p className='mbottom-0'>{props.suite.size.value} sq. m | Studio</p>
        <p className='mbottom-2'>Starting ${props.suite.priceStarting.amount}</p>
        <div className='mbottom-1'>{getPreviewElement(props.suite)}</div>
        <div className='line' style={{gap: '20px', overflowX: 'auto'}}>
            <div><img style={{height: '160px'}} src={process.env.PUBLIC_URL + "/lanewaysuites/" + props.suite.propertyId +"/detail1.png"} alt='' /></div>
            <div><img style={{height: '160px'}} src={process.env.PUBLIC_URL + "/lanewaysuites/" + props.suite.propertyId +"/detail2.png"} alt='' /></div>

        </div>
        <p className='p-bold mbottom-0'>Description</p>
        <p className='mbottom-1'>{props.suite.description}</p>
        <p className='p-bold mbottom-0'>Features</p>
        <ul className='mbottom-2'>
            {props.suite.features.map((f, i) => <li key={i}>{f}</li>)}
        </ul>
        <div className='mbottom-1'><button className='appbutton appbutton-secondary'><strong>Make it a fully accessible suite</strong></button></div>
        <p className='mbottom-3 p-bold'>Environment sustainability features</p>
        <ul className='mbottom-2'>
            {props.suite.featuresSustainability.map((f, i) => <li key={i}>{f}</li>)}
        </ul>
        <div className='mbottom-1'><button className='appbutton appbutton-secondary'><strong>Upgrade to a Net-Zero building</strong></button></div>
        <p className='mbottom-0 p-bold'>Financial incentives</p>
        <div><a href='https://www.toronto.ca/community-people/community-partners/affordable-housing-partners/laneway-suites-program/' target='_blank' rel='noreferrer' className='button_link'>Affordable Laneway Suites Program</a></div>
    </>

    );
}

function LaneWaySuites() {
    const { selectedLanewaySuite, setSelectedLanewaySuite, detailedLanewaySuite, setDetailedLanewaySuite, setEvaluation } = useContext(PageContext);

    const getPreviewElement = (suite: LanewaySuite) => {
        if (!!selectedLanewaySuite && selectedLanewaySuite.propertyId === suite.propertyId) {
            return (<button className='appbutton appbutton-secondary' onClick={() => {
                ViewerControl.previewAdu(false);
                selectedLanewaySuiteState = undefined;
                setSelectedLanewaySuite(undefined);
                setEvaluation(undefined);
            }}>Remove</button>)
        } else {
            return (<button className='appbutton appbutton-primary' onClick={() => {
                selectedLanewaySuiteState = suite;
                setSelectedLanewaySuite(suite);
                ViewerControl.previewAdu(suite.propertyId);
                setTimeout(() => {
                    setEvaluation(_evaluateCompliance(suite));                    
                }, 1000);
            }}>Preview</button>)
        }
    }

    const getLanewaySuiteElement = (suite: LanewaySuite, index: number) => {
        return (<div key={index} className='interaction_lanewaysuite_card mbottom-2'>
        <div><img onClick={() => setDetailedLanewaySuite(suite)} style={{width: '100%', cursor: 'pointer'}} src={process.env.PUBLIC_URL + "/lanewaysuites/" + suite.propertyId +"/title.png"} alt='' /></div>
        <div style={{padding: '24px'}}>
            <p className='mbottom-0 p-bold'>{suite.name}</p>
            <p className='mbottom-2'>by <button className='button_link'>{suite.studioName}</button></p>
            <p className='mbottom-0'>{suite.size.value} sq. m | Studio</p>
            <p className='mbottom-2'>Starting ${suite.priceStarting.amount}</p>
            <div className='line' style={{justifyContent: 'space-between', gap: '20px'}}>
                <button className='appbutton appbutton-secondary' onClick={() => setDetailedLanewaySuite(suite)}>Details</button>
                {getPreviewElement(suite)}
            </div>
        </div>
    </div>);
    };

    if (!!detailedLanewaySuite) {
        return <LaneWaySuiteDetail suite={detailedLanewaySuite} onBack={() => setDetailedLanewaySuite(undefined)} />;
    } else {
        return (<>
            <div className='interaction_tab_heading_line mbottom-1 p-bold'>Laneway suites</div>
            <p className='mbottom-2'>{lanewaySuites.length} of {lanewaySuites.length} results</p>
            {lanewaySuites.map((suite, i) => getLanewaySuiteElement(suite, i))}
        </>);
    }
}

function SwichButton(props: {initialShow: boolean, onChange: (value: boolean) => void}) {
    const [showing, setShowing] = useState(props.initialShow);
    const onChange = (event: any, on: boolean) => {
        event.stopPropagation();
        props.onChange(on);
        setShowing(on);
    }
    if (showing) {
        return (
            <div className='interaction_switch_hide' onClick={(e) => onChange(e, false)}>
                <div className='small-text' style={{lineHeight: '24px'}}>Hide</div>
                <div className='interaction_switch_circle'></div>
            </div>
        );

    }
    else {
        return (
            <div className='interaction_switch_show' onClick={(e) => onChange(e, true)}>
                <div className='interaction_switch_circle'></div>
                <div className='small-text' style={{lineHeight: '24px'}}>Show</div>
            </div>
        );
    }
}

function ByLaws() {
    const { evaluation, regulationToggles, setRegulationToggles, selectedRegulationTab } = useContext(PageContext);

    if (selectedRegulationTab === 'separationdistance') {
        return (<SeparationDistance onBack={() => setRegulationTabState!('')}></SeparationDistance>);
    }
    if (selectedRegulationTab === 'lotareacoverage') {
        return (<LotAreaCoverage onBack={() => setRegulationTabState!('')}></LotAreaCoverage>)
    }
    if (selectedRegulationTab === 'landscaping') {
        return (<Landscaping onBack={() => setRegulationTabState!('')}></Landscaping>)
    }
    if (selectedRegulationTab === 'buildablespace') {
        return (<BuildableSpace onBack={() => setRegulationTabState!('')}></BuildableSpace>)
    }
    if (selectedRegulationTab === 'setbacks') {
        return (<Setbacks onBack={() => setRegulationTabState!('')}></Setbacks>)
    }
    if (selectedRegulationTab === 'maximumsuitesize') {
        return (<MaximumSuiteSize onBack={() => setRegulationTabState!('')}></MaximumSuiteSize>)
    }
    if (selectedRegulationTab === 'angularplane') {
        return (<AngularPlane onBack={() => setRegulationTabState!('')}></AngularPlane>)
    }
    if (selectedRegulationTab === 'firefightingaccess') {
        return (<FirefightingAccess onBack={() => setRegulationTabState!('')}></FirefightingAccess>)
    }
    if (selectedRegulationTab === 'trees') {
        return (<Trees onBack={() => setRegulationTabState!('')}></Trees>)
    }
    if (selectedRegulationTab === 'parking') {
        return (<Parking onBack={() => setRegulationTabState!('')}></Parking>)
    }

    const getStatusBarElement = (object: any) => {
        if (!object) return null;
        if (object.compliant) {
            return <div className='interaction_by_laws_status_bar_success'></div>
        } else {
            return <div className='interaction_by_laws_status_bar_fail'></div>
        }
    }

    return (<>
        <div className='interaction_tab_heading_line mbottom-1 p-bold'>Regulations</div>
        <div className='interaction_by_laws_row mbottom-2'>Visualize regulations associated with planning for a laneway suite.</div>
        <div className='interaction_by_laws_category'>
            <div>
                <div className='p-bold'>Zoning By-law 569-2013</div>
                <div><button className='button_link'>Chapter 150.8, Laneway suites</button></div>
            </div>
        </div>

        <div>
            <div className='interaction_by_laws_item' onClick={() => setRegulationTabState!('buildablespace')}>
                <div className='interaction_by_laws_row_left'>
                    <div><img src={buildableSpace} alt='info' className='interaction_nav_icon' /></div>
                    <div>Buildable area</div>
                </div>
                <SwichButton initialShow={regulationToggles.buildableArea} onChange={(e) => {
                    setRegulationToggles({...regulationToggles, buildableArea: e})
                    ViewerControl.setVisibility('buildable', e)
                }} />
            </div>
            <div className='interaction_by_laws_item' onClick={() => setRegulationTabState!('maximumsuitesize')}>
                {getStatusBarElement(evaluation?.maximumSuiteSize)}
                <div className='interaction_by_laws_row_left'>
                    <div><img src={maxSuiteSize} alt='maximum suite size' className='interaction_nav_icon' /></div>
                    <div>Maximum suite size</div>
                </div>
                <SwichButton initialShow={regulationToggles.maximumSuiteSize} onChange={(e) => {
                    setRegulationToggles({...regulationToggles, maximumSuiteSize: e})
                    ViewerControl.setVisibility('maxSuite', e)
                }} />
            </div>
            <div className='interaction_by_laws_item' onClick={() => setRegulationTabState!('separationdistance')}>
                {getStatusBarElement(evaluation?.separationDistance)}
                <div className='interaction_by_laws_row_left'>
                    <div><img src={separationDistance} alt='separation distance' className='interaction_nav_icon' /></div>
                    <div>Separation distance</div>
                </div>
                <SwichButton initialShow={regulationToggles.separationDistance} onChange={(e) => {
                    setRegulationToggles({...regulationToggles, separationDistance: e})
                    ViewerControl.setVisibility('separationLine', e)
                }} />
            </div>
            <div className='interaction_by_laws_item' onClick={() => setRegulationTabState!('setbacks')}>
                <div className='interaction_by_laws_row_left'>
                    <div><img src={setBacks} alt='setbacks' className='interaction_nav_icon' /></div>
                    <div>Setbacks</div>
                </div>
                <SwichButton initialShow={regulationToggles.setBacks} onChange={(e) => {
                    setRegulationToggles({...regulationToggles, setBacks: e})
                    ViewerControl.setVisibility('setbacks', e)
                }} />
            </div>
            <div className='interaction_by_laws_item' onClick={() => setRegulationTabState!('angularplane')}>
                {getStatusBarElement(evaluation?.angularPlane)}
                <div className='interaction_by_laws_row_left'>
                    <div><img src={angularPlane} alt='info' className='interaction_nav_icon' /></div>
                    <div>Angular plane</div>
                </div>
                <SwichButton initialShow={regulationToggles.angularPlane} onChange={(e) => {
                    setRegulationToggles({...regulationToggles, angularPlane: e})
                    ViewerControl.setVisibility('angularPlane', e)
                }} />
            </div>
            <div className='interaction_by_laws_item' onClick={() => setRegulationTabState!('landscaping')}>
                <div className='interaction_by_laws_row_left'>
                    <div><img src={landscaping} alt='info' className='interaction_nav_icon' /></div>
                    <div>Landscaping</div>
                </div>
                <SwichButton initialShow={regulationToggles.landscaping} onChange={(e) => {
                    setRegulationToggles({...regulationToggles, landscaping: e})
                    ViewerControl.setVisibility('landscaping', e)
                }} />
            </div>
            <div className='interaction_by_laws_item' onClick={() => setRegulationTabState!('lotareacoverage')}>
                {getStatusBarElement(evaluation?.lotCoverage)}
                <div className='interaction_by_laws_row_left'>
                    <div><img src={lotAreaCoverage} alt='info' className='interaction_nav_icon' /></div>
                    <div>% Lot coverage</div>
                </div>
            </div>
        </div>

        <div className='interaction_by_laws_category'>
            <div className='p-bold'>Other important regulations</div>
        </div>
        <div>
            <div className='interaction_by_laws_item' onClick={() => setRegulationTabState!('firefightingaccess')}>
                <div className='interaction_by_laws_row_left'>
                    <div><img src={firefighter} alt='info' className='interaction_nav_icon' /></div>
                    <div>Firefighting access</div>
                </div>
            </div>
            <div className='interaction_by_laws_item' onClick={() => setRegulationTabState!('trees')}>
                <div className='interaction_by_laws_row_left'>
                    <div><img src={regulationTreeItem} alt='maximum suite size' className='interaction_nav_icon' /></div>
                    <div>Trees</div>
                </div>
            </div>
            <div className='interaction_by_laws_item' onClick={() => setRegulationTabState!('parking')}>
                <div className='interaction_by_laws_row_left'>
                    <div><img src={parking} alt='separation distance' className='interaction_nav_icon' /></div>
                    <div>Parking</div>
                </div>
            </div>
        </div>
    </>);
}

function FirefightingAccess(props: {onBack: () => void}) {
    return (<>
        <div className='interaction_tab_heading_line mbottom-1'><img src={backarrow} alt='' onClick={props.onBack} /></div>
        <h2 className='h2 mbottom-1'><img src={firefighter} className='mr-3' alt='' />Firefighting access</h2>
        <p className='mbottom-3 p-bold'>For a lot with adjacent lots</p>
        <ul className='mbottom-2'>
            <li>Firefighting access is through the side yard, which must have an unobstructed path of minimum 0.9 metres width by 2.1 metres height.</li>
            <li>Unobstructed path is maximum 45.0 metres from the laneway suite entrance to the public street, at which point a fire hydrant must be within 45.0 metres.</li>
            <li>If the above requirements are not possible, consider <a href='https://www.toronto.ca/services-payments/building-construction/apply-for-a-building-permit/building-permit-application-guides/renovation-and-new-house-guides/new-laneway-suite/providing-access-to-a-new-laneway-suite/' target='_blank' rel='noreferrer'>easement</a>.</li>
        </ul>
        <p className='mbottom-3 p-bold'>For a lot with an adjacent street or laneway</p>
        <ul className='mbottom-2'>
            <li>A maximum of 90.0 metres from the laneway suite entrance, via the adjacent street or laneway, to the public street, at which point a fire hydrant must be within 45.0 metres.</li>
        </ul>
        <p>More details and exemptions at <a href=' https://www.toronto.ca/wp-content/uploads/2020/12/8d26-Laneway-Suite-Fire-access-Travel-Distance-Sketch_-Dec-16-2020-acc.pdf' target='_blank' rel='noreferrer' className='button_link'>Providing Fire Department Access to a New Laneway Suite</a></p>
    </>)
}

function Trees(props: {onBack: () => void}) {
    return (<>
        <div className='interaction_tab_heading_line mbottom-1'><img src={backarrow} alt='' onClick={props.onBack} /></div>
        <h2 className='h2 mbottom-1'><img src={regulationTreeItem} className='mr-3' alt='' />Trees</h2>
        <p className='mbottom-2'>Trees, private or city-owned, that may potentially be damaged or removed as part of the laneway suite construction will need to be declared on the <a href='https://www.toronto.ca/wp-content/uploads/2017/10/8fda-Tree_Declaration.pdf' target='_blank' rel='noreferrer' className='button_link'>Tree Declaration Form</a>, as part of your Building Permit Application.</p>
        <p>We recommend using the services of an arborist to complete the declaration form. <a href='https://www.toronto.ca/311/knowledgebase/kb/docs/articles/parks,-forestry-and-recreation/urban-forestry/city-recommendations-for-tree-service-companies-tree-pruning-maintenance-hiring-a-private-arborist.html' target='_blank' rel='noreferrer' className='button_link'>Looking for an arborist?</a></p>
    </>
    )
}

function Parking(props: {onBack: () => void}) {
    return (<>
        <div className='interaction_tab_heading_line mbottom-1'><img src={backarrow} alt='' onClick={props.onBack} /></div>
        <h2 className='h2 mbottom-1'><img src={parking} className='mr-3' alt='' />Parking</h2>
        <p className='mbottom-2'>Properties with laneway suites are not required to have parking space for any of the dwelling units, including the principal residence or laneway suite.</p>
        <p className='mbottom-2'>However, parking space for two bicycles is required either inside the laneway suite or within the required setbacks.</p>
        <p className='mbottom-3 p-bold'>Minimum parking space dimensions</p>
        <ul className='mbottom-2'>
            <li>1.8 m in length</li>
            <li>0.6 m in width</li>
            <li>1.9 m in vertical clearance from the ground</li>
        </ul>
        <p className='mbottom-3 p-bold'>Minimum parking space dimensions if bicycle is mounted on a wall, structure, or mechanical device</p>
        <ul className='mbottom-2'>
            <li>1.9 m in length or vertical clearance</li>
            <li>0.6 m in width</li>
            <li>1.2 m in horizontal clearance from the wall</li>
        </ul>
        <p className='mbottom-3 p-bold'>Minimum dimensions for stacked bicycle parking</p>
        <ul className='mbottom-1'><li>1.2 m in vertical clearance for each bicycle</li></ul>
        <p className='mbottom-0'>By-law</p>
        <p><a href='https://www.toronto.ca/zoning/bylaw_amendments/ZBL_NewProvision_Chapter230.htm#230.5.1.10' target='_blank' rel='noreferrer' className='button_link'>230.5.1.10</a></p>
    </>
    )
}

function AngularPlane(props: {onBack: () => void}) {
    const { evaluation } = useContext(PageContext);

    const getStatusElement = () => {
        if (!evaluation || typeof evaluation.angularPlane.compliant === 'undefined') {
            return null;
        }
        if (evaluation.angularPlane.compliant) {
            return (<div className='interaction_regulations_approve_info'>
            <p className='mbottom-2'>No part of the laneway suite is penetrating the angular plane</p>
            <p className='mbottom-0'><img src={checked1} alt='' /> By-law regulation is met.</p>
            </div>)
        } else {
            return (<div className='interaction_regulations_unapprove_info'>
            <p className='mbottom-2'>Part of the laneway suite is penetrating the angular plane</p>
            <p className='mbottom-0'><img src={checked1} alt='' /> By-law regulation is not met.</p>
            </div>)
        }
    }

    return (<>
        <div className='interaction_tab_heading_line mbottom-1'><img src={backarrow} alt='' onClick={props.onBack} /></div>
        <h2 className='h2 mbottom-1'><img src={angularPlane} className='mr-3' alt='' />Angular plane</h2>
        <p className='mbottom-2'>No part of the laneway suite may penetrate this plane, which starts at 7.5 m from the rear main wall of the principal residence and at a height of 4.0 m. From this point, the plane is projected 45 degrees towards the rear lot line.</p>
        {getStatusElement()}
    </>)
}

function SeparationDistance(props: {onBack: () => void}) {
    const state : SeparationDistanceState = ViewerControl.getState('separationLine');

    const getStatusElement = () => {
        const roundedLength = RoundToDecimal(state.separationLine.length, 1);
        if (roundedLength >= 5) {
            return (
            <div className='mbottom-1 interaction_regulations_approve_info'>
                <p className='mbottom-0'>Current separation distance</p>
                <p className='mbottom-2 p-bold'>{roundedLength.toFixed(1)} m</p>
                <p className='mbottom-0'><img src={checked1} alt='' className='mright-2' /> By-law regulation is met.</p>
            </div>);
        } else {
            return (
            <div className='mbottom-1 interaction_regulations_unapprove_info'>
                <p className='mbottom-0'>Current separation distance</p>
                <p className='mbottom-2 p-bold'>{roundedLength.toFixed(1)} m</p>
                <p className='mbottom-0'><img src={crossed} alt='' className='mright-2' /> By-law regulation is not met.</p>
            </div>
            );
        }
    }

    return (<>
        <div className='interaction_tab_heading_line mbottom-1'><img src={backarrow} alt='' onClick={props.onBack} /></div>
        <h2 className='h2'><img src={separationDistance} className='mr-3' alt='' />Separation distance</h2>
        <p className='mbottom-2'>The distance between the rear main wall of the principal residence and the front wall of the laneway suite must be a minimum of 5.0 m.</p>
        {getStatusElement()}
        <p className='mbottom-2'>If separation distance is under 7.5 m, a <button className='button_link' onClick={() => setRegulationTabState!('maximumsuitesize')}>maximum laneway suite height</button> of 4.0 m is allowed. If 7.5 m or greater, a maximum height of 6.0 m is allowed.</p>
        <div className='interaction_by_laws_divider' />
        <p className='mbottom-0'>By-law</p>
        <p className='mbottom-0'><a href='https://www.toronto.ca/zoning/bylaw_amendments/ZBL_NewProvision_Chapter150_8.htm#150.8.60.30' target='_blank' rel='noreferrer' className='button_link'>150.8.60.30</a></p>
        <p><a href='https://www.toronto.ca/zoning/bylaw_amendments/ZBL_NewProvision_Chapter150_8.htm#150.8.60.40' target='_blank' rel='noreferrer' className='button_link'>150.8.60.40</a></p>
    </>);
}

function LotAreaCoverage(props: {onBack: () => void}) {
    const { evaluation } = useContext(PageContext);
    const areaThreshold = 0.3 * (placeInfo?.detail?.lotDetail.area.squareMeter || 0);

    const getStatusElement = () => {
        if (!evaluation) {
            return null;
        }
        
        if (evaluation.lotCoverage.compliant) {
            return (
            <div className='mbottom-1 interaction_regulations_approve_info'>
                <p className='mbottom-0'>Current lot coverage</p>
                <p className='p-bold'>{RoundToDecimal(evaluation.lotCoverage.currentAreaSqMetre * 100 / placeInfo?.detail?.lotDetail.area.squareMeter!, 1)}%; {evaluation.lotCoverage.currentAreaSqMetre} sq. m</p>
                <p className='mbottom-0'><img src={checked1} alt='' className='mright-2' /> By-law regulation is met.</p>
            </div>);
        } else {
            return (
            <div className='mbottom-1 interaction_regulations_unapprove_info'>
                <p className='mbottom-0'>Current lot coverage</p>
                <p className='p-bold'>{RoundToDecimal(evaluation.lotCoverage.currentAreaSqMetre * 100 / placeInfo?.detail?.lotDetail.area.squareMeter!, 1)}%; {evaluation.lotCoverage.currentAreaSqMetre} sq. m</p>
                <p className='mbottom-0'><img src={crossed} alt='' className='mright-2' /> By-law regulation is not met.</p>
            </div>);
        }
    }
    return (<>
        <div className='interaction_tab_heading_line mbottom-1'><img src={backarrow} alt='' onClick={props.onBack} /></div>
        <h2 className='h2'><img src={lotAreaCoverage} className='mr-3' alt='' />% Lot coverage</h2>
        <p className='mbottom-2'>All ancillary buildings' footprint, including the laneway suite, may not cover more than 30% of the lot area.</p>
        <div className='interaction_regulations_user_info mbottom-3'>
            <p className='mbottom-0'>Your lot area</p>
            <p className='mbottom-2 p-bold'>{RoundToDecimal(placeInfo?.detail?.lotDetail.area.squareMeter || 0, 1).toFixed(1)} sq. m</p>
            <p className='mbottom-0'>Therefore, lot coverage of ancillary buildings may not exceed</p>
            <p className='mbottom-0 p-bold'>{RoundToDecimal(areaThreshold, 1).toFixed(1)} sq. m</p>
        </div>
        {getStatusElement()}
        <div className='interaction_by_laws_divider' />
        <p className='mbottom-0'>By-law</p>
        <p><a href='https://www.toronto.ca/zoning/bylaw_amendments/ZBL_NewProvision_Chapter150_8.htm#150.8.60.70' target='_blank' rel='noreferrer' className='button_link'>150.8.60.70</a></p>
    </>);
}

function Landscaping(props: {onBack: () => void}) {
    const frontage: number = RoundToDecimal(placeInfo?.detail?.lotDetail.frontage.meter!, 1);
    return (<>
        <div className='interaction_tab_heading_line mbottom-1'><img src={backarrow} alt='' onClick={props.onBack} /></div>
        <h2 className='h2 mbottom-2'><img src={landscaping} className='mr-3' alt='' />Landscaping</h2>
        <p className='mbottom-2'>The area between the rear main wall of the principal residence and the front wall of the laneway suite requires minimum 60% soft landscaping (natural grass, trees, plants), if the lot frontage is 6.0 m or less. If greater than 6.0 m, minimum 85% of the area must be soft landscaping.</p>
        <div className='interaction_regulations_user_info mbottom-1'>
            <p className='mbottom-0'>Your lot frontage</p>
            <p className='mbottom-2 p-bold'>{frontage.toFixed(1)} m</p>
            <p className='mbottom-0'>Therefore, the required soft landscaping area is</p>
            <p className='mbottom-0 p-bold'>{frontage <= 6.0 ? '60%' : '85%'}</p>
        </div>
        <p className='mbottom-2'>The area between the laneway suite and the lot line next to the laneway requires landscaping, of which a minimum of 75% must be soft landscaping.</p>
        <p className='mbottom-0'>By-law</p>
        <p className='mbottom-3'><a href='https://www.toronto.ca/zoning/bylaw_amendments/ZBL_NewProvision_Chapter150_8.htm#150.8.50.10' target='_blank' rel='noreferrer' className='button_link'>150.8.50.10</a></p>
    </>);
}

function BuildableSpace(props: {onBack: () => void}) {
    return (<>
        <div className='interaction_tab_heading_line mbottom-1'><img src={backarrow} alt='' onClick={props.onBack} /></div>
        <h2 className='h2'><img src={buildableSpace} className='mr-3' alt='' />Buildable Area</h2>
        <p className='mbottom-2'>The buildable space on your property is the area within which a laneway suite may be built. This is determined by the following factors:</p>
        <p className='mbottom-0 p-bold'>Separation distance</p>
        <ul className='mbottom-2'><li>Minimum of 5.0 m separation between the rear main wall of the principal residence. <button className='button_link' onClick={() => setRegulationTabState!('separationdistance')}>Read more</button></li></ul>
        <p className='mbottom-0 p-bold'>Setbacks</p>
        <ul className='mbottom-2'><li>Rear and side yard setbacks are determined by the presence of a laneway or street adjacent to the rear or side lot lines, as well as laneway suite features like windows and doors. <button className='button_link' onClick={() => setRegulationTabState!('setbacks')}>Read more</button></li></ul>
        <div className='interaction_regulations_user_info'>
            <p className='mbottom-0'>Total potential buildable space</p>
            <p className='mbottom-2'><strong>{RoundToDecimal(placeInfo?.buildable0?.footprintArea || 0, 1)} sq. m</strong> ({RoundToDecimal(SquareMeterToSquareFeet(placeInfo?.buildable0?.footprintArea || 0), 0)} sq. ft)</p>
            <p className='mbottom-0'>Current buildable space*</p>
            <p className='mbottom-2'><strong>{RoundToDecimal(placeInfo?.buildable0?.footprintArea || 0, 1)} sq. m</strong> ({RoundToDecimal(SquareMeterToSquareFeet(placeInfo?.buildable0?.footprintArea || 0), 0)} sq. ft)</p>
            <p className='small-text'>*The current buildable space may be less if a previewed suite requires a greater separation distance or setbacks to be legal. </p>
        </div>
        <p className='mbottom-0'>By-law</p>
        <p className='mbottom-0'><a href='https://www.toronto.ca/zoning/bylaw_amendments/ZBL_NewProvision_Chapter150_8.htm#150.8.60.20' target='_blank' rel='noreferrer' className='button_link'>150.8.60.20</a></p>
        <p><a href='https://www.toronto.ca/zoning/bylaw_amendments/ZBL_NewProvision_Chapter150_8.htm#150.8.60.30' target='_blank' rel='noreferrer' className='button_link'>150.8.60.30</a></p>
    </>);
}

function Setbacks(props: {onBack: () => void}) {
    const state = ViewerControl.getState('setbacks') as SetbackState;
    return (<>
        <div className='interaction_tab_heading_line mbottom-1'><img src={backarrow} alt='' onClick={props.onBack} /></div>
        <h2 className='h2'><img src={setBacks} className='mr-3' alt='' />Setbacks</h2>
        <p className='mbottom-2'>The minimum rear and side yard setbacks are 1.5 m, except when:</p>
        <ul className='mbottom-2'><li>Rear lot line is not next to a laneway, street, driveway, or facing any laneway suite features like doors or windows; Rear yard setbacks can be 0 m in this case.</li></ul>
        <div className='interaction_regulations_user_info mbottom-1'>
            <p className='mbottom-0'>Current minimum rear yard setback <strong>{RoundToDecimal(state.setbacks.rear, 1)} m</strong></p>
        </div>
        <ul className='mbottom-2'><li>Side lot line is not next to a laneway, street, driveway, or facing any laneway suite features like doors or windows; Side yard setbacks can be 0 m in this case.</li></ul>
        <div className='interaction_regulations_user_info'>
            <p className='mbottom-0'>Current minimum side yard setback <strong>0.0 m</strong></p>
        </div>
        <div className='interaction_by_laws_divider' />
        <p className='mbottom-0'>By-law</p>
        <p><a href='https://www.toronto.ca/zoning/bylaw_amendments/ZBL_NewProvision_Chapter150_8.htm#150.8.60.20' target='_blank' rel='noreferrer' className='button_link'>150.8.60.20</a></p>
    </>);
}

function MaximumSuiteSize(props: {onBack: () => void}) {
    const separatioinDistanceState: SeparationDistanceState = ViewerControl.getState('separationLine');
    const maxHeight: number = separatioinDistanceState.separationLine.length < 7.5 ? 4.0 : 6.0;
    const state = ViewerControl.getState('maxSuite') as MaxSuiteState;
    const { evaluation } = useContext(PageContext);

    const getLanewaySuiteSizeElement = () => {
        if (!!evaluation) {
            return <p className='mbottom-2 p-bold'>{evaluation.maximumSuiteSize.currentLengthMetre.toFixed(1)} &times; {evaluation.maximumSuiteSize.currentWidthMetre.toFixed(1)} m</p>
        } else {
            return <p className='mbottom-2 p-bold'>0 &times; 0 m</p>;
        }
    }

    const getLanewaySuiteSizeSectionElement = (maxSuiteLength: number, maxSuiteWidth: number) => {
        if (!evaluation) {
            return null;
        }
        if (evaluation.maximumSuiteSize.sizeCompliant) {
            return (
                <div className='interaction_regulations_approve_info mbottom-2'>
                <p className='mbottom-0'>Current laneway suite size (L &times; W)</p>
                {getLanewaySuiteSizeElement()}
                <div><img src={checked1} style={{marginRight: '18px'}} alt='' /> By-law regulation is met</div>
                </div>
            );
        } else {
            return (
                <div className='interaction_regulations_unapprove_info mbottom-2'>
                <p className='mbottom-0'>Current laneway suite size (L &times; W)</p>
                {getLanewaySuiteSizeElement()}
                <div><img src={crossed} style={{marginRight: '18px'}} alt='' /> By-law regulation is not met</div>
                </div>
            );
        }
    }

    const getLanewaySuiteHeightElement = () => {
        if (!!evaluation) {
            return <p className='mbottom-2 p-bold'>{evaluation.maximumSuiteSize.currentHeightMetre.toFixed(1)} m</p>
        } else {
            return <p className='mbottom-2 p-bold'>0 m</p>;
        }
    }

    const getLanewaySuiteHeightSectionElement = () => {
        if (!evaluation) {
            return null;
        }
        if (evaluation.maximumSuiteSize.heightCompliant) {
            return (
                <div className='interaction_regulations_approve_info mbottom-2'>
                <p className='mbottom-0'>Current laneway suite height</p>
                {getLanewaySuiteHeightElement()}
                <div><img src={checked1} style={{marginRight: '18px'}} alt='' /> By-law regulation is met</div>
                </div>
            );
        } else {
            return (
                <div className='interaction_regulations_unapprove_info mbottom-2'>
                <p className='mbottom-0'>Current laneway suite height</p>
                {getLanewaySuiteHeightElement()}
                <div><img src={crossed} style={{marginRight: '18px'}} alt='' /> By-law regulation is not met</div>
                </div>
            );
        }
    }

    return (<>
        <div className='interaction_tab_heading_line mbottom-1'><img src={backarrow} alt='' onClick={props.onBack} /></div>
        <h2 className='h2'><img src={maxSuiteSize} className='mr-3' alt='' />Maximum Suite Size</h2>
        <p className='mbottom-2'>The blue box defines the maximum dimensions of a laneway suite at a particular spot within the <button className='button_link' onClick={() => setRegulationTabState!('buildablespace')}>buildable area</button>.</p>
        <div className='interaction_regulations_user_info mbottom-3'>
            <p className='mbottom-0'>Maximum suite size (L &times; W)</p>
            <p className='mbottom-0 p-bold'>{RoundToDecimal(state.maxSuite.length, 1).toFixed(1)} &times; {RoundToDecimal(state.maxSuite.width, 1).toFixed(1)} m</p>
        </div>
        {getLanewaySuiteSizeSectionElement(state.maxSuite.length, state.maxSuite.width)}
        <div className='interaction_by_laws_divider' />
        <p className='mbottom-2'>If <button className='button_link' onClick={() => setRegulationTabState!('separationdistance')}>separation distance</button> is under 7.5 m, a maximum laneway suite height of 4.0 m is allowed. If 7.5 m or greater, a maximum height of 6.0 m is allowed.</p>
        <div className='interaction_regulations_user_info mbottom-3'>
            <p className='mbottom-0'>Maximum laneway suite height at current separation distance</p>
            <p className='mbottom-0 p-bold'>{maxHeight.toFixed(1)} m</p>
        </div>
        {getLanewaySuiteHeightSectionElement()}
        <p className='mbottom-0'>By-law</p>
        <p className='mbottom-0'><a href='https://www.toronto.ca/zoning/bylaw_amendments/ZBL_NewProvision_Chapter150_8.htm#150.8.60.30' target='_blank' rel='noreferrer' className='button_link'>150.8.60.30</a></p>
        <p><a href='https://www.toronto.ca/zoning/bylaw_amendments/ZBL_NewProvision_Chapter150_8.htm#150.8.60.40' target='_blank' rel='noreferrer' className='button_link'>150.8.60.40</a></p>
    </>);
}

function Objects() {
    return (<>
        <div className='interaction_tab_heading_line mbottom-1 p-bold'>Objects</div>
        <div className='mbottom-1'>Add objects on your property to this visualization.</div>
        <div className='line p-bold' style={{justifyContent: 'space-between', alignItems: 'center'}}><div><img src={tree} style={{marginRight: '26px'}} alt='' />Tree</div><button className='interaction_object_add_button'>Add</button></div>
        <div className='line_divider mtop-2 mbottom-1'></div>
        <div className='line p-bold' style={{justifyContent: 'space-between', alignItems: 'center'}}><div><img src={powerpole} style={{marginRight: '26px'}} alt='' />Power pole</div><button className='interaction_object_add_button'>Add</button></div>
        <div className='line_divider mtop-2 mbottom-1'></div>
        <div className='line p-bold' style={{justifyContent: 'space-between', alignItems: 'center'}}><div><img src={garagestorageshet} style={{marginRight: '26px'}} alt='' />Garage or storage shed</div><button className='interaction_object_add_button'>Add</button></div>
        <div className='line_divider mtop-2 mbottom-1'></div>
    </>);
}

interface Compliance {
    maximumSuiteSize: {
        maxLengthMetre: number;
        currentLengthMetre: number; // from laneway suite
        maxWidthMetre: number;
        currentWidthMetre: number; // from laneway suite
        maxHeightMetre: number;
        currentHeightMetre: number; // from laneway suite
        sizeCompliant: boolean;
        heightCompliant: boolean;
        compliant: boolean;
    },
    separationDistance: {
        metre: number;
        compliant: boolean;
    },
    angularPlane: {
        compliant?: boolean;
    },
    lotCoverage: {
        lotAreaSqMetre: number;
        maxAreaSqMetre: number;
        currentAreaSqMetre: number; // from laneway suite
        compliant: boolean;
    }
}

interface RegulationToggle {
    buildableArea: boolean;
    maximumSuiteSize: boolean;
    separationDistance: boolean;
    setBacks: boolean;
    angularPlane: boolean;
    landscaping: boolean;
}

const INITIAL_REGULATION_TOGGLE: RegulationToggle = {
    buildableArea: true,
    maximumSuiteSize: true,
    separationDistance: false,
    setBacks: false,
    angularPlane: false,
    landscaping: false
};

const visibility = {
    'maxSuite': true,
    'separationLine': false,
    'setbacks': false,
    'landscaping': false,
    'buildable': true,
    'adu': false,
    'angularPlane': false,
    'mainBuilding': true,
    'tree': true
}

function InputSection(props: {initialTab: string}) {
    const [tab, setTab] = useState(props.initialTab);
    const [regulationTab, setRegulationTab] = useState('');
    const [detailedLanewaySuite, setDetailedLanewaySuite] = useState<LanewaySuite | undefined>(undefined);
    setTabState = setTab;
    setRegulationTabState = setRegulationTab;
    const [selectedLanewaySuite, setSelectedLanewaySuite] = useState<LanewaySuite | undefined>(undefined);
    setDetailedLanewaySuiteState = setDetailedLanewaySuite;
    const [evaluation, setEvaluation] = useState<Compliance | undefined>(undefined);
    const [regulationToggles, setRegulationToggles] = useState<RegulationToggle>(INITIAL_REGULATION_TOGGLE);
    const getTab = () => {
        switch (tab) {
            case 'propertyInfo':
                return <PropertyInfo />;
            case 'lanewaySuites':
                return <LaneWaySuites />;
            case 'bylaws':
                return <ByLaws />;
            case 'objects':
                return <Objects />;
            case 'viewReport':
            default:
                return null;
        }
    }

    const history = useHistory();
    const backToEligibility = () => {
        history.push('/eligibility');
    }

    const w = '' + NAV_WIDTH + 'px'
    return (<>
    <PageContext.Provider value={{selectedLanewaySuite, setSelectedLanewaySuite, detailedLanewaySuite, setDetailedLanewaySuite, evaluation, setEvaluation, regulationToggles, setRegulationToggles, selectedRegulationTab: regulationTab}}>
    <div style={{padding: '0 36px', 'backgroundColor': '#111D4A', 'color': '#A9B2D2', flexShrink: 0, width: w }}>
        <div className='interaction_heading_line p-bold'>EXPLORE</div>
        <div style={{'marginTop': '36px'}} className={tab==='propertyInfo' ? 'interaction_nav_row_selected' : 'interaction_nav_row'} onClick={() => setTab('propertyInfo')}><img src={info} alt='info' className='interaction_nav_icon' />Property Info</div>
        <div className={tab==='bylaws' ? 'interaction_nav_row_selected' : 'interaction_nav_row'} onClick={() => setTab('bylaws')}><img src={laws} alt='' className='interaction_nav_icon' />Regulations</div>
        <div className={tab==='lanewaySuites' ? 'interaction_nav_row_selected' : 'interaction_nav_row'} onClick={() => setTab('lanewaySuites')}><img src={house} alt='' className='interaction_nav_icon' />Laneway suites</div>
        <div className={tab==='viewReport' ? 'interaction_nav_row_selected' : 'interaction_nav_row'} onClick={() => setTab('viewReport')}><img src={viewReport} alt='' className='interaction_nav_icon' />View Report</div>
        <div className={tab==='objects' ? 'interaction_nav_row_selected' : 'interaction_nav_row'} style={{opacity: 0.5}}><img src={objects} alt='' className='interaction_nav_icon' /><div style={{display: 'flex', flexDirection: 'column'}}><div>Objects</div><div style={{fontSize: '12px'}}>In Development</div></div></div>
        <div className='interaction_nav_row' style={{'height': '1px', 'width': '100%', 'backgroundColor': '#7A83A4'}}></div>
        <div className='interaction_nav_row' onClick={() => backToEligibility()}><img src={exit} alt='' className='interaction_nav_icon' />Exit</div>
    </div>
    <div className='interaction_tab_container'>
        {getTab()}
    </div>
    </PageContext.Provider>
    </>);

}

interface AduModelInfoMap {
    [key: string]: AduModelInfo
};

interface InteractionPageContext {
    selectedLanewaySuite: LanewaySuite | undefined;
    setSelectedLanewaySuite: React.Dispatch<React.SetStateAction<LanewaySuite | undefined>>;
    detailedLanewaySuite: LanewaySuite | undefined;
    setDetailedLanewaySuite: React.Dispatch<React.SetStateAction<LanewaySuite | undefined>>;
    evaluation: Compliance | undefined;
    setEvaluation: React.Dispatch<React.SetStateAction<Compliance | undefined>>;
    regulationToggles: RegulationToggle;
    setRegulationToggles: React.Dispatch<React.SetStateAction<RegulationToggle>>;
    selectedRegulationTab: string
}

const PageContext = createContext<InteractionPageContext>({
    selectedLanewaySuite: undefined,
    setSelectedLanewaySuite: () => null,
    detailedLanewaySuite: undefined,
    setDetailedLanewaySuite: () => null,
    evaluation: undefined,
    setEvaluation: () => null,
    regulationToggles: INITIAL_REGULATION_TOGGLE,
    setRegulationToggles: () => null,
    selectedRegulationTab: ''
});

function InteractionPage() {
    const [aduModelInfos, setAduModelInfos] = useState<AduModelInfoMap | undefined>(undefined);
    
    useEffect(() => {
        if (!lanewaySuites || lanewaySuites.length === 0) {
            fetch('api/lanewaySuites/list')
            .then(async response => {
                if (response.status === 200) {
                    const suites = (await response.json()) as LanewaySuite[];
                    if (suites.length > 0) {
                        const map: AduModelInfoMap = {};
                        suites.forEach(suite => {
                            map[suite.propertyId] = {...suite.aduModelInfo, data: process.env.PUBLIC_URL + '/lanewaysuites/' + suite.propertyId + '/model.dae'};
                            //if (suite.aduModelInfo.isDefault === true) {
                            //    map['aduFront'] = {...suite.aduModelInfo, data: PUBLIC_ASSETS + suite.aduModelInfo.data};
                            //}
                        });
                        setAduModelInfos(map);
                    }
                    setLanewaySuites(suites);
                }
            });
        }

        if (!!placeInfo && typeof placeInfo.latitude !== 'undefined' && typeof placeInfo.longitude !== 'undefined') {
            const center = {
                latitude: placeInfo.latitude!,
                longitude: placeInfo.longitude!,
            };
            Api.fetchParcelData(center).then((data: any) => {
                setBuildable0(data.buildable0.rawProps as Buildable);
                setAdu0(data.maxAdu0.rawProps as ADU);
            });
        }

    }, []);

    if (!placeInfo || typeof placeInfo.latitude === 'undefined' || typeof placeInfo.longitude === 'undefined' || !placeInfo.detail) {
        return (<div>The location's coordinate is not available.</div>);
    }
    const COORDINATES = {
        latitude: placeInfo.latitude!,
        longitude: placeInfo.longitude!,
    };

    const style = {
        height: '100%', // window.innerHeight, // '800px',
        width: '' + MAP_WIDTH + 'px'
        //width: '800px', // window.innerWidth, // '800px',
    }
    if (!!aduModelInfos) {
        return (
            <div style={{'display': 'flex'}}>                
                <InputSection initialTab={'propertyInfo'} />
                <div id='debug-point-div' style={{'display': 'none'}}></div>
                <div style={{'flex': 1}}><AduOnMapScene center={COORDINATES} style={style} locationId={placeInfo.id} visibility={visibility} catalogue={aduModelInfos} onClick={(type: string) => {
                    if (type === 'adu') {
                        if (!!setDetailedLanewaySuiteState) setDetailedLanewaySuiteState(selectedLanewaySuiteState);
                        if (!!setTabState) setTabState('lanewaySuites');
                    } else if (type === 'buildable') {
                        if (!!setTabState) setTabState('bylaws');
                        if (!!setRegulationTabState) setRegulationTabState('buildablespace');
                    } else if (type === 'maxSuite') {
                        if (!!setTabState) setTabState('bylaws');
                        if (!!setRegulationTabState) setRegulationTabState('maximumsuitesize');
                    } else if (type === 'separationLine') {
                        if (!!setTabState) setTabState('bylaws');
                        if (!!setRegulationTabState) setRegulationTabState('separationdistance');
                    } else if (type === 'setbacks') {
                        if (!!setTabState) setTabState('bylaws');
                        if (!!setRegulationTabState) setRegulationTabState('setbacks');
                    } else if (type === 'landscaping') {
                        if (!!setTabState) setTabState('bylaws');
                        if (!!setRegulationTabState) setRegulationTabState('landscaping');
                    } else if (type === 'angularPlane') {
                        if (!!setTabState) setTabState('bylaws');
                        if (!!setRegulationTabState) setRegulationTabState('angularplane');
                    }
                    else {
                        console.log("----- type", type);
                    }
                }} /></div>
            </div>
        );
    } else {
        return null;
    }
}

export default InteractionPage;