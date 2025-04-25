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
  const [sectors, setSectors] = useState([]); // State للسكتور
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [visibleAddMain, setVisibleAddMain] = useState(false);
  const [visibleEditMain, setVisibleEditMain] = useState(false);
  const [formData, setFormData] = useState({ account: '', subsubclassid: '', sectorid: '' });
  const [editId, setEditId] = useState(null);

  const TOKEN = 'arij_eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3ZWRhMDViZDMwMDA5YzMzYzVmMjA1NSIsInJvbGUiOiJtYW5hZ2VyIiwiaWF0IjoxNzQzNjI3NjQxfQ.M5naIsuddc3UZ7Oe7ZTfABdZVYQyw_i-80MU4daCoZE';

  useEffect(() => {
    const fetchData = async () => {
      await fetchSectors();
      await fetchSubSubClasses();
      await fetchMainAccounts();
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

  const fetchSubSubClasses = async () => {
    try {
      const response = await axios.get('https://deepmetrics-be.onrender.com/deepmetrics/api/v1/mainclass/sub2class', {
        headers: { token: TOKEN },
      });
      const subSubClassesData = response.data.data || response.data;
      if (Array.isArray(subSubClassesData)) {
        setSubSubClasses(
          subSubClassesData.map(item => ({
            _id: item._id,
            name: item.subsubclass,
            subclassid: item.subclassid?._id || item.subclassid,
            subclassName: item.subclassid?.subclass || 'Unknown', // جلب اسم الـ Sub Class
            sectorid: item.sectorid?._id || item.sectorid,
            sectorName: item.sectorid?.Sector || 'Unknown',
            displayName: `${item.subsubclass} (${item.subclassid?.subclass || 'Unknown'})`, // عرض الـ Sub Class بين قوسين
          }))
        );
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
      const response = await axios.get('https://deepmetrics-be.onrender.com/deepmetrics/api/v1/mainclass/accounts', {
        headers: { token: TOKEN },
      });
      const mainAccountsData = response.data.data || response.data;
      console.log('Raw API Response:', mainAccountsData);
      if (Array.isArray(mainAccountsData)) {
        const formattedMainAccounts = mainAccountsData.map((item, index) => ({
          _id: item._id || `item_${index}`,
          account: item.account,
          subsubclassid: item.subsubclassid?._id || item.subsubclassid,
          subsubclassName: item.subsubclassid?.subsubclass || 'Unknown',
          sectorid: item.sectorid?._id || item.sectorid,
          sectorName: item.sectorid?.Sector || item.subsubclassid?.sectorid?.Sector || 'Unknown',
          displayName: `${item.account} (${item.subsubclassid?.subsubclass || 'Unknown'})`,
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
    if (name === 'subsubclassid') {
      const selectedSubSubClass = subSubClasses.find(s => s._id === value);
      setFormData({
        ...formData,
        subsubclassid: value,
        sectorid: selectedSubSubClass?.sectorid || '',
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    console.log('Input Change:', { name, value });
  };

  const handleAddMainOpen = () => {
    console.log('Opening Add Main Account Modal');
    setFormData({ account: '', subsubclassid: '', sectorid: '' });
    setVisibleAddMain(true);
  };

  const handleEditMainOpen = (mainAccountId) => {
    const mainAccount = mainAccounts.find((m) => m._id === mainAccountId);
    if (mainAccount) {
      console.log('Editing Main Account:', mainAccount);
      setEditId(mainAccountId);
      setFormData({ 
        account: mainAccount.account, 
        subsubclassid: mainAccount.subsubclassid,
        sectorid: mainAccount.sectorid || '',
      });
      setVisibleEditMain(true);
    } else {
      console.error('Main Account not found for ID:', mainAccountId);
      setError('Main Account not found');
    }
  };

  const handleCreateMain = async (e) => {
    e.preventDefault();
    console.log('Form Data before validation:', formData);
    if (!formData.account.trim() || !formData.subsubclassid || !formData.sectorid) {
      setError('Main Account name, Sub Sub Class, and Sector are required');
      return;
    }
    try {
      const payload = { 
        account: formData.account.trim(), 
        subsubclassid: formData.subsubclassid,
        sectorid: formData.sectorid,
      };
      console.log('Creating Main Account with Payload:', payload);
      const response = await axios.post(
        'https://deepmetrics-be.onrender.com/deepmetrics/api/v1/mainclass/account',
        payload,
        {
          headers: { 'Content-Type': 'application/json', token: TOKEN },
        }
      );
      console.log('Main Account Created - Full Response:', response.data);

      const selectedSubSubClass = subSubClasses.find(s => s._id === formData.subsubclassid);
      const selectedSector = sectors.find(s => s._id === formData.sectorid);
      const newMainAccount = {
        _id: response.data.data?._id || response.data._id,
        account: response.data.data?.account || formData.account.trim(),
        subsubclassid: response.data.data?.subsubclassid || formData.subsubclassid,
        subsubclassName: selectedSubSubClass?.name || 'Unknown',
        sectorid: formData.sectorid,
        sectorName: selectedSector?.name || 'Unknown',
        displayName: `${formData.account.trim()} (${selectedSubSubClass?.name || 'Unknown'})`,
      };

      setMainAccounts([...mainAccounts, newMainAccount]);
      setSuccess('Main Account added successfully!');
      setVisibleAddMain(false);
      setFormData({ account: '', subsubclassid: '', sectorid: '' });
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error adding Main Account:', err.response ? err.response.data : err.message);
      if (err.response?.data?.message === 'Main Account already exists') {
        setError('A Main Account with this name already exists');
      } else if (err.response?.data?.message === 'Subsubclass not found') {
        setError('Selected Sub Sub Class not found');
      } else if (err.response?.data?.message === 'Sector not found') {
        setError('Selected Sector not found');
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
    if (!formData.account.trim() || !formData.subsubclassid || !formData.sectorid) {
      setError('Main Account name, Sub Sub Class, and Sector are required');
      return;
    }
    try {
      const payload = { 
        account: formData.account.trim(), 
        subsubclassid: formData.subsubclassid,
        sectorid: formData.sectorid,
      };
      console.log('Updating Main Account with Payload:', payload, 'ID:', editId);
      const response = await axios.put(
        `https://deepmetrics-be.onrender.com/deepmetrics/api/v1/mainclass/account/${editId}`,
        payload,
        {
          headers: { 'Content-Type': 'application/json', token: TOKEN },
        }
      );
      console.log('Main Account Updated:', response.data);

      const selectedSubSubClass = subSubClasses.find(s => s._id === formData.subsubclassid);
      const selectedSector = sectors.find(s => s._id === formData.sectorid);
      const updatedMainAccount = response.data.data || {
        _id: editId,
        account: formData.account.trim(),
        subsubclassid: formData.subsubclassid,
        subsubclassName: selectedSubSubClass?.name || 'Unknown',
        sectorid: formData.sectorid,
        sectorName: selectedSector?.name || 'Unknown',
        displayName: `${formData.account.trim()} (${selectedSubSubClass?.name || 'Unknown'})`,
      };
      setMainAccounts(
        mainAccounts.map((m) =>
          m._id === editId
            ? { 
                ...m, 
                account: updatedMainAccount.account, 
                subsubclassid: updatedMainAccount.subsubclassid,
                subsubclassName: updatedMainAccount.subsubclassName,
                sectorid: updatedMainAccount.sectorid,
                sectorName: updatedMainAccount.sectorName,
                displayName: updatedMainAccount.displayName,
              }
            : m
        )
      );
      setSuccess('Main Account updated successfully!');
      setVisibleEditMain(false);
      setFormData({ account: '', subsubclassid: '', sectorid: '' });
      setEditId(null);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error updating Main Account:', err.response ? err.response.data : err.message);
      if (err.response?.data?.message === 'Main Account already exists') {
        setError('A Main Account with this name already exists');
      } else if (err.response?.data?.message === 'Subsubclass not found') {
        setError('Selected Sub Sub Class not found');
      } else if (err.response?.data?.message === 'Sector not found') {
        setError('Selected Sector not found');
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
        await axios.delete(`https://deepmetrics-be.onrender.com/deepmetrics/api/v1/mainclass/account/${mainAccountId}`, {
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
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
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
                  <CTableHeaderCell scope="col">Main Account</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Sub Sub Class</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Sector</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Action</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {Array.isArray(mainAccounts) && mainAccounts.length > 0 ? (
                  mainAccounts.map((mainAccount, index) => (
                    <CTableRow key={mainAccount._id}>
                      <CTableHeaderCell scope="row">{index + 1}</CTableHeaderCell>
                      <CTableDataCell>{mainAccount.account}</CTableDataCell>
                      <CTableDataCell>{mainAccount.subsubclassName}</CTableDataCell>
                      <CTableDataCell>{mainAccount.sectorName}</CTableDataCell>
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
                    <CTableDataCell colSpan="5">No Main Accounts available.</CTableDataCell>
                  </CTableRow>
                )}
              </CTableBody>
            </CTable>

            {/* Modal لإضافة Main Account */}
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
                        {subSubClass.displayName}
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

            {/* Modal لتعديل Main Account */}
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
                        {subSubClass.displayName}
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