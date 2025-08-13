import { useState } from "react";
import { useHistory } from "react-router-dom";
import Footer from "../../components/Footer";
import TopBar from "../../components/TopBar";

const STEPS = [
    { imagePath: 'resource_neighbours_designing.svg', number: 1, action: 'Before designing' },
    { imagePath: 'resource_neighbours_permit.svg', number: 2, action: 'Before permit app' },
    { imagePath: 'resource_neighbours_construction.svg', number: 3, action: 'Before construction' },
];

function FlowDiagram(props: {currentStep: number}) {
    const getStepElements = () => STEPS.map(s => <div key={s.number}>
        <div style={{alignItems: 'center'}} className='line mbottom-2'>
            <div style={{flex: 'none', width: 30, height: 30, borderRadius: 15, border: '5px #ccc solid'}}></div>
            <div style={{display: s.number === 3 ? 'none' : '', flex: 1, height: 5, background: '#ccc'}}></div>
        </div>
        <div style={{width: 184}} className={props.currentStep === s.number ? 'resource_step_card_selected' : 'resource_step_card'}>
            <div className='mbottom-3'><img style={{width: '135px'}} src={process.env.PUBLIC_URL + "/img/" + s.imagePath} alt=''/></div>
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
        <h2 className='h2'>Before designing</h2>
        <p className='mbottom-0'>Consulting with neighbours before designing an ADU is not required. However, doing so may provide several benefits, such as:</p>
        <ul className='mbottom-6'>
            <li>Assessing possible concerns or disapprovals your neighbours may have subconsciously towards property development in the neighbourhood.</li>
            <li>Opening up potential future cooperation for connecting/separating greenspace, co-managing shared fencing, applying for easements for firefighting access requirements, and many more.</li>
        </ul>
    </div>)
}

function Step2() {
    return (<div>
        <h2 className='h2'>Before permit application</h2>
        <p className='mbottom-0 p-bold'>If your laneway suite is ‘As-of-Right’</p>
        <p className='mbottom-1'>To be considered ‘as-of-right’ by the City, your proposal must meet all zoning by-law regulations and your application is for building permit only. You may inform your neighbours prior to your application, if you choose to. Your neighbours will not have an opportunity to oppose to a building permit.</p>
        <p className='mbottom-1'>--</p>
        <p className='mbottom-0 p-bold'>If your laneway suite requires a minor variance from the by-law</p>
        <p className='mbottom-0'>You must apply for approval from the Committee of Adjustment.</p>
        <ul className='mbottom-1'>
            <li>This is a public process and your application will be posted on the City’s Application Information Centre website.</li>
            <li>There will be a public hearing in which neighbours can register to speak for or against an application, and can also submit petitions of opposition which are on the public record.</li>
            <li>A public notice sign must be posted on the property for 2 weeks prior to the hearing. Notices are also mailed to the neighbours.</li>
        </ul>
        <p className='mbottom-0'>It is recommended to inform neighbours about your proposal before your notice is posted, but is not required.</p>
        <ul className='mbottom-6'>
            <li>Letters and public hearing attendances in support, or in opposition, from nearby neighbours can affect the Committee of Adjustment’s decision. During the public hearing, you will have time to address comments made by the opposition.</li>
            <li>Prior discussions with your neighbours can resolve misunderstandings.</li>
            <li>An applicant that is not supported by neighbours will often be asked if they spoke with their neighbours about the application. If the answer is no, the application may be deferred until these discussions happen.</li>
        </ul>
    </div>)
}

function Step3() {
    return (<div>
        <h2 className='h2'>Before construction</h2>
        <p className='mbottom-1'>During the construction phase, it is recommended that you follow all construction guidelines and ensure your neighbours have your direct contact information incase of any issues that may arise. It is also courteous to alert your neighbours of the timeframe for the project.</p>
        <p className='mbottom-6'>If you are in a position to manage the construction project yourself, please consult: <a href='https://www.toronto.ca/services-payments/building-construction/building-inspections/construction-requirements-guidelines/' target='_blank' rel='noreferrer' className='button_link'>Toronto’s Construction Requirements and Guidelines</a>.</p>
    </div>)
}

function ConsultingNeighborsPage() {
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
            default:
                return null
        }
    }
    return (
    <div>
        <TopBar selected='resource'/>
        <div className='container mbottom-5'>
            <section className='verify_breadcrumb_section'>
                <div><button onClick={() => history.push('/resource')} className='button_link'>Resources</button><span className='verify_breadcrumb_to'>&gt;</span><span className='p-bold'>Consulting with neighbours</span></div>
            </section>
            <h1 className='h1 mbottom-2'>Consulting with neighbours</h1>
            <p className='mbottom-6'>As you plan for your ADU project, informing your neighbours know about it and hearing their thoughts may prove beneficial down the project pipeline.</p>
            <FlowDiagram currentStep={currentStep} />
            {getStepDetailElement()}
            <div className='line' style={{justifyContent: 'space-between'}}>
                <button style={{visibility: currentStep <= 1 ? 'hidden' : 'visible'}} className='appbutton appbutton-secondary' onClick={() => setCurrentStep(currentStep-1)}>Back: {STEPS.find(s => s.number === currentStep-1)?.action}</button>
                <button style={{visibility: currentStep >= 3 ? 'hidden' : 'visible'}} className='appbutton appbutton-primary' onClick={() => setCurrentStep(currentStep+1)}>Next: {STEPS.find(s => s.number === currentStep+1)?.action}</button>
            </div>
        </div>
        <Footer />
    </div>);
}

export default ConsultingNeighborsPage;