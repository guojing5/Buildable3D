import { useHistory } from 'react-router-dom';
import abodeLogo from '../pages/abodeLogo.svg';

export default function TopBar(props: {selected: string}) {
    const history = useHistory();
    return (
        <div className="container header_container">
            <header>
                <div className="d-flex flex-column flex-md-row align-items-center">
                    <div className='line' style={{alignItems: 'center', gap: '24px', cursor: 'pointer'}} onClick={() => history.push('/home')}>
                        <div><img src={abodeLogo} alt='' /></div>
                        <div>
                            {/* <h2 className='h2 mbottom-0' style={{lineHeight: '28px'}}>Abode Atlas</h2> */}
                            <h1 className='h1 mbottom-0' style={{lineHeight: '48px'}}>Abode Atlas</h1>
                        </div>
                    </div>
                    <nav style={{marginLeft: 'auto'}}>
                        <button className={props.selected==='checkpotential' ? 'header_line_selected' : 'header_link'} onClick={() => history.push('/home')}>Check potential</button>
                        <button className={props.selected==='resource' ? 'header_line_selected' : 'header_link'} onClick={() => history.push('/resource')}>Resources</button>
                        <button className={props.selected==='faq' ? 'header_line_selected' : 'header_link'}>FAQ</button>
                        <button className={props.selected==='contact' ? 'header_line_selected' : 'header_link'}>Contact</button>
                    </nav>
                </div>
            </header>
        </div>
    );
}