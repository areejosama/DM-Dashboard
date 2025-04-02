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

const MainAccountDashboard = () => {
  const [mainAccounts, setMainAccounts] = useState([]);
  const [subSubClasses, setSubSubClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [visibleAddMain, setVisibleAddMain] = useState(false);
  const [visibleEditMain, setVisibleEditMain] = useState(false);
  const [formData, setFormData] = useState({ account: '', subsubclassid: '' }); // استبدال subsubclass بـ account و subclassid بـ subsubclassid
  const [editId, setEditId] = useState(null);

  const TOKEN = 'arij_eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3YzIwMTAxYTJkMDU1NWQ2NDg1OGNmYyIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc0MDc2NzUwMn0.7RROT-EVMHkt40SNNkmez-ciSlnuWHIakd0ytSfb3IQ';

  useEffect(() => {
    fetchSubSubClasses();
    fetchMainAccounts();
  }, []);

  const fetchSubSubClasses = async () => {
    try {
      const response = await axios.get('http://localhost:8000/deepmetrics/api/v1/mainclass/sub2class', {
        headers: { token: TOKEN },
      });
      const subSubClassesData = response.data.data || response.data;
      if (Array.isArray(subSubClassesData)) {
        setSubSubClasses(subSubClassesData.map(item => ({
          _id: item._id,
          name: item.subsubclass,
        })));
      } else {
        setSubSubClasses([]);
      }
    } catch (err) {
      console.error('Error fetching Sub Sub Classes:', err.response ? err.response.data : err.message);
      setError('Failed to load Sub Sub Classes');
    }
  };

  const fetchMainAccounts = async () => {
    try {
      setLoading(true);
      console.log('Fetching Main Accounts with Token:', TOKEN);
      const response = await axios.get('http://localhost:8000/deepmetrics/api/v1/mainclass/accounts', {
        headers: { token: TOKEN },
      });
      const mainAccountsData = response.data.data || response.data;
      console.log('Raw API Response:', mainAccountsData);
      if (Array.isArray(mainAccountsData)) {
        const formattedMainAccounts = mainAccountsData.map((item, index) => ({
          _id: item._id || `item_${index}`,
          account: item.account, // استبدال subsubclass بـ account
          subsubclassid: item.subsubclassid, // استبدال subclassid بـ subsubclassid
        }));
        setMainAccounts(formattedMainAccounts);
      } else {
        setMainAccounts([]);
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching Main Accounts:', err.response ? err.response.data : err.message);
      setError('Failed to load Main Accounts, try again later');
      setMainAccounts([]);
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    console.log('Input Change:', { name, value });
  };

  const handleAddMainOpen = () => {
    console.log('Opening Add Main Account Modal');
    setFormData({ account: '', subsubclassid: '' });
    setVisibleAddMain(true);
  };

  const handleEditMainOpen = (mainAccountId) => {
    const mainAccount = mainAccounts.find((m) => m._id === mainAccountId);
    if (mainAccount) {
      console.log('Editing Main Account:', mainAccount);
      setEditId(mainAccountId);
      setFormData({ account: mainAccount.account, subsubclassid: mainAccount.subsubclassid });
      setVisibleEditMain(true);
    } else {
      console.error('Main Account not found for ID:', mainAccountId);
      setError('Main Account not found');
    }
  };

  const handleCreateMain = async (e) => {
    e.preventDefault();
    console.log('Form Data before validation:', formData);
    if (!formData.account.trim() || !formData.subsubclassid) {
      setError('Main Account name and Sub Sub Class are required');
      return;
    }
    try {
      const payload = { account: formData.account.trim(), subsubclassid: formData.subsubclassid };
      console.log('Creating Main Account with Payload:', payload);
      const response = await axios.post(
        'http://localhost:8000/deepmetrics/api/v1/mainclass/account',
        payload,
        {
          headers: { 'Content-Type': 'application/json', token: TOKEN },
        }
      );
      console.log('Main Account Created - Full Response:', response.data);

      const newMainAccount = {
        _id: response.data.data?._id || response.data._id,
        account: response.data.data?.account || formData.account.trim(),
        subsubclassid: response.data.data?.subsubclassid || formData.subsubclassid,
      };

      setMainAccounts([...mainAccounts, newMainAccount]);
      setSuccess('Main Account added successfully!');
      setVisibleAddMain(false);
      setFormData({ account: '', subsubclassid: '' });
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error adding Main Account:', err.response ? err.response.data : err.message);
      if (err.response?.data?.message === 'Main Account already exists') {
        setError('A Main Account with this name already exists');
      } else if (err.response?.data?.message === 'Subsubclass not found') {
        setError('Selected Sub Sub Class not found');
      } else if (err.response?.data?.message === 'Validation Error') {
        setError('Invalid data sent. Check the fields and try again.');
      } else {
        setError('Failed to add Main Account, try again later');
      }
    }
  };

  const handleUpdateMain = async (e) => {
    e.preventDefault();
    console.log('Form Data before validation:', formData);
    if (!editId) {
      setError('No Main Account selected for update');
      return;
    }
    if (!formData.account.trim() || !formData.subsubclassid) {
      setError('Main Account name and Sub Sub Class are required');
      return;
    }
    try {
      const payload = { account: formData.account.trim(), subsubclassid: formData.subsubclassid };
      console.log('Updating Main Account with Payload:', payload, 'ID:', editId);
      const response = await axios.put(
        `http://localhost:8000/deepmetrics/api/v1/mainclass/account/${editId}`,
        payload,
        {
          headers: { 'Content-Type': 'application/json', token: TOKEN },
        }
      );
      console.log('Main Account Updated:', response.data);

      const updatedMainAccount = response.data.data || {
        _id: editId,
        account: formData.account.trim(),
        subsubclassid: formData.subsubclassid,
      };
      setMainAccounts(
        mainAccounts.map((m) =>
          m._id === editId
            ? { ...m, account: updatedMainAccount.account, subsubclassid: updatedMainAccount.subsubclassid }
            : m
        )
      );
      setSuccess('Main Account updated successfully!');
      setVisibleEditMain(false);
      setFormData({ account: '', subsubclassid: '' });
      setEditId(null);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error updating Main Account:', err.response ? err.response.data : err.message);
      if (err.response?.data?.message === 'Main Account already exists') {
        setError('A Main Account with this name already exists');
      } else if (err.response?.data?.message === 'Subsubclass not found') {
        setError('Selected Sub Sub Class not found');
      } else if (err.response?.data?.message === 'Main Account not found') {
        setError('Main Account not found');
      } else {
        setError('Failed to update Main Account, try again later');
      }
    }
  };

  const handleDeleteMain = async (mainAccountId) => {
    if (window.confirm('Are you sure you want to delete this Main Account?')) {
      try {
        console.log('Deleting Main Account with ID:', mainAccountId);
        await axios.delete(`http://localhost:8000/deepmetrics/api/v1/mainclass/account/${mainAccountId}`, {
          headers: { token: TOKEN },
        });
        setMainAccounts(mainAccounts.filter((m) => m._id !== mainAccountId));
        setSuccess('Main Account deleted successfully!');
        setTimeout(() => setSuccess(null), 3000);
      } catch (err) {
        console.error('Error deleting Main Account:', err.response ? err.response.data : err.message);
        setError('Failed to delete Main Account, try again later');
      }
    }
  };

  if (loading) {
    return (
      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardHeader>
              <strong>Main Accounts Dashboard</strong>
              <CButton color="primary" className="float-end" onClick={handleAddMainOpen}>
                Add Main Account
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
              <strong>Main Accounts Dashboard</strong>
              <CButton color="primary" className="float-end" onClick={handleAddMainOpen}>
                Add Main Account
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
      <
      CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Main Accounts Dashboard</strong>
            <CButton color="primary" className="float-end" onClick={handleAddMainOpen}>
              <CIcon icon={cilPlus} /> Add Main Account
            </CButton>
          </CCardHeader>
          <CCardBody>
            {success && <div style={{ color: 'green', marginBottom: '10px' }}>{success}</div>}
            <CTable>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell scope="col">#</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Main Account Name</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Actions</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {Array.isArray(mainAccounts) && mainAccounts.length > 0 ? (
                  mainAccounts.map((mainAccount, index) => (
                    <CTableRow key={mainAccount._id}>
                      <CTableHeaderCell scope="row">{index + 1}</CTableHeaderCell>
                      <CTableDataCell>{mainAccount.account}</CTableDataCell>
                      <CTableHeaderCell>
                        <CButton
                          color="warning"
                          size="sm"
                          className="me-2"
                          onClick={() => handleEditMainOpen(mainAccount._id)}
                        >
                          <CIcon icon={cilPencil} />
                        </CButton>
                        <CButton
                          color="danger"
                          size="sm"
                          onClick={() => handleDeleteMain(mainAccount._id)}
                        >
                          <CIcon icon={cilTrash} />
                        </CButton>
                      </CTableHeaderCell>
                    </CTableRow>
                  ))
                ) : (
                  <CTableRow>
                    <CTableDataCell colSpan="3">No Main Accounts available.</CTableDataCell>
                  </CTableRow>
                )}
              </CTableBody>
            </CTable>

            <CModal visible={visibleAddMain} onClose={() => setVisibleAddMain(false)}>
              <CModalHeader>
                <CModalTitle>Add Main Account</CModalTitle>
              </CModalHeader>
              <CModalBody>
                <CForm onSubmit={handleCreateMain}>
                  <CFormInput
                    type="text"
                    name="account"
                    label="Main Account Name"
                    value={formData.account}
                    onChange={handleInputChange}
                    required
                  />
                  <CFormSelect
                    name="subsubclassid"
                    label="Sub Sub Class"
                    value={formData.subsubclassid}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Sub Sub Class</option>
                    {subSubClasses.map((subSubClass) => (
                      <option key={subSubClass._id} value={subSubClass._id}>
                        {subSubClass.name}
                      </option>
                    ))}
                  </CFormSelect>
                  <CButton type="submit" color="primary" className="mt-3">
                    Save Main Account
                  </CButton>
                </CForm>
              </CModalBody>
              <CModalFooter>
                <CButton color="secondary" onClick={() => setVisibleAddMain(false)}>
                  Close
                </CButton>
              </CModalFooter>
            </CModal>

            <CModal visible={visibleEditMain} onClose={() => setVisibleEditMain(false)}>
              <CModalHeader>
                <CModalTitle>Edit Main Account</CModalTitle>
              </CModalHeader>
              <CModalBody>
                <CForm onSubmit={handleUpdateMain}>
                  <CFormInput
                    type="text"
                    name="account"
                    label="Main Account Name"
                    value={formData.account}
                    onChange={handleInputChange}
                    required
                  />
                  <CFormSelect
                    name="subsubclassid"
                    label="Sub Sub Class"
                    value={formData.subsubclassid}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Sub Sub Class</option>
                    {subSubClasses.map((subSubClass) => (
                      <option key={subSubClass._id} value={subSubClass._id}>
                        {subSubClass.name}
                      </option>
                    ))}
                  </CFormSelect>
                  <CButton type="submit" color="primary" className="mt-3">
                    Update Main Account
                  </CButton>
                </CForm>
              </CModalBody>
              <CModalFooter>
                <CButton color="secondary" onClick={() => setVisibleEditMain(false)}>
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

export default MainAccountDashboard;