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
} from '@coreui/react';
import { CIcon } from '@coreui/icons-react';
import { cilPlus, cilPencil, cilTrash } from '@coreui/icons';
import axios from 'axios';

const Dashboard = () => {
  const [mainClasses, setMainClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [visibleAddMain, setVisibleAddMain] = useState(false);
  const [visibleEditMain, setVisibleEditMain] = useState(false);
  const [formData, setFormData] = useState({ name: '' });
  const [editId, setEditId] = useState(null);

  const TOKEN = 'arij_eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3ZWRhMDViZDMwMDA5YzMzYzVmMjA1NSIsInJvbGUiOiJtYW5hZ2VyIiwiaWF0IjoxNzQzNjI3NjQxfQ.M5naIsuddc3UZ7Oe7ZTfABdZVYQyw_i-80MU4daCoZE';

  useEffect(() => {
    fetchMainClasses();
  }, []);

  const fetchMainClasses = async () => {
    try {
      setLoading(true);
      console.log('Fetching Main Classes with Token:', TOKEN);
      const response = await axios.get('https://deepmetrics-be.onrender.com/deepmetrics/api/v1/mainclass', {
        headers: {
          token: TOKEN,
        },
      });
      const classes = response.data.data;
      console.log('Raw API Response:', classes);
      if (Array.isArray(classes)) {
        const formattedClasses = classes.map((item, index) => ({
          _id: item._id || `item_${index}`,
          name: item.name,
        }));   
        setMainClasses(formattedClasses);
        setLoading(false);
      }
    } catch (err) {
      console.error('Error fetching Main Classes:', err.response ? err.response.data : err.message);
      setError('Failed to load Main Classes, try again later');
      setMainClasses([]);
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    console.log('Input Change:', { name, value });
  };

  const handleAddMainOpen = () => {
    console.log('Opening Add Main Class Modal');
    setFormData({ name: '' });
    setVisibleAddMain(true);
  };

  const handleEditMainOpen = (classId) => {
    const mainClass = mainClasses.find((m) => m._id === classId);
    if (mainClass) {
      console.log('Editing Main Class:', mainClass);
      setEditId(classId);
      setFormData({ name: mainClass.name });
      setVisibleEditMain(true);
    } else {
      console.error('Main Class not found for ID:', classId);
      setError('Main Class not found');
    }
  };

  const handleCreateMain = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Main Class name cannot be empty');
      return;
    }
    try {
      const payload = { name: formData.name.trim() };
      console.log('Creating Main Class with Payload:', payload);
      const response = await axios.post(
        'https://deepmetrics-be.onrender.com/deepmetrics/api/v1/mainclass',
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            token: TOKEN,
          },
        }
      );
      console.log('Main Class Created - Full Response:', response.data); // Log the full response
  
      // Handle different response structures
      let newClass;
      if (response.data.data) {
        // If response has a "data" wrapper: { data: { _id, name } }
        newClass = {
          _id: response.data.data._id,
          name: response.data.data.name,
        };
      } else {
        // If response is flat: { _id, name }
        newClass = {
          _id: response.data._id,
          name: response.data.name,
        };
      }
  
      setMainClasses([...mainClasses, newClass]);
      setSuccess('Main Class added successfully!');
      setVisibleAddMain(false);
      setFormData({ name: '' });
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error adding Main Class:', err.response ? err.response.data : err.message);
      if (err.response?.data?.code === 11000) {
        setError('A Main Class with this name already exists');
      } else {
        setError('Failed to add Main Class, try again later');
      }
    }
  };

  const handleUpdateMain = async (e) => {
    e.preventDefault();
    if (!editId) {
      setError('No Main Class selected for update');
      return;
    }
    if (!formData.name.trim()) {
      setError('Main Class name cannot be empty');
      return;
    }
    try {
      const payload = { name: formData.name.trim() };
      console.log('Updating Main Class with Payload:', payload, 'ID:', editId);
      const response = await axios.put(
        `https://deepmetrics-be.onrender.com/deepmetrics/api/v1/mainclass/${editId}`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            token: TOKEN,
          },
        }
      );
      console.log('Main Class Updated:', response.data);
      setMainClasses(
        mainClasses.map((m) =>
          m._id === editId ? { ...m, name: response.data.mainclass?.name || formData.name } : m
        )
      );
      setSuccess('Main Class updated successfully!');
      setVisibleEditMain(false);
      setFormData({ name: '' });
      setEditId(null);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error updating Main Class:', err.response ? err.response.data : err.message);
      if (err.response?.data?.code === 11000) {
        setError('A Main Class with this name already exists');
      } else {
        setError('Failed to update Main Class, try again later');
      }
    }
  };

  const handleDeleteMain = async (classId) => {
    if (window.confirm('Are you sure you want to delete this Main Class?')) {
      try {
        console.log('Deleting Main Class with ID:', classId);
        await axios.delete(`https://deepmetrics-be.onrender.com/deepmetrics/api/v1/mainclass/${classId}`, {
          headers: {
            token: TOKEN,
          },
        });
        setMainClasses(mainClasses.filter((m) => m._id !== classId));
        setSuccess('Main Class deleted successfully!');
        setTimeout(() => setSuccess(null), 3000);
      } catch (err) {
        console.error('Error deleting Main Class:', err.response ? err.response.data : err.message);
        setError('Failed to delete Main Class, try again later');
      }
    }
  };

  if (loading) {
    return (
      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardHeader>
              <strong>Main Classes Dashboard</strong>
              <CButton color="primary" className="float-end" onClick={handleAddMainOpen}>
                Add Main Class
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
              <strong>Main Classes Dashboard</strong>
              <CButton color="primary" className="float-end" onClick={handleAddMainOpen}>
                Add Main Class
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
            <strong>Main Classes Dashboard</strong>
            <CButton color="primary" className="float-end" onClick={handleAddMainOpen}>
              <CIcon icon={cilPlus} /> Add Main Class
            </CButton>
          </CCardHeader>
          <CCardBody>
            {success && <div style={{ color: 'green', marginBottom: '10px' }}>{success}</div>}
            <CTable>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell scope="col">#</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Main Class Name</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Actions</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {Array.isArray(mainClasses) && mainClasses.length > 0 ? (
                  mainClasses.map((main, index) => (
                    <CTableRow key={main._id}>
                      <CTableHeaderCell scope="row">{index + 1}</CTableHeaderCell>
                      <CTableDataCell>{main.name}</CTableDataCell>
                      <CTableHeaderCell>
                        <CButton
                          color="warning"
                          size="sm"
                          className="me-2"
                          onClick={() => handleEditMainOpen(main._id)}
                        >
                          <CIcon icon={cilPencil} />
                        </CButton>
                        <CButton color="danger" size="sm" onClick={() => handleDeleteMain(main._id)}>
                          <CIcon icon={cilTrash} />
                        </CButton>
                      </CTableHeaderCell>
                    </CTableRow>
                  ))
                ) : (
                  <CTableRow>
                    <CTableDataCell colSpan="3">No Main Classes available.</CTableDataCell>
                  </CTableRow>
                )}
              </CTableBody>
            </CTable>

            <CModal visible={visibleAddMain} onClose={() => setVisibleAddMain(false)}>
              <CModalHeader>
                <CModalTitle>Add Main Class</CModalTitle>
              </CModalHeader>
              <CModalBody>
                <CForm onSubmit={handleCreateMain}>
                  <CFormInput
                    type="text"
                    name="name"
                    label="Main Class Name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                  <CButton type="submit" color="primary" className="mt-3">
                    Save Main Class
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
                <CModalTitle>Edit Main Class</CModalTitle>
              </CModalHeader>
              <CModalBody>
                <CForm onSubmit={handleUpdateMain}>
                  <CFormInput
                    type="text"
                    name="name"
                    label="Main Class Name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                  <CButton type="submit" color="primary" className="mt-3">
                    Update Main Class
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

export default Dashboard;