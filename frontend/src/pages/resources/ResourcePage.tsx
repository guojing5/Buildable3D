import { useHistory } from "react-router";
import Footer from "../../components/Footer";
import TopBar from "../../components/TopBar";

function ResourcePage() {
    const history = useHistory();
    return (<div>
        <TopBar selected='resource'/>
        <div className='container mbottom-5'>
            <h1 className='h1 mtop-5'>Resources</h1>
            <p className='mbottom-1'>Browse through our growing list of resources to stay informed on topics related to your ADU project.</p>
            <div className='resource_card_container'>
                <div className='resource_card' onClick={() => history.push('/resource/stepinvolved')}>
                    <div><img className='resource_card_img' src={process.env.PUBLIC_URL + '/img/resource_adu_steps.svg'} alt='' /></div>
                    <div style={{padding: 36}}>
                        <h2 className='h2'>What are the steps involved?</h2>
                        <p className='mbottom-0'>An ADU project is a step-by-step process. Learn about what is required for each step, from the initial planning phase to starting construction.</p>
                    </div>
                </div>
                <div className='resource_card' onClick={() => history.push('/resource/chooseexperts')}>
                    <div><img className='resource_card_img' src={process.env.PUBLIC_URL + '/img/resource_choose_experts.svg'} alt='' /></div>
                    <div style={{padding: 36}}>
                        <h2 className='h2'>Choose the right expert</h2>
                        <p className='mbottom-0'>We recommend using the services of qualified experts to help with your ADU project. Learn which expert you may need and when to hire them.</p>
                    </div>
                </div>
                <div className='resource_card' onClick={() => history.push('/resource/applyminorvariances')}>
                    <div><img className='resource_card_img' src={process.env.PUBLIC_URL + '/img/resource_minor_variances.svg'} alt='' /></div>
                    <div style={{padding: 36}}>
                        <h2 className='h2'>Applying for minor variances</h2>
                        <p className='mbottom-0'>Does your proposed ADU design exceed by-law regulations by a small margin? You may seek approval from the Committee of Adjustment.</p>
                    </div>
                </div>
                <div className='resource_card' onClick={() => history.push('/resource/consultingneighbors')}>
                    <div><img className='resource_card_img' src={process.env.PUBLIC_URL + '/img/resource_consult_neighbours.svg'} alt='' /></div>
                    <div style={{padding: 36}}>
                        <h2 className='h2'>Consulting with neighbours</h2>
                        <p className='mbottom-0'>As you plan for your ADU project, informing your neighbours know about it and hearing their thoughts may prove beneficial down the project pipeline.</p>
                    </div>
                </div>
                <div className='resource_card' style={{display: 'none'}}>
                    <div><img className='resource_card_img' src={process.env.PUBLIC_URL + "/img/resourceTitle.png"} alt='' /></div>
                    <div style={{padding: 36}}>
                        <h2 className='h2'>Glossary of terms</h2>
                        <p className='mbottom-0'>Lot coverage, setbacks, minor variance, easement - what do they all mean? Use our glossary of terms for an easier understanding!</p>
                    </div>
                </div>
            </div>
        </div>
        <Footer />
    </div>);
}

export default ResourcePage;