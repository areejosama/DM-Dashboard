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

const SubClassDashboard = () => {
  const [subClasses, setSubClasses] = useState([]);
  const [mainClasses, setMainClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [visibleAddSub, setVisibleAddSub] = useState(false);
  const [visibleEditSub, setVisibleEditSub] = useState(false);
  const [formData, setFormData] = useState({ name: '', classid: '' }); 
  const [editId, setEditId] = useState(null);

  const TOKEN = 'arij_eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3ZWRhMDViZDMwMDA5YzMzYzVmMjA1NSIsInJvbGUiOiJtYW5hZ2VyIiwiaWF0IjoxNzQzNjI3NjQxfQ.M5naIsuddc3UZ7Oe7ZTfABdZVYQyw_i-80MU4daCoZE';

  useEffect(() => {
    fetchMainClasses();
    fetchSubClasses();
  }, []);

  const fetchMainClasses = async () => {
    try {
      const response = await axios.get('https://deepmetrics-be.onrender.com/deepmetrics/api/v1/mainclass', {
        headers: { token: TOKEN },
      });
      const mainClassesData = response.data.data || response.data;
      if (Array.isArray(mainClassesData)) {
        setMainClasses(mainClassesData.map(item => ({
          _id: item._id,
          name: item.name,
        })));
      } else {
        setMainClasses([]);
      }
    } catch (err) {
      console.error('Error fetching Main Classes:', err.response ? err.response.data : err.message);
      setError('Failed to load Main Classes');
    }
  };

  const fetchSubClasses = async () => {
    try {
      setLoading(true);
      console.log('Fetching Sub Classes with Token:', TOKEN);
      const response = await axios.get('https://deepmetrics-be.onrender.com/deepmetrics/api/v1/mainclass/subclass', {
        headers: { token: TOKEN },
      });
      const subClassesData = response.data.data || response.data;
      console.log('Raw API Response:', subClassesData);
      if (Array.isArray(subClassesData)) {
        const formattedSubClasses = subClassesData.map((item, index) => ({
          _id: item._id || `item_${index}`,
          name: item.subclass,
          classid: item.classid,
        }));
        setSubClasses(formattedSubClasses);
      } else {
        setSubClasses([]);
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching Sub Classes:', err.response ? err.response.data : err.message);
      setError('Failed to load Sub Classes, try again later');
      setSubClasses([]);
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    console.log('Input Change:', { name, value });
  };

  const handleAddSubOpen = () => {
    console.log('Opening Add Sub Class Modal');
    setFormData({ name: '', classid: ''});
    setVisibleAddSub(true);
  };

  const handleEditSubOpen = (subClassId) => {
    const subClass = subClasses.find((s) => s._id === subClassId);
    if (subClass) {
      console.log('Editing Sub Class:', subClass);
      setEditId(subClassId); // الـ ID بيتخزن هنا
      setFormData({ name: subClass.name, classid: subClass.classid});
      setVisibleEditSub(true);
    } else {
      console.error('Sub Class not found for ID:', subClassId);
      setError('Sub Class not found');
    }
  };

  const handleCreateSub = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.classid ) {
      setError('Sub Class name, Main Class');
      return;
    }
    try {
      const payload = { 
        subclass: formData.name.trim(), 
        classid: formData.classid,
      };
      console.log('Creating Sub Class with Payload:', payload);
      const response = await axios.post(
        'https://deepmetrics-be.onrender.com/deepmetrics/api/v1/mainclass/subclass',
        payload,
        {
          headers: { 'Content-Type': 'application/json', token: TOKEN },
        }
      );
      console.log('Sub Class Created - Full Response:', response.data);

      const newSubClass = {
        _id: response.data._id || Date.now().toString(),
        name: formData.name.trim(),
        classid: formData.classid,
      };

      setSubClasses([...subClasses, newSubClass]);
      setSuccess('Sub Class added successfully!');
      setVisibleAddSub(false);
      setFormData({ name: '', classid: ''});
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error adding Sub Class:', err.response ? err.response.data : err.message);
      if (err.response?.data?.message === 'Subclass already exists') {
        setError('A Sub Class with this name already exists');
      } else if (err.response?.data?.message === 'Class not found') {
        setError('Selected Main Class not found');
      } else if (err.response?.data?.message === 'Validation Error') {
        setError('Invalid data sent. Check the fields and try again.');
      } else {
        setError('Failed to add Sub Class, try again later');
      }
    }
  };

  const handleUpdateSub = async (e) => {
    e.preventDefault();
    if (!editId) {
      setError('No Sub Class selected for update');
      return;
    }
    if (!formData.name.trim() || !formData.classid ) {
      setError('Sub Class name, Main Class');
      return;
    }
    try {
      const payload = { 
        subclass: formData.name.trim(), 
        classid: formData.classid,
      };
      console.log('Updating Sub Class with Payload:', payload, 'ID:', editId);
      const response = await axios.put(
        `https://deepmetrics-be.onrender.com/deepmetrics/api/v1/mainclass/subclass/${editId}`,
        payload,
        {
          headers: { 'Content-Type': 'application/json', token: TOKEN },
        }
      );
      console.log('Sub Class Updated:', response.data);
      setSubClasses(
        subClasses.map((s) =>
          s._id === editId
            ? { 
                ...s, 
                name: formData.name.trim(), 
                classid: formData.classid,
              }
            : s
        )
      );
      setSuccess('Sub Class updated successfully!');
      setVisibleEditSub(false);
      setFormData({ name: '', classid: ''});
      setEditId(null);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error updating Sub Class:', err.response ? err.response.data : err.message);
      if (err.response?.data?.message === 'Subclass already exists') {
        setError('A Sub Class with this name already exists');
      } else if (err.response?.data?.message === 'Class not found') {
        setError('Selected Main Class not found');
      }else {
        setError('Failed to update Sub Class, try again later');
      }
    }
  };

const handleDeleteSub = async (subClassId) => {
    if (window.confirm('Are you sure you want to delete this Sub Class?')) {
      try {
        console.log('Deleting Sub Class with ID:', subClassId);
        await axios.delete(`https://deepmetrics-be.onrender.com/deepmetrics/api/v1/mainclass/subclass/${subClassId}`, {
          headers: { token: TOKEN },
        });
        setSubClasses(subClasses.filter((s) => s._id !== subClassId));
        setSuccess('Sub Class deleted successfully!');
        setTimeout(() => setSuccess(null), 3000);
      } catch (err) {
        console.error('Error deleting Sub Class:', err.response ? err.response.data : err.message);
        setError('Failed to delete Sub Class, try again later');
      }
    }
  };

  if (loading) {
    return (
      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardHeader>
              <strong></strong>
              <CButton color="primary" className="float-end" onClick={handleAddSubOpen}>
                Add Sub Class
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
                Add Sub Class
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
              <CIcon icon={cilPlus} /> Add Sub Class
            </CButton>
          </CCardHeader>
          <CCardBody>
            {success && <div style={{ color: 'green', marginBottom: '10px' }}>{success}</div>}
            <CTable>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell scope="col">#</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Sub Class</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Action</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {Array.isArray(subClasses) && subClasses.length > 0 ? (
                  subClasses.map((subClass, index) => (
                    <CTableRow key={subClass._id}>
                      <CTableHeaderCell scope="row">{index + 1}</CTableHeaderCell>
                      <CTableDataCell>{subClass.name}</CTableDataCell>
                      <CTableHeaderCell>
                        <CButton
                          color="warning"
                          size="sm"
                          className="me-2"
                          onClick={() => handleEditSubOpen(subClass._id)}
                        >
                          <CIcon icon={cilPencil} />
                        </CButton>
                        <CButton color="danger" size="sm" onClick={() => handleDeleteSub(subClass._id)}>
                          <CIcon icon={cilTrash} />
                        </CButton>
                      </CTableHeaderCell>
                    </CTableRow>
                  ))
                ) : (
                  <CTableRow>
                    <CTableDataCell colSpan="4">No Sub Classes available.</CTableDataCell>
                  </CTableRow>
                )}
              </CTableBody>
            </CTable>

            <CModal visible={visibleAddSub} onClose={() => setVisibleAddSub(false)}>
              <CModalHeader>
                <CModalTitle>Add Sub Class</CModalTitle>
              </CModalHeader>
              <CModalBody>
                <CForm onSubmit={handleCreateSub}>
                  <CFormInput
                    type="text"
                    name="name"
                    label="Sub Class Name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                  <CFormSelect
                    name="classid"
                    label="Main Class"
                    value={formData.classid}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Main Class</option>
                    {mainClasses.map((mainClass) => (
                      <option key={mainClass._id} value={mainClass._id}>
                        {mainClass.name}
                      </option>
                    ))}
                  </CFormSelect>
                  <CButton type="submit" color="primary" className="mt-3">
                    Save Sub Class
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
                <CModalTitle>Edit Sub Class</CModalTitle>
              </CModalHeader>
              <CModalBody>
                <CForm onSubmit={handleUpdateSub}>
                  <CFormInput
                    type="text"
                    name="name"
                    label="Sub Class Name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                  <CFormSelect
                    name="classid"
                    label="Main Class"
                    value={formData.classid}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Main Class</option>
                    {mainClasses.map((mainClass) => (
                      <option key={mainClass._id} value={mainClass._id}>
                        {mainClass.name}
                      </option>
                    ))}
                  </CFormSelect>
                  <CButton type="submit" color="primary" className="mt-3">
                    Update Sub Class
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

export default SubClassDashboard;