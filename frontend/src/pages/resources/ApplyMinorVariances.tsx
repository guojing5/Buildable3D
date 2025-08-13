import { useState } from "react";
import { useHistory } from "react-router-dom";
import Footer from "../../components/Footer";
import TopBar from "../../components/TopBar";

const STEPS = [
    { imagePath: 'resource_variances_1.svg', number: 1, name: 'STEP 1', action: 'Pre-app evaluation' },
    { imagePath: 'resource_variances_2.svg', number: 2, name: 'STEP 2', action: 'Application' },
    { imagePath: 'resource_variances_3.svg', number: 3, name: 'STEP 3', action: 'Public hearing' },
    { imagePath: 'resource_variances_4.svg', number: 4, name: 'STEP 4', action: 'Decision' },
];

function FlowDiagram(props: {currentStep: number}) {
    const getStepElements = () => STEPS.map(s => <div key={s.number}>
        <div style={{alignItems: 'center'}} className='line mbottom-2'>
            <div style={{flex: 'none', width: 30, height: 30, borderRadius: 15, border: '5px #ccc solid'}}></div>
            <div style={{display: s.number === 4 ? 'none' : '', flex: 1, height: 5, background: '#ccc'}}></div>
        </div>
        <div style={{width: 184, height: 272}} className={props.currentStep === s.number ? 'resource_step_card_selected' : 'resource_step_card'}>
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
        <h2 className='h2'>Step 1: Pre-application evaluation</h2>
        <p className='mbottom-0'>If your proposal involves minor variances from the zoning by-law, you may seek approval for deviation from the Committee of Adjustments.</p>
        <p className='mbottom-0'>Common minor variances are:</p>
        <ul className='mbottom-1'>
            <li>Plans exceeding maximum dimensions</li>
            <li>Not meeting minimum requirements</li>
            <li>Seeking irregular exemptions</li>
        </ul>
        <p className='mbottom-0'>In order for your proposal to be approved, the committee must vote in favour that:</p>
        <ul className='mbottom-1'>
            <li>Your requested variance is minor</li>
            <li>Your proposal is desirable for the appropriate development of the land/or building</li>
            <li>Your general intent and the purpose of the City’s Zoning By-law is maintained</li>
            <li>The intent and purpose of the City’s Official Plan is maintained</li>
        </ul>
        <p className='mbottom-1 p-bold'>Depending on your project and site, you may need to contact:</p>
        <p className='mbottom-0'>If your property is next to a ravine:</p>
        <ul className='mbottom-1'><li>Contact Toronto Urban Forestry regarding Ravine By-Laws and <a href='https://www.toronto.ca/services-payments/building-construction/tree-ravine-protection-permits/permit-to-undertake-work-in-ravines/' target='_blank' rel='noreferrer' className='button_link'>working permit</a>.</li></ul>
        <p className='mbottom-0'>If your property is a historical site:</p>
        <ul className='mbottom-1'><li>Contact <a href='https://www.toronto.ca/city-government/planning-development/heritage-preservation/' target='_blank' rel='noreferrer' className='button_link'>Toronto Heritage Preservation</a> services.</li></ul>
        <p className='mbottom-0'>If your property is subject to a site plan approval:</p>
        <ul className='mbottom-6'><li>It is recommended you first file your Site Plan Application with the applicable District Planning office.</li></ul>
    </div>)
}

function Step2() {
    return (<div>
        <h2 className='h2'>Step 2: Application</h2>
        <p className='mbottom-1'>Applications for minor variances are sent digitally to <a href='mailto:bldapplications@toronto.ca' target='_blank' rel='noreferrer' className='button_link'>bldapplications@toronto.ca</a> and must include the property address in the subject line. The required supporting material accompanying your application will vary based on the nature of your property and proposal. Consult the <a href='https://www.toronto.ca/wp-content/uploads/2017/12/9361-Committee-of-Adjustment-Checklist-Digital-Requirements.pdf' target='_blank' rel='noreferrer' className='button_link'>Application Checklist</a> for detailed requirements.</p>
        <p className='mbottom-6'>Submission requirements:</p>
        <table style={{width: 996, marginLeft: 'auto', marginRight: 'auto'}} className='mbottom-6 resource_permit_table'>
            <thead><tr><th>Application component</th><th>Component description</th></tr></thead>
            <tbody>
                <tr>
                    <td><a href='https://www.toronto.ca/wp-content/uploads/2020/12/934c-8d20-934e-Committee-of-Adjustment-Application.pdf' target='_blank' rel='noreferrer' className='button_link'>2021 Application Form</a></td>
                    <td>Required form to be completed by either the owner or agent of the application, and will be incorporated as a public record.</td>
                </tr>
                <tr>
                    <td>Authorization Form</td>
                    <td>Must be signed by all registered owners of the property.</td>
                </tr>
                <tr>
                    <td><a href='https://www.toronto.ca/services-payments/building-construction/preliminary-zoning-reviews-information/apply-for-a-zoning-review/zoning-certificate/' target='_blank' rel='noreferrer' className='button_link'>Zoning Certificate</a> or Preliminary Project Review</td>
                    <td><a href='https://www.toronto.ca/wp-content/uploads/2017/10/9838-Preliminary-Project-Review-Application.pdf' target='_blank' rel='noreferrer' className='button_link'>Apply</a> to have your variances identified by a municipal Zoning Examiner. You will need to provide the applicable site survey, site plan, floor plans, and elevations and cross-sections of your project, as well as pay a <a href='https://www.toronto.ca/services-payments/building-construction/preliminary-zoning-reviews-information/apply-for-a-zoning-review/zoning-certificate/' target='_blank' rel='noreferrer' className='button_link'>fee</a>. This is highly recommended.</td>
                </tr>
                <tr>
                    <td>
                        <p className='mbottom-0'><a href='https://www.toronto.ca/wp-content/uploads/2017/08/97c4-Zoning-Review-Waiver-Form.pdf' target='_blank' rel='noreferrer' className='button_link'>Zoning Review Waiver Form</a></p>
                        <p className='mbottom-0'>(optional)</p>
                    </td>
                    <td>An optional/conditional request for an exception to your minor variances being confirmed by a Zoning Examiner. Applicants will therefore be responsible for identifying variances correctly and fully.</td>
                </tr>
                <tr>
                    <td>Plans (submit as a single PDF file no larger than 10mb)</td>
                    <td>
                        <ul className='mbottom-0'>
                            <li>Surveys provided by an <a href='https://www.aols.org/find-a-surveyor' target='_blank' rel='noreferrer' className='button_link'>Ontario Land Surveyor</a></li>
                            <li>Applicable Draft Reference Plan of Survey for Consent applications only</li>
                            <li>Architectural site plans, floor plans, elevations, sections, and details</li>
                            <li>Must be metric, to scale, legible, and adhere to standard drawing conventions</li>
                        </ul>
                    </td>
                </tr>
                <tr>
                    <td><a href='https://www.toronto.ca/wp-content/uploads/2017/10/8fda-Tree_Declaration.pdf' target='_blank' rel='noreferrer' className='button_link'>Tree Declaration Form</a> as per Urban Forestry requirements</td>
                    <td>
                        <p className='mbottom-1'>Required by the city to acknowledge trees for potential by-law regulations or permission for removal.</p>
                        <p className='mbottom-0'>Also include up-to-date coloured photos of all trees on and within 6 metres of the site, and a site plan indicating as-of-right footprint and tree details of all by-law protected trees and tree protected zones of all trees on and within 6 metres of the site.</p>
                    </td>
                </tr>
                <tr>
                    <td>Optional supporting materials</td>
                    <td>Letters of support from neighbours, city councillors, and other city officials.</td>
                </tr>
            </tbody>
        </table>
        <p className='mbottom-6'>Fees for laneway suites and/or secondary suites:</p>
        <table style={{width: 996, marginLeft: 'auto', marginRight: 'auto'}} className='mbottom-6 resource_permit_table'>
            <thead><tr><th>Application component</th><th>Component description</th></tr></thead>
            <tbody>
                <tr>
                    <td>Additions and alterations to existing dwellings with three units or less</td>
                    <td>$1,682.90</td>
                </tr>
                <tr>
                    <td>Residential dwellings with three units or less</td>
                    <td>$3,783.42</td>
                </tr>
                <tr>
                    <td>After the fact minor variances</td>
                    <td>Double the regular fee</td>
                </tr>
            </tbody>
        </table>
    </div>)
}

function Step3() {
    return (<div>
        <h2 className='h2'>Step 3: Public hearing</h2>
        <p className='mbottom-1'>After your application is processed, you will be scheduled for a hearing date at which you or an agent representing you is required to attend. Public hearings are scheduled on a first come first serve basis.</p>
        <p className='mbottom-6'>Before your hearing:</p>
        <table style={{width: 996, marginLeft: 'auto', marginRight: 'auto'}} className='mbottom-6 resource_permit_table'>
            <thead><tr><th>Application component</th><th>Component description</th></tr></thead>
            <tbody>
                <tr>
                    <td>Written Submissions</td>
                    <td>
                        <ul className='mbottom-0'>
                            <li>Emailed to the <a href='https://www.toronto.ca/city-government/planning-development/committee-of-adjustment/' target='_blank' rel='noreferrer' className='button_link'>Committee of Adjustment</a> in PDF format</li>
                            <li>No later than 4:30 PM, 5 business days before the hearing date</li>
                        </ul>
                    </td>
                </tr>
                <tr>
                    <td>Participating Requests</td>
                    <td>
                        <ul className='mbottom-0'>
                            <li>Contact the Committee of Adjustment to request an attendance</li>
                            <li>No later than 4:30 PM, 2 business days before the hearing date</li>
                        </ul>
                    </td>
                </tr>
            </tbody>
        </table>
        <p className='mbottom-1'>At the hearing, you may be asked to address the committee regarding aspects of your project and answer questions and concerns from the committee or other attending parties. Multiple cases are conducted in a public hearing and are organized by your area district.</p>
        <p className='mbottom-6'>Hearing procedure:</p>
        <table style={{width: 996, marginLeft: 'auto', marginRight: 'auto'}} className='mbottom-6 resource_permit_table'>
            <thead><tr><th>Application component</th><th>Component description</th></tr></thead>
            <tbody>
                <tr>
                    <td>Presentation</td>
                    <td>Depending on if the application is contested, the chair may or may not ask the applicant/agent to present their application, within 5 minutes. Presenting when asked is recommended but not required.</td>
                </tr>
                <tr>
                    <td>Attendees</td>
                    <td>Interested parties who have attended may present their support or their opposition to the application. Each speaker is given 5 minutes.</td>
                </tr>
                <tr>
                    <td>Rebuttal </td>
                    <td>The applicant/agent may be allowed by the chair to rebut any comments made by the attendees.</td>
                </tr>
                <tr>
                    <td>Committee Deliberations</td>
                    <td>The committee will review the requested variances, and may inquire the applicant/agent to clarify or respond to conditions.</td>
                </tr>
                <tr>
                    <td>Decision</td>
                    <td>A decision and/or deferral with or without conditions deferrals will be made.</td>
                </tr>
            </tbody>
        </table>
        <p className='mbottom-6'>Please note that aspects of the proposal that do not require variances and personal comments will not be considered by the Committee of Adjustment. Maintenance and construction concerns should be redirected to the <a className='button_link' href='https://www.toronto.ca/services-payments/building-construction/apply-for-a-building-permit/toronto-building-contact-us/' target='_blank' rel='noreferrer'>municipal building department</a>.</p>
    </div>)
}

function Step4() {
    return (<div>
        <h2 className='h2'>Step 4: Decision</h2>
        <p className='mbottom-1'>Decisions are announced at the end of your hearing and will state conditions of approval if imposed. Contact the applicable Committee of Adjustment office by email and provide your name, address, date of hearing, file number and property address to receive a copy of the decision. Your application may also receive a deferral if circumstances warrant such action.</p>
        <p className='mbottom-6'>Deferral requests are considered at the public hearing, during which applicants/agents may present a deferral request. Rescheduling of a public hearing may impose additional fees and/or specific stipulations prerequisites.</p>
    </div>)
}

function ApplyMinorVariancesPage() {
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
            default:
                return null
        }
    }
    return (
    <div>
        <TopBar selected='resource'/>
        <div className='container mbottom-5'>
            <section className='verify_breadcrumb_section'>
                <div><button onClick={() => history.push('/resource')} className='button_link'>Resources</button><span className='verify_breadcrumb_to'>&gt;</span><span className='p-bold'>Applying for minor variances</span></div>
            </section>
            <h1 className='h1 mbottom-2'>Applying for minor variances</h1>
            <p className='mbottom-6'>Does your proposed ADU design exceed by-law regulations by a small margin? You may seek approval from the Committee of Adjustment.</p>
            <FlowDiagram currentStep={currentStep} />
            {getStepDetailElement()}
            <div className='line' style={{justifyContent: 'space-between'}}>
                <button style={{visibility: currentStep <= 1 ? 'hidden' : 'visible'}} className='appbutton appbutton-secondary' onClick={() => setCurrentStep(currentStep-1)}>Back: {STEPS.find(s => s.number === currentStep-1)?.action}</button>
                <button style={{visibility: currentStep >= 4 ? 'hidden' : 'visible'}} className='appbutton appbutton-primary' onClick={() => setCurrentStep(currentStep+1)}>Next: {STEPS.find(s => s.number === currentStep+1)?.action}</button>
            </div>
        </div>
        <Footer />
    </div>);
}

export default ApplyMinorVariancesPage;