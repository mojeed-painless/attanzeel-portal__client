import React, { useState } from 'react';
import '../assets/styles/fees-portal.css';
import UnderDevelopment from './UnderDevelopment.jsx';
import { 
  Menu, 
  X, 
  Receipt, 
  History, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle,
  CreditCard,
  Book                   
} from 'lucide-react';

const MOCK_HISTORY = [
  { id: 'TXN-901', date: '2026-05-10', item: 'Tuition Fee (Final)', amount: 50000, status: 'Completed' },
  { id: 'TXN-882', date: '2026-04-15', item: 'Library Subscription', amount: 5000, status: 'Completed' },
  { id: 'TXN-765', date: '2026-02-12', item: 'Tuition Fee (Part)', amount: 100000, status: 'Completed' },
  { id: 'TXN-654', date: '2026-01-05', item: 'Lab Equipment Fee', amount: 15000, status: 'Completed' },
  { id: 'TXN-543', date: '2025-12-20', item: 'Sports Levy', amount: 2500, status: 'Completed' },
];

export default function FeesPortal(onGoBack) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Financial State
  const totalDesignated = 250000;
  const amountPaid = 50000; // Change this to test "Cleared" state
  const balance = totalDesignated - amountPaid;
  const isCleared = balance <= 0;

  return (
    // <div className="fee__container">
    //     <div className={`fee__side-drawer profile-nav ${isMenuOpen ? 'fee__is-open' : 'fee__is-close'}`}>
    //         <ul>
    //             <li>
    //                 <Book size={16} />
    //                 List of Books
    //             </li>
    //             <li>
    //                 <Book size={16} />
    //                 Uniform & Kits
    //             </li>
    //             <li>
    //                 <Book size={16} />
    //                 Extra-Curricular
    //             </li>
    //             <li>
    //                 <Book size={16} />
    //                 Transport Services
    //             </li>
    //         </ul>
    //     </div>

    //   <header className="fee__header">
    //     <div className="fee__header-left">
    //         <h4>Fees Portal</h4>

    //         <div className="fee__academic-context">
    //             <span className="fee__session-tag">Session: 2025/2026</span>
    //             <span className="fee__term-tag">3rd Term</span>
    //         </div>
    //     </div>

    //     {!isMenuOpen ? 
    //     (<button className="fee__menu-trigger icon-btn" onClick={() => setIsMenuOpen(true)}>
    //         <Menu size={18}/>
    //     </button>) : (
    //     <button className="fee__close-menu icon-btn" onClick={() => setIsMenuOpen(false)}>
    //         <X size={18}/>
    //     </button>
    //     )}
    //   </header>

    //   <main className="fee__content">
    //     {/* Top Section: Financial Overview */}
    //     <section className="fee__status-grid">
    //       <div className="fee__status-card">
    //         <label>Term Total</label>
    //         <p className="fee__amount">₦{totalDesignated.toLocaleString()}</p>
    //       </div>
    //       <div className="fee__status-card">
    //         <label>Total Paid</label>
    //         <p className="fee__amount paid">₦{amountPaid.toLocaleString()}</p>
    //       </div>
    //       <div className={`fee__status-card fee__balance-card ${isCleared ? 'fee__cleared' : 'fee__pending'}`}>
    //         <label>Outstanding Balance</label>
    //         <div className="fee__balance-display">
    //           {isCleared ? (
    //             <div className="fee__cleared-msg">
    //               <CheckCircle2 size={24} /> <span>CLEARED</span>
    //             </div>
    //           ) : (
    //             <p className="fee__amount">₦{balance.toLocaleString()}</p>
    //           )}
    //         </div>
    //       </div>
    //     </section>

    //     {/* Bottom Section: History */}
    //     <section className="fee__history-section">
    //       <div className="fee__section-header">
    //         <div className="fee__title-with-icon">
    //           <History size={20} />
    //           <h2>Recent Transactions</h2>
    //         </div>
    //         <button className="fee__btn-text">View Full History</button>
    //       </div>

    //       <div className="fee__table-wrapper">
    //         <table className="fee__history-table">
    //           <thead>
    //             <tr>
    //               <th>Payment Date</th>
    //               <th>Description</th>
    //               <th>Amount Paid</th>
    //               <th className="fee__text-right">Action</th>
    //             </tr>
    //           </thead>
    //           <tbody>
    //             {MOCK_HISTORY.map((txn) => (
    //               <tr key={txn.id}>
    //                 <td>{new Date(txn.date).toLocaleDateString()}</td>
    //                 <td>
    //                   <div className="fee__item-desc">
    //                     <span className="fee__dot"></span>
    //                     {txn.item}
    //                   </div>
    //                 </td>
    //                 <td className="fee__font-bold">₦{txn.amount.toLocaleString()}</td>
    //                 <td className="fee__text-right">
    //                   <button className="fee__btn-icon" title="View Details">
    //                     <ExternalLink size={16} />
    //                     <span>Details</span>
    //                   </button>
    //                 </td>
    //               </tr>
    //             ))}
    //           </tbody>
    //         </table>
    //       </div>
          
    //       <button className="fee__pay-cta">
    //         <CreditCard size={20} /> Make New Payment
    //       </button>
    //     </section>
    //   </main>
    // </div>

    <UnderDevelopment section="Fees" onGoBack={onGoBack} />
  );
}8