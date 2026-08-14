import "../assets/styles/bills.css";
import { useEffect, useState } from "react";
import { getBills, updateBills } from "../api/bills";

export default function FeeStructure({ grade }) {
  const [bill, setBill] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await getBills();
        setBill(data.bill);
      } catch (err) {
        console.error(err);
        setError('Failed to load bills');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="fee-card">Loading...</div>;
  if (error) return <div className="fee-card">{error}</div>;
  if (!bill) return null;

  const leftItems = bill.items.filter((i) => i.category === 'left');
  const rightItems = bill.items.filter((i) => i.category === 'right');

  const subtotal = (items, key) => items.reduce((s, it) => s + (Number(it[key]) || 0), 0);

  const maleSub1 = subtotal(leftItems, 'malePrice');
  const femaleSub1 = subtotal(leftItems, 'femalePrice');
  const maleSub2 = subtotal(rightItems, 'malePrice');
  const femaleSub2 = subtotal(rightItems, 'femalePrice');

  const handleChange = (index, field, value) => {
    const items = [...bill.items];
    const idx = items.findIndex((it) => it.name === index);
    if (idx === -1) return;
    items[idx] = { ...items[idx], [field]: Number(value) || 0 };
    setBill({ ...bill, items });
  };

  const onSave = async () => {
    try {
      setLoading(true);
      const data = await updateBills(bill);
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
            <strong>₦ {maleSub2.toLocaleString()}</strong>
          </div>

          <div className="grand-total">
            <strong>GRAND TOTAL:</strong>

            <span>
              Male <b>₦ {(maleSub1 + maleSub2).toLocaleString()}</b>
            </span>

            <span>
              Female <b>₦ {(femaleSub1 + femaleSub2).toLocaleString()}</b>
            </span>
          </div>

          <div className="account-number">
            <strong>ACCOUNT NUMBER:</strong>
            <div>{bill.accountNumber}</div>
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
          <button onClick={() => setEditing(true)} className="primary">
            Edit Prices
          </button>
        )}
      </div>
    </div>
  );
}