
import "./footer.css";

function Footer() {
    return (
        <footer className="footer">
            <div className="footer-content">

                <div className="footer-brand">
                    <h3>Travel<span>Explorer</span></h3>
                    <p>Discover amazing destinations and create unforgettable travel experiences with us.</p>
                </div>

                <div className="footer-links">
                    <h4>Quick Links</h4>
                    <a href="/">Home</a>
                    <a href="/tours">Tours</a>
                    <a href="/about">About Us</a>
                    <a href="/contact">Contact</a>
                </div>

                <div className="footer-contact">
                    <h4>Contact Us</h4>
                    <p><i className="bi bi-geo-alt"></i> Kerala, India</p>
                    <p><i className="bi bi-envelope"></i> info@travelexplorer.com</p>
                    <p><i className="bi bi-telephone"></i> +91 98765 43210</p>
                </div>

                <div className="footer-social">
                    <h4>Follow Us</h4>
                    <div className="social-icons">
                        <a href="#" aria-label="Facebook"><i className="bi bi-facebook"></i></a>
                        <a href="#" aria-label="Instagram"><i className="bi bi-instagram"></i></a>
                        <a href="#" aria-label="Twitter"><i className="bi bi-twitter-x"></i></a>
                        <a href="#" aria-label="YouTube"><i className="bi bi-youtube"></i></a>
                    </div>
                </div>

            </div>

            <div className="footer-bottom">
                <p>© 2026 TravelExplorer. All Rights Reserved.</p>
            </div>
        </footer>
    );
}

export default Footer;
