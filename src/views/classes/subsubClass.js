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

const SubSubClassDashboard = () => {
  const [subSubClasses, setSubSubClasses] = useState([]);
  const [subClasses, setSubClasses] = useState([]);
  const [sectors, setSectors] = useState([]); // State جديد لتخزين الـ Sectors
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [visibleAddSubSub, setVisibleAddSubSub] = useState(false);
  const [visibleEditSubSub, setVisibleEditSubSub] = useState(false);
  const [formData, setFormData] = useState({ subsubclass: '', subclassid: '', sectorid: '' });
  const [editId, setEditId] = useState(null);

  const TOKEN = 'arij_eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3ZWRhMDViZDMwMDA5YzMzYzVmMjA1NSIsInJvbGUiOiJtYW5hZ2VyIiwiaWF0IjoxNzQzNjI3NjQxfQ.M5naIsuddc3UZ7Oe7ZTfABdZVYQyw_i-80MU4daCoZE';

  useEffect(() => {
    fetchSectors();
    fetchSubClasses();
    fetchSubSubClasses();
  }, []);

  const fetchSubClasses = async () => {
    try {
      const response = await axios.get('https://deepmetrics-be.onrender.com/deepmetrics/api/v1/mainclass/subclass', {
        headers: { token: TOKEN },
      });
      const subClassesData = response.data.data || response.data;
      if (Array.isArray(subClassesData)) {
        setSubClasses(subClassesData.map(item => ({
          _id: item._id,
          name: item.subclass,
        })));
      } else {
        setSubClasses([]);
      }
    } catch (err) {
      console.error('Error fetching Sub Classes:', err.response ? err.response.data : err.message);
      setError('Failed to load Sub Classes');
    }
  };

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
      setLoading(true);
      console.log('Fetching Sub Sub Classes with Token:', TOKEN);
      const response = await axios.get('https://deepmetrics-be.onrender.com/deepmetrics/api/v1/mainclass/sub2class', {
        headers: { token: TOKEN },
      });
      const subSubClassesData = response.data.data || response.data;
      console.log('Raw API Response:', subSubClassesData);
      if (Array.isArray(subSubClassesData)) {
        const formattedSubSubClasses = subSubClassesData.map((item, index) => ({
          _id: item._id || `item_${index}`,
          subsubclass: item.subsubclass,
          subclassid: item.subclassid?._id || item.subclassid,
          sectorid: item.sectorid?._id || item.sectorid,
          sectorName: item.sectorid?.Sector || 'Unknown', // الاعتماد على الـ Sector من الـ Response فقط
        }));
        setSubSubClasses(formattedSubSubClasses);
      } else {
        setSubSubClasses([]);
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching Sub Sub Classes:', err.response ? err.response.data : err.message);
      setError('Failed to load Sub Sub Classes, try again later');
      setSubSubClasses([]);
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    console.log('Input Change:', { name, value });
  };

  const handleAddSubSubOpen = () => {
    console.log('Opening Add Sub Sub Class Modal');
    setFormData({ subsubclass: '', subclassid: '', sectorid: '' });
    setVisibleAddSubSub(true);
  };

  const handleEditSubSubOpen = (subSubClassId) => {
    const subSubClass = subSubClasses.find((s) => s._id === subSubClassId);
    if (subSubClass) {
      console.log('Editing Sub Sub Class:', subSubClass);
      setEditId(subSubClassId);
      setFormData({ 
        subsubclass: subSubClass.subsubclass, 
        subclassid: subSubClass.subclassid, 
        sectorid: subSubClass.sectorid || '' 
      });
      setVisibleEditSubSub(true);
    } else {
      console.error('Sub Sub Class not found for ID:', subSubClassId);
      setError('Sub Sub Class not found');
    }
  };

  const handleCreateSubSub = async (e) => {
    e.preventDefault();
    console.log('Form Data before validation:', formData);
    if (!formData.subsubclass.trim() || !formData.subclassid || !formData.sectorid) {
      setError('Sub Sub Class name, Sub Class, and Sector are required');
      return;
    }
    try {
      const payload = { 
        subsubclass: formData.subsubclass.trim(), 
        subclassid: formData.subclassid,
        sectorid: formData.sectorid
      };
      console.log('Creating Sub Sub Class with Payload:', payload);
      const response = await axios.post(
        'https://deepmetrics-be.onrender.com/deepmetrics/api/v1/mainclass/subsubclass',
        payload,
        {
          headers: { 'Content-Type': 'application/json', token: TOKEN },
        }
      );
      console.log('Sub Sub Class Created - Full Response:', response.data);

      const newSubSubClass = {
        _id: response.data.data?._id || response.data._id,
        subsubclass: response.data.data?.subsubclass || formData.subsubclass.trim(),
        subclassid: response.data.data?.subclassid || formData.subclassid,
        sectorid: formData.sectorid,
        sectorName: sectors.find(s => s._id === formData.sectorid)?.name || 'Unknown',
      };

      setSubSubClasses([...subSubClasses, newSubSubClass]);
      setSuccess('Sub Sub Class added successfully!');
      setVisibleAddSubSub(false);
      setFormData({ subsubclass: '', subclassid: '', sectorid: '' });
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error adding Sub Sub Class:', err.response ? err.response.data : err.message);
      if (err.response?.data?.message === 'Subsubclass already exists') {
        setError('A Sub Sub Class with this name already exists');
      } else if (err.response?.data?.message === 'Subclass not found') {
        setError('Selected Sub Class not found');
      } else if (err.response?.data?.message === 'Sector not found') {
        setError('Selected Sector not found');
      } else if (err.response?.data?.message === 'Validation Error') {
        setError('Invalid data sent. Check the fields and try again.');
      } else {
        setError('Failed to add Sub Sub Class, try again later');
      }
    }
  };

  const handleUpdateSubSub = async (e) => {
    e.preventDefault();
    console.log('Form Data before validation:', formData);
    if (!editId) {
      setError('No Sub Sub Class selected for update');
      return;
    }
    if (!formData.subsubclass.trim() || !formData.subclassid || !formData.sectorid) {
      setError('Sub Sub Class name, Sub Class, and Sector are required');
      return;
    }
    try {
      const payload = { 
        subsubclass: formData.subsubclass.trim(), 
        subclassid: formData.subclassid,
        sectorid: formData.sectorid
      };
      console.log('Updating Sub Sub Class with Payload:', payload, 'ID:', editId);
      const response = await axios.put(
        `https://deepmetrics-be.onrender.com/deepmetrics/api/v1/mainclass/sub2class/${editId}`,
        payload,
        {
          headers: { 'Content-Type': 'application/json', token: TOKEN },
        }
      );
      console.log('Sub Sub Class Updated:', response.data);

      const updatedSubSubClass = response.data.data || {
        _id: editId,
        subsubclass: formData.subsubclass.trim(),
        subclassid: formData.subclassid,
        sectorid: formData.sectorid,
        sectorName: sectors.find(s => s._id === formData.sectorid)?.name || 'Unknown',
      };
      setSubSubClasses(
        subSubClasses.map((s) =>
          s._id === editId
            ? { 
                ...s, 
                subsubclass: updatedSubSubClass.subsubclass, 
                subclassid: updatedSubSubClass.subclassid,
                sectorid: updatedSubSubClass.sectorid,
                sectorName: updatedSubSubClass.sectorName
              }
            : s
        )
      );
      setSuccess('Sub Sub Class updated successfully!');
      setVisibleEditSubSub(false);
      setFormData({ subsubclass: '', subclassid: '', sectorid: '' });
      setEditId(null);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error updating Sub Sub Class:', err.response ? err.response.data : err.message);
      if (err.response?.data?.message === 'Subsubclass already exists') {
        setError('A Sub Sub Class with this name already exists');
      } else if (err.response?.data?.message === 'Subclass not found') {
        setError('Selected Sub Class not found');
      } else if (err.response?.data?.message === 'Sector not found') {
        setError('Selected Sector not found');
      } else if (err.response?.data?.message === 'Subsubclass not found') {
        setError('Sub Sub Class not found');
      } else {
        setError('Failed to update Sub Sub Class, try again later');
      }
    }
  };

  const handleDeleteSubSub = async (subSubClassId) => {
    if (window.confirm('Are you sure you want to delete this Sub Sub Class?')) {
      try {
        console.log('Deleting Sub Sub Class with ID:', subSubClassId);
        await axios.delete(`https://deepmetrics-be.onrender.com/deepmetrics/api/v1/mainclass/sub2class/${subSubClassId}`, {
          headers: { token: TOKEN },
        });
        setSubSubClasses(subSubClasses.filter((s) => s._id !== subSubClassId));
        setSuccess('Sub Sub Class deleted successfully!');
        setTimeout(() => setSuccess(null), 3000);
      } catch (err) {
        console.error('Error deleting Sub Sub Class:', err.response ? err.response.data : err.message);
        setError('Failed to delete Sub Sub Class, try again later');
      }
    }
  };

  if (loading) {
    return (
      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardHeader>
              <CButton color="primary" className="float-end" onClick={handleAddSubSubOpen}>
                Add Sub Sub Class
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
              <CButton color="primary" className="float-end" onClick={handleAddSubSubOpen}>
                Add Sub Sub Class
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
            <CButton color="primary" className="float-end" onClick={handleAddSubSubOpen}>
              <CIcon icon={cilPlus} /> Add Sub Sub Class
            </CButton>
          </CCardHeader>
          <CCardBody>
            {success && <div style={{ color: 'green', marginBottom: '10px' }}>{success}</div>}
            <CTable>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell scope="col">#</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Sub Sub Class</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Sector</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Action</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {Array.isArray(subSubClasses) && subSubClasses.length > 0 ? (
                  subSubClasses.map((subSubClass, index) => (
                    <CTableRow key={subSubClass._id}>
                      <CTableHeaderCell scope="row">{index + 1}</CTableHeaderCell>
                      <CTableDataCell>{subSubClass.subsubclass}</CTableDataCell>
                      <CTableDataCell>{subSubClass.sectorName}</CTableDataCell>
                      <CTableHeaderCell>
                        <CButton
                          color="warning"
                          size="sm"
                          className="me-2"
                          onClick={() => handleEditSubSubOpen(subSubClass._id)}
                        >
                          <CIcon icon={cilPencil} />
                        </CButton>
                        <CButton
                          color="danger"
                          size="sm"
                          onClick={() => handleDeleteSubSub(subSubClass._id)}
                        >
                          <CIcon icon={cilTrash} />
                        </CButton>
                      </CTableHeaderCell>
                    </CTableRow>
                  ))
                ) : (
                  <CTableRow>
                    <CTableDataCell colSpan="4">No Sub Sub Classes available.</CTableDataCell>
                  </CTableRow>
                )}
              </CTableBody>
            </CTable>

            <CModal visible={visibleAddSubSub} onClose={() => setVisibleAddSubSub(false)}>
              <CModalHeader>
                <CModalTitle>Add Sub Sub Class</CModalTitle>
              </CModalHeader>
              <CModalBody>
                <CForm onSubmit={handleCreateSubSub}>
                  <CFormInput
                    type="text"
                    name="subsubclass"
                    label="Sub Sub Class Name"
                    value={formData.subsubclass}
                    onChange={handleInputChange}
                    required
                  />
                  <CFormSelect
                    name="subclassid"
                    label="Sub Class"
                    value={formData.subclassid}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Sub Class</option>
                    {subClasses.map((subClass) => (
                      <option key={subClass._id} value={subClass._id}>
                        {subClass.name}
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
                    Save Sub Sub Class
                  </CButton>
                </CForm>
              </CModalBody>
              <CModalFooter>
                <CButton color="secondary" onClick={() => setVisibleAddSubSub(false)}>
                  Close
                </CButton>
              </CModalFooter>
            </CModal>

            <CModal visible={visibleEditSubSub} onClose={() => setVisibleEditSubSub(false)}>
              <CModalHeader>
                <CModalTitle>Edit Sub Sub Class</CModalTitle>
              </CModalHeader>
              <CModalBody>
                <CForm onSubmit={handleUpdateSubSub}>
                  <CFormInput
                    type="text"
                    name="subsubclass"
                    label="Sub Sub Class Name"
                    value={formData.subsubclass}
                    onChange={handleInputChange}
                    required
                  />
                  <CFormSelect
                    name="subclassid"
                    label="Sub Class"
                    value={formData.subclassid}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Sub Class</option>
                    {subClasses.map((subClass) => (
                      <option key={subClass._id} value={subClass._id}>
                        {subClass.name}
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
                    Update Sub Sub Class
                  </CButton>
                </CForm>
              </CModalBody>
              <CModalFooter>
                <CButton color="secondary" onClick={() => setVisibleEditSubSub(false)}>
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

export default SubSubClassDashboard;