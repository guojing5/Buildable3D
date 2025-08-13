import { useHistory } from "react-router-dom";
import Footer from "../../components/Footer";
import TopBar from "../../components/TopBar";

function ChooseExpertsPage() {
    const history = useHistory();
    return (<div>
        <TopBar selected='resource'/>
        <div className='container mbottom-5'>
            <section className='verify_breadcrumb_section'>
                <div><button onClick={() => history.push('/resource')} className='button_link'>Resources</button><span className='verify_breadcrumb_to'>&gt;</span><span className='p-bold'>Choose the right expert</span></div>
            </section>
            <h1 className='h1 mbottom-2'>Choose the right expert</h1>
            <p className='mbottom-6'>We recommend using the services of qualified experts to help with your ADU project. Learn which expert you may need and when to hire them.</p>
            <div className='line' style={{gap: '20px'}}>
                <div style={{flex: 1}} className=''>
                    <h2 className='h2'>Planning experts</h2>
                    <div className='mbottom-2'><img style={{width: '184px'}} src={process.env.PUBLIC_URL + '/img/resource_experts_planning.svg'} alt='' /></div>
                    <p className='mbottom-0 p-bold'>Planning consultant</p>
                    <p className='mbottom-2'>Works in the private sector and assist in obtaining development application approvals, like from the Committee of Adjustment.</p>
                    <p className='mbottom-0 p-bold'>Municipal planner</p>
                    <p className='mbottom-0'>Working for the local municipality, they will help guide your proposal through the required steps. Planners involved in zoning examinations can help clarify interpretations of the by-laws.</p>
                </div>
                <div style={{flex: 1}} className=''>
                    <h2 className='h2'>Building experts</h2>
                    <div className='mbottom-2'><img style={{width: '184px'}} src={process.env.PUBLIC_URL + '/img/resource_experts_building.svg'} alt='' /></div>
                    <p className='mbottom-0 p-bold'>Architecture firm</p>
                    <p className='mbottom-2'>Specializes in design excellence and will seek out the best building contractors to collaborate with to successfully deliver your ADU project.</p>
                    <p className='mbottom-0 p-bold'>Design build</p>
                    <p className='mbottom-2'>Have both design and construction practices in-house, allowing efficient and cohesive control over all aspects of the development.</p>
                    <p className='mbottom-0 p-bold'>Construction firm</p>
                    <p className='mbottom-0'>Offers a streamlined development process and leverage their building experience to provide time/cost effective solutions to your project.</p>
                </div>
                <div style={{flex: 1}} className=''>
                    <h2 className='h2'>Landscape experts</h2>
                    <div className='mbottom-2'><img style={{width: '184px'}} src={process.env.PUBLIC_URL + '/img/resource_experts_landscape.svg'} alt='' /></div>
                    <p className='mbottom-0 p-bold'>Arborist</p>
                    <p className='mbottom-2'>Specialized knowledge in tree health, maturity, and species. They are qualified to give opinions that will inform decisions on tree damage or removal, as necessary.</p>
                    <p className='mbottom-0 p-bold'>Landscape architect</p>
                    <p className='mbottom-2'>Designs green space and patios to be functional and aesthetic to make the most out of the yard areas around your dwellings.</p>
                    <p className='mbottom-0 p-bold'>Civil engineer</p>
                    <p className='mbottom-0'>Conducts surveys of buildable terrain and infrastructure of city services that relates to your property’s utilities.</p>
                </div>
            </div>
        </div>
        <Footer />
    </div>);
}

export default ChooseExpertsPage;