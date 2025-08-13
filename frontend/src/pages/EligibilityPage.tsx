import { useHistory } from "react-router-dom";
import Footer from "../components/Footer";
import TopBar from "../components/TopBar";
import checked from './checked.svg'
import { placeInfo } from "../global/state";

function EligibilityPage() {
    const history = useHistory();

    const onPlanning = () => {
        history.push('/interaction');
    }

    const onHome = () => {
        history.push('/home');
    }

    const onBack = () => {
        history.push('/verify');
    }

    if (!placeInfo?.detail?.adu0 && !placeInfo?.detail?.adu1) {
        return (
        <div>
            <TopBar selected=''/>
            <div className="container">
                <section className='verify_breadcrumb_section'>
                    <div><button onClick={onHome} className='button_link'>Enter property address</button><span className='verify_breadcrumb_to'>&gt;</span><button className='button_link' onClick={onBack}>About the property</button><span className='verify_breadcrumb_to'>&gt;</span><span className='p-bold'>Property report</span></div>
                </section>
                <div style={{'marginTop': '54px'}}>
                    <h1 className='h1'>Hmm, a laneway suite may not be possible here... &#x1F615;</h1>
                    <h2 className='h2 mbottom-1'>{placeInfo?.name} does not seem to meet the preliminary criteria for a laneway suite.</h2>
                    <p className='mbottom-1'>This may be due to one or more of the following reasons:</p>
                    <ol>
                        <li>The property is not located within a designated Neighbourhood, as per the City of Toronto’s Official Plan land use.</li>
                        <li>The property is not zoned as Residential Detached, Residential Semi-Detached, Residential Townhouse or Residential Multiple Dwelling.</li>
                        <li>The property’s rear lot line or side lot line is not next to a laneway for at least 3.5 metres.</li>
                        <li>A separation distance of at least 5.0 metres between the potential laneway suite and the main rear wall of the principal residence may not be possible.</li>
                    </ol>
                </div>
            </div>
        </div>
        );
    }

    return (
    <div>
        <TopBar  selected='' />
        <div className="container">
            <section className='verify_breadcrumb_section'>
                <div><button onClick={onHome} className='button_link'>Enter property address</button><span className='verify_breadcrumb_to'>&gt;</span><button className='button_link' onClick={onBack}>About the property</button><span className='verify_breadcrumb_to'>&gt;</span><span className='p-bold'>Property report</span></div>
            </section>
            <div style={{'marginTop': '54px'}}>
                <section className='mbottom-5'>
                    <h1 className='h1'>Good news, there is potential for a laneway suite! &#x1F389;</h1>
                    <h2 className='h2 mbottom-1'>{placeInfo.name} meets the preliminary criteria for a laneway suite, as outlined below.</h2>
                    <div className='line_divider mbottom-1'></div>
                    <table className='eligibility_table'>
                        <thead>
                            <tr className='bolder'>
                                <td>Criteria under Zoning By-law 569-2013, <button className='button_link p-bold'>Chapter 150.8</button></td>
                                <td style={{width: 160}}>Property result</td>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style={{paddingRight: '24px'}}>Property is located within a designated Neighbourhood, as per the City of Toronto’s Official Plan land use</td>
                                <td style={{width: 160}}><img src={checked} alt='checked' height='24px' /></td>
                            </tr>
                            <tr>
                                <td style={{paddingRight: '24px'}}>Site is zoned Residential Detached, Residential Semi-Detached, Residential Townhouse or Residential Multiple Dwelling</td>
                                <td style={{width: 160}}><img src={checked} alt='checked' height='24px' /></td>
                            </tr>
                            <tr>
                                <td style={{paddingRight: '24px'}}>A public lane is next to the property’s rear lot line or side lot line for at least 3.5 metres</td>
                                <td style={{width: 160}}><img src={checked} alt='checked' height='24px' /></td>
                            </tr>
                            <tr>
                                <td style={{paddingRight: '24px'}}>A separation distance of at least 5.0 metres between the potential laneway suite and the main rear wall of the principal residence is possible</td>
                                <td style={{width: 160}}><img src={checked} alt='checked' height='24px' /></td>
                            </tr>
                            <tr style={{display: 'none'}}>
                                <td></td>
                                <td style={{width: 160}}><button className='appbutton appbutton-secondary p-bold'>Download report</button></td>
                            </tr>
                        </tbody>
                    </table>
                </section>
                <section className='mbottom-5'>
                    <h1 className='h1' style={{position: 'relative'}}>Next steps <span style={{position: 'absolute', bottom: 6, marginLeft: 12, fontSize: 30}}>&#x1F449;</span></h1>
                    <div className='line' style={{width: '100%', marginRight: 0, marginLeft: 0}}>
                        <div>
                            <div style={{alignItems: 'center'}} className='line mbottom-2'>
                                <div style={{flex: 'none', width: 30, height: 30, borderRadius: 15, border: '5px #ccc solid'}}></div>
                                <div style={{flex: 1, height: 5, background: '#ccc'}}></div>
                            </div>
                            <div className='eligibility_step_card'>
                                <div className='mbottom-3' style={{position: 'relative'}}>
                                    <img style={{width: '135px'}} src={process.env.PUBLIC_URL + '/img/eligibilityStep1.svg'} alt=''/>
                                    <img style={{position: 'absolute', top: 0, right: 0}} src={checked}/>
                                </div>
                                <p className='small-text mbottom-3'><button className='button_link'><strong>STEP 1</strong></button></p>
                                <h2 className='h2 mbottom-3'>Evaluate</h2>
                                <p className='mbottom-0'>Complete</p>
                            </div>
                        </div>
                        <div>
                            <div style={{alignItems: 'center'}} className='line mbottom-2'>
                                <div style={{flex: 'none', width: 30, height: 30, borderRadius: 15, border: '5px #ccc solid'}}></div>
                                <div style={{flex: 1, height: 5, background: '#ccc'}}></div>
                            </div>
                            <div className='eligibility_step_card_selected'>
                                <div className='mbottom-3' style={{textAlign: 'center'}}><img style={{width: '135px'}} src={process.env.PUBLIC_URL + '/img/eligibilityStep2.svg'} alt=''/></div>
                                <p className='small-text mbottom-3'><button className='button_link'><strong>YOUR NEXT STEP</strong></button></p>
                                <h2 className='h2 mbottom-3'>Plan</h2>
                                <p className='mbottom-2'>Explore laneway suite design plans and understand relevant by-laws on an interactive 3D view of your property.</p>
                                <div><button className='appbutton appbutton-primary full-width' onClick={onPlanning}>Plan my laneway suite</button></div>
                            </div>
                        </div>
                        <div>
                            <div style={{alignItems: 'center'}} className='line mbottom-2'>
                                <div style={{flex: 'none', width: 30, height: 30, borderRadius: 15, border: '5px #ccc solid'}}></div>
                                <div style={{flex: 1, height: 5, background: '#ccc'}}></div>
                            </div>
                            <div className='eligibility_step_card'>
                                <div className='mbottom-3'><img style={{width: '135px'}} src={process.env.PUBLIC_URL + '/img/eligibilityStep3.svg'} alt=''/></div>
                                <p className='small-text mbottom-3'><button className='button_link'><strong>STEP 3</strong></button></p>
                                <h2 className='h2 mbottom-3'>Design</h2>
                                <p className='mbottom-0'><button className='button_link'>Learn more</button></p>
                            </div>
                        </div>
                        <div>
                            <div style={{alignItems: 'center'}} className='line mbottom-2'>
                                <div style={{flex: 'none', width: 30, height: 30, borderRadius: 15, border: '5px #ccc solid'}}></div>
                                <div style={{flex: 1, height: 5, background: '#ccc'}}></div>
                            </div>
                            <div className='eligibility_step_card'>
                                <div className='mbottom-3'><img style={{width: '135px'}} src={process.env.PUBLIC_URL + '/img/eligibilityStep4.svg'} alt=''/></div>
                                <p className='small-text mbottom-3'><button className='button_link'><strong>STEP 4</strong></button></p>
                                <h2 className='h2 mbottom-3'>Permit</h2>
                                <p className='mbottom-0'><button className='button_link'>Learn more</button></p>
                            </div>
                        </div>
                        <div>
                            <div style={{alignItems: 'center'}} className='line mbottom-2'>
                                <div style={{flex: 'none', width: 30, height: 30, borderRadius: 15, border: '5px #ccc solid'}}></div>
                            </div>
                            <div className='eligibility_step_card'>
                                <div className='mbottom-3'><img style={{width: '135px'}} src={process.env.PUBLIC_URL + '/img/eligibilityStep5.svg'} alt=''/></div>
                                <p className='small-text mbottom-3'><button className='button_link'><strong>STEP 5</strong></button></p>
                                <h2 className='h2 mbottom-3'>Construct</h2>
                                <p className='mbottom-0'><button className='button_link'>Learn more</button></p>
                            </div>
                        </div>
                    </div>
                </section>
            </div>            
        </div>
        <Footer />
    </div>);
}

export default EligibilityPage;