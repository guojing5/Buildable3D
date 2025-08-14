import { useState } from "react";
import { useHistory } from "react-router-dom";
import Footer from "../../components/Footer";
import TopBar from "../../components/TopBar";

const STEPS = [
    { imagePath: 'resource_step1.svg', number: 1, name: 'STEP 1', action: 'Evaluate' },
    { imagePath: 'resource_step2.svg', number: 2, name: 'STEP 2', action: 'Plan' },
    { imagePath: 'resource_step3.svg', number: 3, name: 'STEP 3', action: 'Design' },
    { imagePath: 'resource_step4.svg', number: 4, name: 'STEP 4', action: 'Permit' },
    { imagePath: 'resource_step5.svg', number: 5, name: 'STEP 5', action: 'Construct' }
];

function FlowDiagram(props: {currentStep: number}) {
    const getStepElements = () => STEPS.map(s => <div key={s.number}>
        <div style={{alignItems: 'center'}} className='line mbottom-2'>
            <div style={{flex: 'none', width: 30, height: 30, borderRadius: 15, border: '5px #ccc solid'}}></div>
            <div style={{display: s.number === 5 ? 'none' : '', flex: 1, height: 5, background: '#ccc'}}></div>
        </div>
        <div style={{width: 184}} className={props.currentStep === s.number ? 'resource_step_card_selected' : 'resource_step_card'}>
            <div className='mbottom-3'><img style={{width: '135px'}} src={process.env.PUBLIC_URL + "/img/" + s.imagePath} alt=''/></div>
            <div className='mbottom-3 small-text'>{s.name}</div>
            <h2 className='h2 mbottom-0'>{s.action}</h2>
        </div>
    </div>);

    return (
        <div className='line mbottom-6'>
            {getStepElements()}
        </div>
    );
}

function Step1() {
    return (<div>
        <h2 className='h2'>Step 1: Evaluate</h2>
        <p className='mbottom-2'>Buildable3D can evaluate your property's potential for ADU development and provide essential information for your planning purposes. If your property has ADU potential, you may start planning using our interactive 3D viewer.</p>
        <p className='mbottom-6'>In case your property does not have the potential for an ADU, you can explore additional options, such as applying for minor variances, which may allow you to develop an ADU.</p>
    </div>)
}

function Step2() {
    return (<div>
        <h2 className='h2'>Step 2: Plan</h2>
        <p className='mbottom-2'>Plan for an ADU by taking advantage of our interactive 3D viewer to explore ADU configurations and placement in your own virtual backyard. Also get to know about by-law regulations relevant to your project.</p>
        <p className='mbottom-6'>Interested in an ADU design? Connect with its designers for a consultation or to inquire about designing a custom ADU. An on-site visit by a <button className='button_link'>building expert</button> is highly recommended to assess your property for site specific conditions as well as provide estimates for the development.</p>
    </div>)
}

function Step3() {
    return (<div>
        <h2 className='h2'>Step 3: Design</h2>
        <p className='mbottom-6'>Whether you plan to hire a building expert or you are the designer of your own ADU, the designer must ensure the <a href='https://www.toronto.ca/zoning/bylaw_amendments/ZBL_NewProvision_Chapter150_8.htm' target='_blank' rel='noreferrer' className='button_link'>zoning by-laws</a> and the <a href='https://www.ontario.ca/page/ontarios-building-code' target='_blank' rel='noreferrer' className='button_link'>Ontario Building Code</a> requirements are met. The designer will need to faithfully represent the design in a comprehensive drawing set to be submitted for a building permit.</p>
    </div>)
}

function Step4() {
    return (<div>
        <h2 className='h2'>Step 4: Permit</h2>
        <p className='mbottom-2'>Building permit applications are required for new ancillary buildings such as laneway suites and garden suites. See a <button className='button_link'>full list</button> of projects that require a building permit application.</p>
        <p className='mbottom-6'><a href='https://www.toronto.ca/services-payments/building-construction/apply-for-a-building-permit/building-permit-application-guides/renovation-and-new-house-guides/new-laneway-suite/' target='_blank' rel='noreferrer' className='button_link'>Building permit applications</a> for new Laneway Suites in the city of Toronto must include:</p>
        <table style={{width: 996, marginLeft: 'auto', marginRight: 'auto'}} className='mbottom-6 resource_permit_table'>
            <thead><tr><th>Application component</th><th>Component description</th></tr></thead>
            <tbody>
                <tr>
                    <td>Accurate comprehensive drawing set of the project</td>
                    <td>
                        <p className='mbottom-1'>To be prepared by an architect or qualified designer.</p>
                        <p className='mbottom-0'>The drawing set should include:</p>
                        <ul className='mbottom-0'>
                            <li className='mbottom-0'>Site plan</li>
                            <li className='mbottom-0'>Floor plans (all levels)</li>
                            <li className='mbottom-0'>Roof plan</li>
                            <li className='mbottom-0'>Elevations</li>
                            <li className='mbottom-0'>Sections</li>
                            <li className='mbottom-0'>Construction notes & details</li>
                            <li className='mbottom-0'><a href='https://www.toronto.ca/services-payments/building-construction/apply-for-a-building-permit/building-permit-application-guides/renovation-and-new-house-guides/new-house/lot-grading-requirements-for-infill-housing/' target='_blank' rel='noreferrer' className='button_link'>Grading plan</a></li>
                        </ul>
                    </td>
                </tr>
                <tr>
                    <td>Detailed Drainage plans</td>
                    <td>Required if the project includes a reverse sloped driveway that drains into the rear yard.</td>
                </tr>
                <tr>
                    <td>Proof of access for <a href='https://www.toronto.ca/services-payments/building-construction/apply-for-a-building-permit/building-permit-application-guides/renovation-and-new-house-guides/new-laneway-suite/providing-access-to-a-new-laneway-suite/' target='_blank' rel='noreferrer' className='button_link'>firefighting services</a> according to the Ontario Building Code</td>
                    <td>
                        <p className='mbottom-1'>A path of travel that is maximum of 45 metres in length measured from the entrance of the laneway suite to the public street, that must also be within 45 metres of a fire hydrant. Path of travel must have a minimum of 0.9 metres wide by 2.1 metres high.</p>
                        <p className='mbottom-0'>Certain exemptions can be found on the municipal website.</p>
                    </td>
                </tr>
                <tr>
                    <td><a href='https://wx.toronto.ca/intra/it/pubformrep.nsf/57a82d5a76decda785257460004a171a/bd11164acbc5f26f85257473006a56d0/$FILE/14-0016.pdf' target='_blank' rel='noreferrer' className='button_link'>Plumbing data sheet</a></td>
                    <td>Required schedule of all plumbing related fixtures and utilities.</td>
                </tr>
                <tr>
                    <td><a href='https://www.toronto.ca/services-payments/building-construction/apply-for-a-building-permit/building-permit-application-guides/plumbing-mechanical-and-drains-related-to-a-building-permit/related-mechanical-hvac-permit/' target='_blank' rel='noreferrer' className='button_link'>Mechanical permit requirements</a></td>
                    <td>Required if your project includes HVAC elements.</td>
                </tr>
                <tr>
                    <td>Forms</td>
                    <td>
                        <ul className='mbottom-0'>
                            <li><a href='https://wx.toronto.ca/intra/it/pubformrep.nsf/57a82d5a76decda785257460004a171a/281a673dd4af964085257c32006f9e85/$FILE/14-0094-Final-Application-for-a-Permit-to-Construct-or-Demolish.pdf' target='_blank' rel='noreferrer' className='button_link'>Application to Construct or Demolish Form</a></li>
                            <li><a href='https://www.toronto.ca/wp-content/uploads/2017/12/9568-Building-Permits-energy-efficiency-design-summary-Prescriptive-Fillable-2017.pdf' target='_blank' rel='noreferrer' className='button_link'>Energy Efficiency Design Summary Form(s)</a></li>
                            <li><a href='http://wx.toronto.ca/inter/clerks/fit.nsf/0/874326b0f3d9a0d3852582f3005526b4/$File/Infill%2BPublic%2BNotice%2BDeclaration%2BForm.pdf' target='_blank' rel='noreferrer' className='button_link'>Infill Public Notice Declaration Form</a></li>
                            <li><a href='https://www.toronto.ca/wp-content/uploads/2018/01/8cdf-14-0051-Municipal-Road-Damage-Deposit.pdf' target='_blank' rel='noreferrer' className='button_link'>Municipal Road Damage Form</a></li>
                            <li><a href='https://www.toronto.ca/wp-content/uploads/2017/10/8fda-Tree_Declaration.pdf' target='_blank' rel='noreferrer' className='button_link'>Tree Declaration Form</a></li>
                        </ul>
                    </td>
                </tr>
                <tr>
                    <td><a href='https://wx.toronto.ca/intra/it/pubformrep.nsf/57a82d5a76decda785257460004a171a/ee06e33a24c332c685257b75004e889a/$FILE/14-0070-Schedule-1-Designer-Information.pdf' target='_blank' rel='noreferrer' className='button_link'>Designer Information Form</a></td>
                    <td></td>
                </tr>
                <tr>
                    <td><a href='https://www.toronto.ca/services-payments/building-construction/apply-for-a-building-permit/building-permit-fees/' target='_blank' rel='noreferrer' className='button_link'>Fees</a></td>
                    <td>
                        <p className='mbottom-0'>Construction - Group C (Residential Occupancies)</p>
                        <ul>
                            <li>Residential Unit Application Fee: $52.08/unit</li>
                            <li>Single Family Dwellings: $17.16/sq. m</li>
                            <li>Certification of Plans: $8.59/sq. m</li>
                            <li>Permits for Certified Plans: $14.56/sq. m</li>
                            <li>Other multiple unit buildings and residential occupancies: $17.16/sq. m</li>
                        </ul>
                    </td>
                </tr>
                <tr>
                    <td><a href='https://www.toronto.ca/city-government/budget-finances/city-finance/development-charges/' target='_blank' rel='noreferrer' className='button_link'>Development charges</a></td>
                    <td>
                        <p className='mbottom-1'>Development charges are <a href='https://www.toronto.ca/city-government/budget-finances/city-finance/development-charges/development-charges-overview/' target='_blank' rel='noreferrer' className='button_link'>land development fees</a> associated with your project that contribute to the growth and maintenance of local municipal infrastructure. </p>
                        <p className='mbottom-0'>City of Toronto <a href='https://www.toronto.ca/wp-content/uploads/2018/07/91aa-law0515.pdf' target='_blank' rel='noreferrer' className='button_link'>By-law</a> which implements the development charges (City of Toronto Municipal Code Chapter 415) which includes the 2020 rates (see p. 24).</p>
                    </td>
                </tr>
                <tr>
                    <td><p className='mbottom-0'><a href='https://www.toronto.ca/community-people/community-partners/affordable-housing-partners/laneway-suites-program/' target='_blank' rel='noreferrer' className='button_link'>Development Charges Deferral Program for Ancillary Secondary Dwelling Units</a></p><p className='mbottom-0'>(optional)</p></td>
                    <td>
                        <p className='mbottom-1'>If your application meets the <a href='https://www.toronto.ca/wp-content/uploads/2019/10/8e59-DC-Laneway-Agmt-for-circulation.pdf' target='_blank' rel='noreferrer' className='button_link'>program agreement</a>, the city will agree to defer the payment of the Development Charge for a period of Twenty (20) years or until an Event of Default occurs. </p>
                        <p className='mbottom-0'>Contact Vincenzo Salatino, Housing Secretariat (<a href='mailto:Vincenzo.Salatino@toronto.ca' target='_blank' rel='noreferrer' className='button_link'>Vincenzo.Salatino@toronto.ca</a>) for an application form.</p>
                    </td>
                </tr>
                <tr>
                    <td><p className='mbottom-0'><a href='https://www.toronto.ca/community-people/community-partners/affordable-housing-partners/laneway-suites-program/' target='_blank' rel='noreferrer' className='button_link'>Affordable Laneway Suites Program</a></p><p className='mbottom-0'>(optional)</p></td>
                    <td>
                        <p className='mbottom-1'>If your application meets the <a href='https://www.toronto.ca/wp-content/uploads/2019/06/911f-FINAL-Laneway-CA-May30.19-for-circulation.pdf' target='_blank' rel='noreferrer' className='button_link'>program agreement</a>, you can receive a forgivable loan of up to $50,000 for your laneway suite. You must not exceed the City of Toronto <a href='https://www.toronto.ca/community-people/community-partners/social-housing-providers/affordable-housing-operators/current-city-of-toronto-average-market-rents-and-utility-allowances/' target='_blank' rel='noreferrer' className='button_link'>Average Market Rent</a> by bedroom type for a period of 15 years.</p>
                        <p className='mbottom-0'>Contact Ricky Shek, Housing Secretariat (<a href='mailto:ShingFung.Shek@toronto.ca' target='_blank' rel='noreferrer' className='button_link'>ShingFung.Shek@toronto.ca</a>) for an application form.</p>
                    </td>
                </tr>
                <tr>
                    <td><p className='mbottom-0'><a href='https://www.toronto.ca/city-government/planning-development/official-plan-guidelines/toronto-green-standard/toronto-green-standard-overview/' target='_blank' rel='noreferrer' className='button_link'>Toronto Green Standard Program</a></p><p className='mbottom-0'>(optional)</p></td>
                    <td>
                        <p className='mbottom-0'>A municipal design standards program that promotes sustainable development organized into different tiers. While all tier 1 is mandatory for all planning applications, <a href='https://www.toronto.ca/city-government/planning-development/official-plan-guidelines/toronto-green-standard/toronto-green-standard-version-2/' target='_blank' rel='noreferrer'>tier 2</a> and <a href='https://www.toronto.ca/city-government/planning-development/official-plan-guidelines/toronto-green-standard/toronto-green-standard-version-3/' target='_blank' rel='noreferrer'>tier 3</a> projects may apply for development charge refunds.</p>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>)
}

function Step5() {
    return (<div>
        <h2 className='h2'>Step 5: Construct</h2>
        <p className='mbottom-2'>During the construction phase, property owners can expect regular inspections by municipal authorities to ensure elements of your building meet municipal regulations and the provincial building code.</p>
        <p className='mbottom-6'>If a building expert was hired, property owners will be required to be in regular contact with the project manager facilitating the construction.</p>
    </div>)
}

function StepInvolvedPage() {
    const history = useHistory();
    const [currentStep, setCurrentStep] = useState(1);

    const getStepDetailElement = () => {
        switch (currentStep) {
            case 1:
                return <Step1 />
            case 2:
                return <Step2 />
            case 3:
                return <Step3 />
            case 4:
                return <Step4 />
            case 5:
                return <Step5 />
            default:
                return null
        }
    }
    return (
    <div>
        <TopBar selected='resource'/>
        <div className='container mbottom-5'>
            <section className='verify_breadcrumb_section'>
                <div><button onClick={() => history.push('/resource')} className='button_link'>Resources</button><span className='verify_breadcrumb_to'>&gt;</span><span className='p-bold'>What are the steps involved?</span></div>
            </section>
            <h1 className='h1 mbottom-2'>What are the steps involved?</h1>
            <p className='mbottom-6'>An ADU project is a step-by-step process. Learn about what is required for each step, from the initial planning phase to starting construction.</p>
            <FlowDiagram currentStep={currentStep} />
            {getStepDetailElement()}
            <div className='line' style={{justifyContent: 'space-between'}}>
                <button style={{visibility: currentStep <= 1 ? 'hidden' : 'visible'}} className='appbutton appbutton-secondary' onClick={() => setCurrentStep(currentStep-1)}>Back: {STEPS.find(s => s.number === currentStep-1)?.action}</button>
                <button style={{visibility: currentStep >= 5 ? 'hidden' : 'visible'}} className='appbutton appbutton-primary' onClick={() => setCurrentStep(currentStep+1)}>Next: {STEPS.find(s => s.number === currentStep+1)?.action}</button>
            </div>
        </div>
        <Footer />
    </div>);
}

export default StepInvolvedPage;