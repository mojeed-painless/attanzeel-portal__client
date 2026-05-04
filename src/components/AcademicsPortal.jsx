import { useState, useEffect } from 'react';
import { getUserRole } from '../api/auth';
import { getAllStaff, getStaffById, updateStaffApproval, deleteStaff } from '../api/staff';
import UnderDevelopment from './UnderDevelopment.jsx';
import '../assets/styles/admin-dashboard.css';

export default function AcademicsPortal() {
  const [role, setRole] = useState(null);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('view'); // 'view', 'approve', 'disapprove', 'delete'

  useEffect(() => {
    const userRole = getUserRole();
    setRole(userRole);
    
    if (userRole === 'admin') {
      fetchStaff();
    }
  }, []);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      setError('');
      const staffData = await getAllStaff();
      setStaff(staffData);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewStaff = async (staffId) => {
    try {
      const staffData = await getStaffById(staffId);
      setSelectedStaff(staffData);
      setModalType('view');
      setShowModal(true);
    } catch (err) {
      setError(err);
    }
  };

  const handleApproveClick = (staffData) => {
    setSelectedStaff(staffData);
    setModalType('approve');
    setShowModal(true);
  };

  const handleDisapproveClick = (staffData) => {
    setSelectedStaff(staffData);
    setModalType('disapprove');
    setShowModal(true);
  };

  const handleDeleteClick = (staffData) => {
    setSelectedStaff(staffData);
    setModalType('delete');
    setShowModal(true);
  };

  const handleConfirmApproval = async (isApproved) => {
    try {
      setLoading(true);
      await updateStaffApproval(selectedStaff.id, isApproved);
      setShowModal(false);
      setError('');
      await fetchStaff();
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      setLoading(true);
      await deleteStaff(selectedStaff.id);
      setShowModal(false);
      setError('');
      await fetchStaff();
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  if (role !== 'admin') {
    return <UnderDevelopment section="Academics" />;
  }

  return (
    <div className="academics-portal">
      <div className="portal-header">
        <h2>Staff Management</h2>
        {error && (
          <div className="error-alert">
            {error}
          </div>
        )}
      </div>

      {loading && staff.length === 0 ? (
        <div className="loading">Loading staff...</div>
      ) : (
        <div className="staff-container">
          {staff.length === 0 ? (
            <p>No staff members found.</p>
          ) : (
            <table className="staff-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {staff.map((staffMember) => (
                  <tr key={staffMember.id}>
                    <td>{staffMember.firstName} {staffMember.lastName}</td>
                    <td>{staffMember.title}</td>
                    <td>
                      <span className={`status-badge ${staffMember.isActive ? 'approved' : 'pending'}`}>
                        {staffMember.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn-small btn-view"
                        onClick={() => handleViewStaff(staffMember.id)}
                      >
                        View
                      </button>
                      {!staffMember.isActive ? (
                        <button
                          className="btn-small btn-approve"
                          onClick={() => handleApproveClick(staffMember)}
                        >
                          Approve
                        </button>
                      ) : (
                        <button
                          className="btn-small btn-disapprove"
                          onClick={() => handleDisapproveClick(staffMember)}
                        >
                          Deactivate
                        </button>
                      )}
                      <button
                        className="btn-small btn-delete"
                        onClick={() => handleDeleteClick(staffMember)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => !loading && setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {modalType === 'view' && selectedStaff && (
              <>
                <h3>Staff Details</h3>
                <div className="modal-body">
                  <p><strong>Name:</strong> {selectedStaff.firstName} {selectedStaff.lastName}</p>
                  <p><strong>Title:</strong> {selectedStaff.title}</p>
                  <p><strong>Email:</strong> {selectedStaff.email}</p>
                  <p><strong>Username:</strong> {selectedStaff.username}</p>
                  <p><strong>Classes:</strong> {selectedStaff.classes || 'N/A'}</p>
                  <p><strong>Status:</strong> {selectedStaff.isActive ? 'Active' : 'Inactive'}</p>
                  <p><strong>Active:</strong> {selectedStaff.isActive ? 'Yes' : 'No'}</p>
                  <p><strong>Registered:</strong> {new Date(selectedStaff.createdAt).toLocaleDateString()}</p>
                </div>
              </>
            )}

            {modalType === 'approve' && selectedStaff && (
              <>
                <h3>Activate Staff Member</h3>
                <div className="modal-body">
                  <p>Are you sure you want to activate <strong>{selectedStaff.firstName} {selectedStaff.lastName}</strong>?</p>
                </div>
              </>
            )}

            {modalType === 'disapprove' && selectedStaff && (
              <>
                <h3>Deactivate Staff Member</h3>
                <div className="modal-body">
                  <p>Are you sure you want to deactivate <strong>{selectedStaff.firstName} {selectedStaff.lastName}</strong>?</p>
                </div>
              </>
            )}

            {modalType === 'delete' && selectedStaff && (
              <>
                <h3>Delete Staff Member</h3>
                <div className="modal-body">
                  <p>Are you sure you want to delete <strong>{selectedStaff.firstName} {selectedStaff.lastName}</strong>? This action cannot be undone.</p>
                </div>
              </>
            )}

            <div className="modal-footer">
              {modalType === 'view' ? (
                <button className="btn-primary" onClick={() => setShowModal(false)}>
                  Close
                </button>
              ) : modalType === 'approve' ? (
                <>
                  <button
                    className="btn-secondary"
                    onClick={() => setShowModal(false)}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn-primary btn-approve"
                    onClick={() => handleConfirmApproval(true)}
                    disabled={loading}
                  >
                    {loading ? 'Activating...' : 'Activate'}
                  </button>
                </>
              ) : modalType === 'disapprove' ? (
                <>
                  <button
                    className="btn-secondary"
                    onClick={() => setShowModal(false)}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn-primary btn-disapprove"
                    onClick={() => handleConfirmApproval(false)}
                    disabled={loading}
                  >
                    {loading ? 'Deactivating...' : 'Deactivate'}
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="btn-secondary"
                    onClick={() => setShowModal(false)}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn-primary btn-delete"
                    onClick={() => handleConfirmDelete()}
                    disabled={loading}
                  >
                    {loading ? 'Deleting...' : 'Delete'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}