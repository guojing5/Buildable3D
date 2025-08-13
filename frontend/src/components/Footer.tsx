export default function Footer() {
    return (
        <footer className="pt-4 pt-md-5 border-top" style={{'backgroundColor': '#00204b', 'color': 'white'}}>
            <div className="container">
                <div className="row">
                    <div className="col-3">
                    </div>
                    <div className="col-9">
                        <div className="row">
                            <div className="col-3 col-md">
                                <h6>Quick Links</h6>
                                <ul className="list-unstyled text-small">
                                <li className="mb-1"><a className="link-secondary text-decoration-none" href="/eligibility">Check eligibility</a></li>
                                <li className="mb-1"><a className="link-secondary text-decoration-none" href="/resources">Resources</a></li>
                                <li className="mb-1"><a className="link-secondary text-decoration-none" href="/map">Maps</a></li>
                                <li className="mb-1"><a className="link-secondary text-decoration-none" href="/faq">FAQs</a></li>
                                <li className="mb-1"><a className="link-secondary text-decoration-none" href="/contact">Contact us</a></li>
                                </ul>
                            </div>
                            <div className="col-3 col-md">
                                <h6>Terms and policies</h6>
                                <ul className="list-unstyled text-small">
                                <li className="mb-1"><a className="link-secondary text-decoration-none" href="/privacy">Privacy policy</a></li>
                                <li className="mb-1"><a className="link-secondary text-decoration-none" href="/terms">Terms of use</a></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}