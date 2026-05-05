import '../assets/styles/loading-effect.css';
import asiLogo from '../assets/images/atlogo.png';

export default function LoadingEffect({message = 'Loading'}) {
    return (
        <div className="loading-overlay">
            <div className="loading-animation">
                <img src={asiLogo} alt="ASI Logo" />
            </div>
            <p>{message}<span></span></p>
        </div>
    );
}