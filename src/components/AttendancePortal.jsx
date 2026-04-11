import UnderDevelopment from './UnderDevelopment.jsx';

export default function AttendancePortal({ onGoBack }) {
    return (
        <div className="attendance__container">
            <UnderDevelopment section="Attendance" onGoBack={onGoBack} />
        </div>
    );
}