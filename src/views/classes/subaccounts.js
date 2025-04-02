import React, { useState, useEffect } from 'react';
import {
  CCard,
  CCardHeader,
  CCardBody,
  CCol,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CForm,
  CFormInput,
  CFormSelect,
} from '@coreui/react';
import { CIcon } from '@coreui/icons-react';
import { cilPlus, cilPencil, cilTrash } from '@coreui/icons';
import axios from 'axios';

const SubAccountDashboard = () => {
  const [subAccounts, setSubAccounts] = useState([]);
  const [mainAccounts, setMainAccounts] = useState([]); // تغيير subSubClasses إلى mainAccounts
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [visibleAddSub, setVisibleAddSub] = useState(false);
  const [visibleEditSub, setVisibleEditSub] = useState(false);
  const [formData, setFormData] = useState({ subaccount: '', accountid: '' }); // استبدال account بـ subaccount و subsubclassid بـ accountid
  const [editId, setEditId] = useState(null);

  const TOKEN = 'arij_eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3YzIwMTAxYTJkMDU1NWQ2NDg1OGNmYyIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc0MDc2NzUwMn0.7RROT-EVMHkt40SNNkmez-ciSlnuWHIakd0ytSfb3IQ';

  useEffect(() => {
    fetchMainAccounts();
    fetchSubAccounts();
  }, []);

  const fetchMainAccounts = async () => {
    try {
      const response = await axios.get('http://localhost:8000/deepmetrics/api/v1/mainclass/accounts', {
        headers: { token: TOKEN },
      });
      const mainAccountsData = response.data.data || response.data;
      if (Array.isArray(mainAccountsData)) {
        setMainAccounts(mainAccountsData.map(item => ({
          _id: item._id,
          name: item.account,
        })));
      } else {
        setMainAccounts([]);
      }
    } catch (err) {
      console.error('Error fetching Main Accounts:', err.response ? err.response.data : err.message);
      setError('Failed to load Main Accounts');
    }
  };

  const fetchSubAccounts = async () => {
    try {
      setLoading(true);
      console.log('Fetching Sub Accounts with Token:', TOKEN);
      const response = await axios.get('http://localhost:8000/deepmetrics/api/v1/mainclass/subaccounts', {
        headers: { token: TOKEN },
      });
      const subAccountsData = response.data.data || response.data;
      console.log('Raw API Response:', subAccountsData);
      if (Array.isArray(subAccountsData)) {
        const formattedSubAccounts = subAccountsData.map((item, index) => ({
          _id: item._id || `item_${index}`,
          subaccount: item.subaccount, // استبدال account بـ subaccount
          accountid: item.accountid, // استبدال subsubclassid بـ accountid
        }));
        setSubAccounts(formattedSubAccounts);
      } else {
        setSubAccounts([]);
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching Sub Accounts:', err.response ? err.response.data : err.message);
      setError('Failed to load Sub Accounts, try again later');
      setSubAccounts([]);
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    console.log('Input Change:', { name, value });
  };

  const handleAddSubOpen = () => {
    console.log('Opening Add Sub Account Modal');
    setFormData({ subaccount: '', accountid: '' });
    setVisibleAddSub(true);
  };

  const handleEditSubOpen = (subAccountId) => {
    const subAccount = subAccounts.find((s) => s._id === subAccountId);
    if (subAccount) {
      console.log('Editing Sub Account:', subAccount);
      setEditId(subAccountId);
      setFormData({ subaccount: subAccount.subaccount, accountid: subAccount.accountid });
      setVisibleEditSub(true);
    } else {
      console.error('Sub Account not found for ID:', subAccountId);
      setError('Sub Account not found');
    }
  };

  const handleCreateSub = async (e) => {
    e.preventDefault();
    console.log('Form Data before validation:', formData);
    if (!formData.subaccount.trim() || !formData.accountid) {
      setError('Sub Account name and Main Account are required');
      return;
    }
    try {
      const payload = { subaccount: formData.subaccount.trim(), accountid: formData.accountid };
      console.log('Creating Sub Account with Payload:', payload);
      const response = await axios.post(
        'http://localhost:8000/deepmetrics/api/v1/mainclass/subaccount',
        payload,
        {
          headers: { 'Content-Type': 'application/json', token: TOKEN },
        }
      );
      console.log('Sub Account Created - Full Response:', response.data);

      const newSubAccount = {
        _id: response.data.data?._id || response.data._id,
        subaccount: response.data.data?.subaccount || formData.subaccount.trim(),
        accountid: response.data.data?.accountid || formData.accountid,
      };

      setSubAccounts([...subAccounts, newSubAccount]);
      setSuccess('Sub Account added successfully!');
      setVisibleAddSub(false);
      setFormData({ subaccount: '', accountid: '' });
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error adding Sub Account:', err.response ? err.response.data : err.message);
      if (err.response?.data?.message === 'Sub Account already exists') {
        setError('A Sub Account with this name already exists');
      } else if (err.response?.data?.message === 'Main Account not found') {
        setError('Selected Main Account not found');
      } else if (err.response?.data?.message === 'Validation Error') {
        setError('Invalid data sent. Check the fields and try again.');
      } else {
        setError('Failed to add Sub Account, try again later');
      }
    }
  };

  const handleUpdateSub = async (e) => {
    e.preventDefault();
    console.log('Form Data before validation:', formData);
    if (!editId) {
      setError('No Sub Account selected for update');
      return;
    }
    if (!formData.subaccount.trim() || !formData.accountid) {
      setError('Sub Account name and Main Account are required');
      return;
    }
    try {
      const payload = { subaccount: formData.subaccount.trim(), accountid: formData.accountid };
      console.log('Updating Sub Account with Payload:', payload, 'ID:', editId);
      const response = await axios.put(
        `http://localhost:8000/deepmetrics/api/v1/mainclass/subaccount/${editId}`,
        payload,
        {
          headers: { 'Content-Type': 'application/json', token: TOKEN },
        }
      );
      console.log('Sub Account Updated:', response.data);

      const updatedSubAccount = response.data.data || {
        _id: editId,
        subaccount: formData.subaccount.trim(),
        accountid: formData.accountid,
      };
      setSubAccounts(
        subAccounts.map((s) =>
          s._id === editId
            ? { ...s, subaccount: updatedSubAccount.subaccount, accountid: updatedSubAccount.accountid }
            : s
        )
      );
      setSuccess('Sub Account updated successfully!');
      setVisibleEditSub(false);
      setFormData({ subaccount: '', accountid: '' });
      setEditId(null);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error updating Sub Account:', err.response ? err.response.data : err.message);
      if (err.response?.data?.message === 'Sub Account already exists') {
        setError('A Sub Account with this name already exists');
      } else if (err.response?.data?.message === 'Main Account not found') {
        setError('Selected Main Account not found');
      } else if (err.response?.data?.message === 'Sub Account not found') {
        setError('Sub Account not found');
      } else {
        setError('Failed to update Sub Account, try again later');
      }
    }
  };

  const handleDeleteSub = async (subAccountId) => {
    if (window.confirm('Are you sure you want to delete this Sub Account?')) {
      try {
        console.log('Deleting Sub Account with ID:', subAccountId);
        await axios.delete(`http://localhost:8000/deepmetrics/api/v1/mainclass/subaccount/${subAccountId}`, {
          headers: { token: TOKEN },
        });
        setSubAccounts(subAccounts.filter((s) => s._id !== subAccountId));
        setSuccess('Sub Account deleted successfully!');
        setTimeout(() => setSuccess(null), 3000);
      } catch (err) {
        console.error('Error deleting Sub Account:', err.response ? err.response.data : err.message);
        setError('Failed to delete Sub Account, try again later');
      }
    }
  };

  if (loading) {
    return (
      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardHeader>
              <strong>Sub Accounts Dashboard</strong>
              <CButton color="primary" className="float-end" onClick={handleAddSubOpen}>
                Add Sub Account
              </CButton>
            </CCardHeader>
            <CCardBody>Loading...</CCardBody>
          </CCard>
        </CCol>
      </CRow>
    );
  }

  if (error) {
    return (
      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardHeader>
              <strong>Sub Accounts Dashboard</strong>
              <CButton color="primary" className="float-end" onClick={handleAddSubOpen}>
                Add Sub Account
              </CButton>
            </CCardHeader>
            <CCardBody>
              <div style={{ color: 'red' }}>{error}</div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    );
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Sub Accounts Dashboard</strong>
            <CButton color="primary" className="float-end" onClick={handleAddSubOpen}>
              <CIcon icon={cilPlus} /> Add Sub Account
            </CButton>
          </CCardHeader>
          <CCardBody>
            {success && <div style={{ color: 'green', marginBottom: '10px' }}>{success}</div>}
            <CTable>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell scope="col">#</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Sub Account Name</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Actions</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {Array.isArray(subAccounts) && subAccounts.length > 0 ? (
                  subAccounts.map((subAccount, index) => (
                    <CTableRow key={subAccount._id}>
                      <CTableHeaderCell scope="row">{index + 1}</CTableHeaderCell>
                      <CTableDataCell>{subAccount.subaccount}</CTableDataCell>
                      <CTableHeaderCell>
                        <CButton
                          color="warning"
                          size="sm"
                          className="me-2"
                          onClick={() => handleEditSubOpen(subAccount._id)}
                        >
                          <CIcon icon={cilPencil} />
                        </CButton>
                        <CButton
                          color="danger"
                          size="sm"
                          onClick={() => handleDeleteSub(subAccount._id)}
                        >
                          <CIcon icon={cilTrash} />
                        </CButton>
                      </CTableHeaderCell>
                    </CTableRow>
                  ))
                ) : (
                  <CTableRow>
                    <CTableDataCell colSpan="3">No Sub Accounts available.</CTableDataCell>
                  </CTableRow>
                )}
              </CTableBody>
            </CTable>

            <CModal visible={visibleAddSub} onClose={() => setVisibleAddSub(false)}>
              <CModalHeader>
                <CModalTitle>Add Sub Account</CModalTitle>
              </CModalHeader>
              <CModalBody>
                <CForm onSubmit={handleCreateSub}>
                  <CFormInput
                    type="text"
                    name="subaccount"
                    label="Sub Account Name"
                    value={formData.subaccount}
                    onChange={handleInputChange}
                    required
                  />
                  <CFormSelect
                    name="accountid"
                    label="Main Account"
                    value={formData.accountid}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Main Account</option>
                    {mainAccounts.map((mainAccount) => (
                      <option key={mainAccount._id} value={mainAccount._id}>
                        {mainAccount.name}
                      </option>
                    ))}
                  </CFormSelect>
                  <CButton type="submit" color="primary" className="mt-3">
                    Save Sub Account
                  </CButton>
                </CForm>
              </CModalBody>
              <CModalFooter>
                <CButton color="secondary" onClick={() => setVisibleAddSub(false)}>
                  Close
                </CButton>
              </CModalFooter>
            </CModal>

            <CModal visible={visibleEditSub} onClose={() => setVisibleEditSub(false)}>
              <CModalHeader>
                <CModalTitle>Edit Sub Account</CModalTitle>
              </CModalHeader>
              <CModalBody>
                <CForm onSubmit={handleUpdateSub}>
                  <CFormInput
                    type="text"
                    name="subaccount"
                    label="Sub Account Name"
                    value={formData.subaccount}
                    onChange={handleInputChange}
                    required
                  />
                  <CFormSelect
                    name="accountid"
                    label="Main Account"
                    value={formData.accountid}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Main Account</option>
                    {mainAccounts.map((mainAccount) => (
                      <option key={mainAccount._id} value={mainAccount._id}>
                        {mainAccount.name}
                      </option>
                    ))}
                  </CFormSelect>
                  <CButton type="submit" color="primary" className="mt-3">
                    Update Sub Account
                  </CButton>
                </CForm>
              </CModalBody>
              <CModalFooter>
                <CButton color="secondary" onClick={() => setVisibleEditSub(false)}>
                  Close
                </CButton>
              </CModalFooter>
            </CModal>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  );
};

export default SubAccountDashboard;