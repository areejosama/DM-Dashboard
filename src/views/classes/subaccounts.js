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
  const [mainAccounts, setMainAccounts] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [visibleAddSub, setVisibleAddSub] = useState(false);
  const [visibleEditSub, setVisibleEditSub] = useState(false);
  const [formData, setFormData] = useState({ subaccount: '', accountid: '', sectorid: '' });
  const [editId, setEditId] = useState(null);

  const TOKEN = 'arij_eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3ZWRhMDViZDMwMDA5YzMzYzVmMjA1NSIsInJvbGUiOiJtYW5hZ2VyIiwiaWF0IjoxNzQzNjI3NjQxfQ.M5naIsuddc3UZ7Oe7ZTfABdZVYQyw_i-80MU4daCoZE';

  useEffect(() => {
    const fetchData = async () => {
      await fetchSectors();
      await fetchMainAccounts();
      await fetchSubAccounts();
    };
    fetchData();
  }, []);

  const fetchSectors = async () => {
    try {
      const response = await axios.get('https://deepmetrics-be.onrender.com/deepmetrics/api/v1/sector', {
        headers: { token: TOKEN },
      });
      const sectorsData = response.data.allsectors;
      console.log('Sectors Data:', sectorsData);
      if (Array.isArray(sectorsData)) {
        setSectors(sectorsData.map(item => ({
          _id: item._id,
          name: item.Sector,
        })));
      } else {
        setSectors([]);
      }
    } catch (err) {
      console.error('Error fetching Sectors:', err.response ? err.response.data : err.message);
      setError('Failed to load Sectors');
    }
  };

  const fetchMainAccounts = async () => {
    try {
      const response = await axios.get('https://deepmetrics-be.onrender.com/deepmetrics/api/v1/mainclass/accounts', {
        headers: { token: TOKEN },
      });
      const mainAccountsData = response.data.data || response.data;
      if (Array.isArray(mainAccountsData)) {
        setMainAccounts(
          mainAccountsData.map(item => ({
            _id: item._id,
            name: item.account,
            subsubclassid: item.subsubclassid?._id || item.subsubclassid,
            subsubclassName: item.subsubclassid?.subsubclass || 'Unknown', // جلب اسم الـ Sub Sub Class
            sectorid: item.sectorid?._id || item.sectorid,
            sectorName: item.sectorid?.Sector || 'Unknown',
            displayName: `${item.account} (${item.subsubclassid?.subsubclass || 'Unknown'})`, // عرض الـ Sub Sub Class بين قوسين
          }))
        );
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
      const response = await axios.get('https://deepmetrics-be.onrender.com/deepmetrics/api/v1/mainclass/subaccounts', {
        headers: { token: TOKEN },
      });
      const subAccountsData = response.data.data || response.data;
      console.log('Raw API Response:', subAccountsData);
      if (Array.isArray(subAccountsData)) {
        const formattedSubAccounts = subAccountsData.map((item, index) => ({
          _id: item._id || `item_${index}`,
          subaccount: item.subaccount,
          accountid: item.accountid?._id || item.accountid,
          mainAccountName: item.accountid?.account || 'Unknown',
          sectorid: item.sectorid?._id || item.sectorid,
          sectorName: item.sectorid?.Sector || item.accountid?.sectorid?.Sector || 'Unknown',
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
    if (name === 'accountid') {
      const selectedMainAccount = mainAccounts.find(m => m._id === value);
      setFormData({
        ...formData,
        accountid: value,
        sectorid: selectedMainAccount?.sectorid || '',
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    console.log('Input Change:', { name, value });
  };

  const handleAddSubOpen = () => {
    console.log('Opening Add Sub Account Modal');
    setFormData({ subaccount: '', accountid: '', sectorid: '' });
    setVisibleAddSub(true);
  };

  const handleEditSubOpen = (subAccountId) => {
    const subAccount = subAccounts.find((s) => s._id === subAccountId);
    if (subAccount) {
      console.log('Editing Sub Account:', subAccount);
      setEditId(subAccountId);
      setFormData({ 
        subaccount: subAccount.subaccount, 
        accountid: subAccount.accountid,
        sectorid: subAccount.sectorid || '',
      });
      setVisibleEditSub(true);
    } else {
      console.error('Sub Account not found for ID:', subAccountId);
      setError('Sub Account not found');
    }
  };

  const handleCreateSub = async (e) => {
    e.preventDefault();
    console.log('Form Data before validation:', formData);
    if (!formData.subaccount.trim() || !formData.accountid || !formData.sectorid) {
      setError('Sub Account name, Main Account, and Sector are required');
      return;
    }
    try {
      const payload = { 
        subaccount: formData.subaccount.trim(), 
        accountid: formData.accountid,
        sectorid: formData.sectorid,
      };
      console.log('Creating Sub Account with Payload:', payload);
      const response = await axios.post(
        'https://deepmetrics-be.onrender.com/deepmetrics/api/v1/mainclass/subaccount',
        payload,
        {
          headers: { 'Content-Type': 'application/json', token: TOKEN },
        }
      );
      console.log('Sub Account Created - Full Response:', response.data);

      const selectedMainAccount = mainAccounts.find(m => m._id === formData.accountid);
      const selectedSector = sectors.find(s => s._id === formData.sectorid);
      const newSubAccount = {
        _id: response.data.data?._id || response.data._id,
        subaccount: response.data.data?.subaccount || formData.subaccount.trim(),
        accountid: response.data.data?.accountid || formData.accountid,
        mainAccountName: selectedMainAccount?.name || 'Unknown',
        sectorid: formData.sectorid,
        sectorName: selectedSector?.name || 'Unknown',
      };

      setSubAccounts([...subAccounts, newSubAccount]);
      setSuccess('Sub Account added successfully!');
      setVisibleAddSub(false);
      setFormData({ subaccount: '', accountid: '', sectorid: '' });
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error adding Sub Account:', err.response ? err.response.data : err.message);
      if (err.response?.data?.message === 'Sub Account already exists') {
        setError('A Sub Account with this name already exists');
      } else if (err.response?.data?.message === 'Main Account not found') {
        setError('Selected Main Account not found');
      } else if (err.response?.data?.message === 'Sector not found') {
        setError('Selected Sector not found');
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
    if (!formData.subaccount.trim() || !formData.accountid || !formData.sectorid) {
      setError('Sub Account name, Main Account, and Sector are required');
      return;
    }
    try {
      const payload = { 
        subaccount: formData.subaccount.trim(), 
        accountid: formData.accountid,
        sectorid: formData.sectorid,
      };
      console.log('Updating Sub Account with Payload:', payload, 'ID:', editId);
      const response = await axios.put(
        `https://deepmetrics-be.onrender.com/deepmetrics/api/v1/mainclass/subaccount/${editId}`,
        payload,
        {
          headers: { 'Content-Type': 'application/json', token: TOKEN },
        }
      );
      console.log('Sub Account Updated:', response.data);

      const selectedMainAccount = mainAccounts.find(m => m._id === formData.accountid);
      const selectedSector = sectors.find(s => s._id === formData.sectorid);
      const updatedSubAccount = response.data.data || {
        _id: editId,
        subaccount: formData.subaccount.trim(),
        accountid: formData.accountid,
        mainAccountName: selectedMainAccount?.name || 'Unknown',
        sectorid: formData.sectorid,
        sectorName: selectedSector?.name || 'Unknown',
      };
      setSubAccounts(
        subAccounts.map((s) =>
          s._id === editId
            ? { 
                ...s, 
                subaccount: updatedSubAccount.subaccount, 
                accountid: updatedSubAccount.accountid,
                mainAccountName: updatedSubAccount.mainAccountName,
                sectorid: updatedSubAccount.sectorid,
                sectorName: updatedSubAccount.sectorName,
              }
            : s
        )
      );
      setSuccess('Sub Account updated successfully!');
      setVisibleEditSub(false);
      setFormData({ subaccount: '', accountid: '', sectorid: '' });
      setEditId(null);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error updating Sub Account:', err.response ? err.response.data : err.message);
      if (err.response?.data?.message === 'Sub Account already exists') {
        setError('A Sub Account with this name already exists');
      } else if (err.response?.data?.message === 'Main Account not found') {
        setError('Selected Main Account not found');
      } else if (err.response?.data?.message === 'Sector not found') {
        setError('Selected Sector not found');
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
        await axios.delete(`https://deepmetrics-be.onrender.com/deepmetrics/api/v1/mainclass/subaccount/${subAccountId}`, {
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
                  <CTableHeaderCell scope="col">Sub Account</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Main Account</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Sector</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Action</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {Array.isArray(subAccounts) && subAccounts.length > 0 ? (
                  subAccounts.map((subAccount, index) => (
                    <CTableRow key={subAccount._id}>
                      <CTableHeaderCell scope="row">{index + 1}</CTableHeaderCell>
                      <CTableDataCell>{subAccount.subaccount}</CTableDataCell>
                      <CTableDataCell>{subAccount.mainAccountName}</CTableDataCell>
                      <CTableDataCell>{subAccount.sectorName}</CTableDataCell>
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
                    <CTableDataCell colSpan="5">No Sub Accounts available.</CTableDataCell>
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
                        {mainAccount.displayName}
                      </option>
                    ))}
                  </CFormSelect>
                  <CFormSelect
                    name="sectorid"
                    label="Sector"
                    value={formData.sectorid}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Sector</option>
                    {sectors.map((sector) => (
                      <option key={sector._id} value={sector._id}>
                        {sector.name}
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
                        {mainAccount.displayName}
                      </option>
                    ))}
                  </CFormSelect>
                  <CFormSelect
                    name="sectorid"
                    label="Sector"
                    value={formData.sectorid}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Sector</option>
                    {sectors.map((sector) => (
                      <option key={sector._id} value={sector._id}>
                        {sector.name}
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