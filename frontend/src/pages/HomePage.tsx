import 'bootstrap/dist/css/bootstrap.min.css';
import './pageShared.css'
import { Form } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import ADUInfoPopup from '../components/ADUInfoPopup';
import TopBar from '../components/TopBar';
import Footer from '../components/Footer';
import { Question } from '../models/Question';
import GooglePlacesAutocomplete from 'react-google-places-autocomplete';
import { useHistory } from 'react-router-dom';
import { setPlaceInfo } from '../global/state';
import { GOOGLE_API_KEY } from '../global/credential';

function HomePage() {
    const [FAQs, setFAQs] = useState<Question[]>([]);
    const [ADUInfoPopupVisible, setADUInfoPopupVisible] = useState(false);
    const history = useHistory();
    const [value, setValue] = useState(null);

    useEffect(() => {
        fetch('api/faq')
        .then(response => response.json())
        .then(setFAQs);
    }, []);

    const onGetStart = () => {
        history.push('/verify');
    }

    const onSelectAddress = (e: any) => {
        const placeId = e.value.place_id;
        const name: string = e.label;
        setPlaceInfo({
            name: name,
            id: placeId,
            reference: e.value.reference
        });
        setValue(e);
    }

    return (
    <div>
        <div style={{'background': 'white'}}>
            <TopBar selected='checkpotential' />
        </div>

        <section className="home_jumbotron_section mbottom-5">
            <div className="container home_jumbotron_container">
                <div className="row">
                    <div className="col-4" style={{color: '#fff'}}>
                        <h1 className='h1' style={{paddingRight: '10px', color: '#fff', marginBottom: '24px'}}>Explore your property’s living space potential &#x1F3E1;</h1>
                        <p className='mbottom-1'>Check your property’s potential for expansions, preview design plans, and create construction plans.</p>
                        <Form className='mbottom-2'>
                            <Form.Group className="home_autocomplete mbottom-3" controlId="home-property-address-input"
                            style = {{ marginTop: '100px' }}>
                                <GooglePlacesAutocomplete apiKey={GOOGLE_API_KEY}
                                autocompletionRequest={{componentRestrictions: {country: 'CA'}}}
                                selectProps={{
                                    value,
                                    onChange: onSelectAddress,
                                  }}
                                />
                            </Form.Group>
                            <div className="d-grid"><button className='appbutton appbutton-primary full-width' onClick={onGetStart}>Get started</button></div>
                        </Form>
                    </div>
                    <div className="col-8" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img
                        src={process.env.PUBLIC_URL + '/img/home_dog.jpg'}
                        alt="Home construction"
                        style={{
                        width: 'auto',
                        height: 'auto',
                        maxWidth: '100%',
                        maxHeight: '400px',
                        display: 'block',
                        background: '#000',
                        margin: 0,
                        padding: 0,
                        border: 'none',
                        boxShadow: 'none'
                        }}
                    />
                    </div>

                </div>
            </div>
        </section>

        <ADUInfoPopup visible={ADUInfoPopupVisible} onHide={() => setADUInfoPopupVisible(false)} />

        <div className="container">
            <section className='mbottom-5'>
                <div className='line' style={{justifyContent: 'space-between', alignItems: 'center'}}>
                    <h1 className='h1'>Resources to guide you through your project &#x1F4D6;</h1>
                    <h2 className='h2'><button className='button_link' onClick={() => history.push('/resource')}>All resources</button></h2>
                </div>
                <div className='line' style={{gap: '19px'}}>
                    <div className='home_card' onClick={() => history.push('/resource/stepinvolved')}>
                        <div><img src={process.env.PUBLIC_URL + "/img/home_adu_steps.svg"} alt='' className='home_card_img' /></div>
                        <section className='home_card_text_body'>
                            <h2 className='h2'>What are the steps involved?</h2>
                            <p className='mbottom-0'>An ADU project is a step-by-step process. Learn about what is required for each step, from the initial planning phase to starting construction.</p>
                        </section>
                    </div>
                    <div className='home_card' onClick={() => history.push('/resource/chooseexperts')}>
                        <div><img src={process.env.PUBLIC_URL + '/img/home_choose_experts.svg'} alt='' className='home_card_img' /></div>
                        <section className='home_card_text_body'>
                        <h2 className='h2'>Choose the right expert</h2>
                        <p className='mbottom-0'>We recommend using the services of qualified experts to help with your ADU project. Learn which expert you may need and when to hire them.</p>
                        </section>
                    </div>
                    <div className='home_card' onClick={() => history.push('/resource/applyminorvariances')}>
                        <div><img src={process.env.PUBLIC_URL + '/img/home_minor_variances.svg'} alt='' className='home_card_img' /></div>
                        <section className='home_card_text_body'>
                        <h2 className='h2'>Applying for minor variances</h2>
                        <p className='mbottom-0'>Does your proposed ADU design exceed by-law regulations by a small margin? You may seek approval from the Committee of Adjustment.</p>
                        </section>
                    </div>
                </div>
            </section>
            <section className='mbottom-5'>
                <div className='line' style={{justifyContent: 'space-between', alignItems: 'center'}}>
                    <h1 className='h1' style={{marginBottom: '24px'}}>Frequently Asked Questions &#x1F914;</h1>
                    <h2 className='h2'><button className='button_link'>All FAQs</button></h2>
                </div>
                {FAQs.map((faq, i) => <div key={i}>
                <p className='p mbottom-0' style={{marginTop: '36px'}}>{faq.content.join("\n")}</p>
                <div className='home_faq_divider' />
                </div>)}
            </section>
        </div>
        <Footer />
    </div>);
}

export default HomePage;