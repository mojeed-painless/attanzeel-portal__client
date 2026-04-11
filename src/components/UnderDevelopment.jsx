import '../assets/styles/under-development.css';
  import { useNavigate } from 'react-router-dom';
  import {
    BookOpen,
  } from 'lucide-react';

export default function UnderDevelopment({ section, onGoBack }) {
  const navigate = useNavigate();

  const handleGoBack = () => {
    if (onGoBack) {
      onGoBack();
    } else {
      navigate('/portal');
    }
  };

  return (
    <div className='development__container'>
        <BookOpen size={60} className='book-open-icon'/>
        <p>🚧 Under Development 🚧</p>
        <small>The {section} section is coming soon</small>
        <button type="button" onClick={handleGoBack}>Go back to Dashboard</button>
    </div>
  );
}