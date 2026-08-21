import "../assets/styles/bills.css";
import { useEffect, useRef, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { getBills, updateBills } from "../api/bills";

export default function FeeStructure({ grade }) {
  const [bill, setBill] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const billRef = useRef(null);

  useEffect(() => {
    if (!grade) return;

    (async () => {
      try {
        setLoading(true);
        const data = await getBills(grade);
        setBill(data.bill);
        setError('');
      } catch (err) {
        console.error(err);
        setError('Failed to load bills');
      } finally {
        setLoading(false);
      }
    })();
  }, [grade]);

  if (loading) return <div className="fee-card">Loading...</div>;
  if (error) return <div className="fee-card">{error}</div>;
  if (!bill) return null;

  const leftItems = bill.items.filter((i) => i.category === 'left');
  const rightItems = bill.items.filter((i) => i.category === 'right');

  const subtotal = (items, key) => items.reduce((s, it) => s + (Number(it[key]) || 0), 0);

  const maleSub1 = subtotal(leftItems, 'malePrice');
  const femaleSub1 = subtotal(leftItems, 'femalePrice');
  const sub2 = subtotal(rightItems, 'malePrice');
  // const femaleSub2 = subtotal(rightItems, 'femalePrice');

  const handleChange = (itemName, field, value) => {
    const items = bill.items.map((item) =>
      item.name === itemName ? { ...item, [field]: Number(value) || 0 } : item
    );
    setBill({ ...bill, items });
  };

  const handleDownload = async () => {
    if (!billRef.current) return;

    try {
      const canvas = await html2canvas(billRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        scrollY: -window.scrollY,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 8;
      const widthRatio = (pageWidth - margin * 2) / canvas.width;
      const heightRatio = (pageHeight - margin * 2) / canvas.height;
      const ratio = Math.min(widthRatio, heightRatio);
      const imgWidth = canvas.width * ratio;
      const imgHeight = canvas.height * ratio;
      const x = (pageWidth - imgWidth) / 2;
      const y = (pageHeight - imgHeight) / 2;

      pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight, undefined, 'FAST');
      pdf.save(`${grade.toLowerCase().replace(/\s+/g, '-')}-bill.pdf`);
    } catch (err) {
      console.error('Error downloading bill PDF:', err);
      setError('Unable to download bill as PDF.');
    }
  };

  const onSave = async () => {
    try {
      setLoading(true);
      const data = await updateBills(grade, bill);
      setBill(data.bill);
      setEditing(false);
    } catch (err) {
      console.error(err);
      setError('Unable to save changes. Make sure you are logged in as admin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fee-card">
      <div className="fee-card__content" ref={billRef}>
        <header className="fee-header">
          <h1>AT-TANZEEL SCHOOLS IBADAN</h1>

          <p className="subsidiary">Subsidiary of AT-TANZEEL ISLAMIC CENTER IBADAN</p>

          <p>Oeyinkun Village, Ajia Road, Off New Ibadan/Ife Express Road, Ibadan</p>

          <p>07063920769, 08120168498</p>

          <div className="class-label">{grade}</div>
        </header>

        <div className="fee-table">
          <div className="fee-column">
            {leftItems.map((item) => (
              <div className="fee-row" key={item.name}>
                <strong>{item.name}</strong>
                {editing ? (
                  <input
                    type="number"
                    value={item.malePrice}
                    onChange={(e) => handleChange(item.name, 'malePrice', e.target.value)}
                  />
                ) : (
                  <span>Male: ₦ {item.malePrice?.toLocaleString() || 0}</span>
                )}

                {editing ? (
                  <input
                    type="number"
                    value={item.femalePrice}
                    onChange={(e) => handleChange(item.name, 'femalePrice', e.target.value)}
                  />
                ) : (
                  <span>Female: ₦ {item.femalePrice?.toLocaleString() || 0}</span>
                )}
              </div>
            ))}

            <div className="subtotal-row">
              <strong>SUB TOTAL I</strong>
              <strong>₦ {maleSub1.toLocaleString()}</strong>
              <strong>₦ {femaleSub1.toLocaleString()}</strong>
            </div>

            <div className="bank-info">
              <div>
                <strong>ACCOUNT NAME:</strong>
                <span>{bill.accountName}</span>
              </div>

              <div>
                <strong>BANK NAME:</strong>
                <span>{bill.bankName}</span>
              </div>

              <div>
                <strong>ACCOUNT TYPE:</strong>
                <span>{bill.accountType}</span>
              </div>
            </div>
          </div>

          <div className="fee-column">
            {rightItems.map((item) => (
              <div className="fee-row right-row" key={item.name}>
                <strong>{item.name}</strong>
                {editing ? (
                  <input
                    type="number"
                    value={item.malePrice}
                    onChange={(e) => handleChange(item.name, 'malePrice', e.target.value)}
                  />
                ) : (
                  <span>₦ {item.malePrice?.toLocaleString() || 0}</span>
                )}
              </div>
            ))}

            <div className="subtotal-row right-subtotal">
              <strong>SUB TOTAL II</strong>
              <strong>₦ {sub2.toLocaleString()}</strong>
            </div>

            <div className="grand-total">
              <strong>GRAND TOTAL:</strong>

              <span>
                Male <b>₦ {(maleSub1 + sub2).toLocaleString()}</b>
              </span>

              <span>
                Female <b>₦ {(femaleSub1 + sub2).toLocaleString()}</b>
              </span>
            </div>

            <div className="account-number">
              <strong>ACCOUNT NUMBER:</strong>
              <div>{bill.accountNumber}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bill-btn">
        {editing ? (
          <div>
            <button onClick={onSave} disabled={loading} className="primary">
              Save
            </button>
            <button onClick={() => setEditing(false)} disabled={loading}>
              Cancel
            </button>
          </div>
        ) : (
          <div>
            <button onClick={handleDownload} className="primary">
              Download PDF
            </button>
            <button onClick={() => setEditing(true)}>
              Edit Prices
            </button>
          </div>
        )}
      </div>
    </div>
  );
}