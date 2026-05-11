import {
  SearchX,
} from 'lucide-react';

export default function EmptyState({message, className}) {
    return (
        <div className={`empty-state ${className}`}>
            <SearchX size={48} className="empty-state__icon" />
            <p className="empty-state__text">{message}</p>
        </div>
    )
}