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

const FinancialDataForm = () => {
  const [financialData, setFinancialData] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [visibleAdd, setVisibleAdd] = useState(false);
  const [visibleEdit, setVisibleEdit] = useState(false);
  const [formData, setFormData] = useState({
    reportYear: '',
    period: '',
    companyid: '',
    status: '', // استبدال allclasses بـ status
  });
  const [editId, setEditId] = useState(null);

  const TOKEN = 'arij_eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3YzIwMTAxYTJkMDU1NWQ2NDg1OGNmYyIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc0MDc2NzUwMn0.7RROT-EVMHkt40SNNkmez-ciSlnuWHIakd0ytSfb3IQ';

  useEffect(() => {
    const fetchData = async () => {
      await fetchCompanies();
      await fetchFinancialData();
    };
    fetchData();
  }, []);

  const fetchCompanies = async () => {
    try {
      const response = await axios.get('https://deepmetrics-be.onrender.com/deepmetrics/api/v1/company', {
        headers: { token: TOKEN },
      });
      const companiesData = response.data.companies;
      console.log('Fetched Companies:', companiesData);
      if (Array.isArray(companiesData)) {
        const mappedCompanies = companiesData.map(item => ({
          _id: item._id,
          name: item.name,
        }));
        setCompanies(mappedCompanies);
      } else {
        setCompanies([]);
        console.warn('No companies data received');
      }
    } catch (err) {
      console.error('Error fetching companies:', err.response ? err.response.data : err.message);
      setError('Failed to load companies');
      setCompanies([]);
    }
  };

  const fetchFinancialData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('https://deepmetrics-be.onrender.com/deepmetrics/api/v1/mainclass/finData', {
        headers: { token: TOKEN },
      });
      const financialDataResponse = response.data.data || response.data;
      console.log('Raw Financial Data Response:', financialDataResponse);
      if (Array.isArray(financialDataResponse)) {
        setFinancialData(financialDataResponse);
      } else {
        setFinancialData([]);
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching Financial Data:', err.response ? err.response.data : err.message);
      setError('Failed to load Financial Data, try again later');
      setFinancialData([]);
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAddOpen = () => {
    setFormData({ reportYear: '', period: '', companyid: '', status: '' });
    setVisibleAdd(true);
  };

  const handleCreateFinancialData = async (e) => {
    e.preventDefault();
    if (!formData.reportYear || !formData.period || !formData.companyid || !formData.status) {
      setError('All fields are required');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        reportYear: formData.reportYear,
        period: formData.period,
        companyid: formData.companyid,
        status: formData.status, // إرسال status بدلاً من allclasses
      };
      await axios.post('https://deepmetrics-be.onrender.com/deepmetrics/api/v1/mainclass/finData', payload, {
        headers: { 'Content-Type': 'application/json', token: TOKEN },
      });
      setSuccess('Financial Data added successfully!');
      setVisibleAdd(false);
      setFormData({ reportYear: '', period: '', companyid: '', status: '' });
      await fetchFinancialData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error adding Financial Data:', err.response ? err.response.data : err.message);
      setError(err.response?.data?.message === 'All Fields Are Required' ? 'All fields are required' : 'Failed to add Financial Data');
    } finally {
      setLoading(false);
    }
  };

  const handleEditOpen = (data) => {
    setFormData({
      reportYear: data.reportYear,
      period: data.period,
      companyid: data.companyid._id,
      status: data.status, // تعبئة status بدلاً من allclasses
    });
    setEditId(data._id);
    setVisibleEdit(true);
  };

  const handleEditFinancialData = async (e) => {
    e.preventDefault();
    if (!formData.reportYear || !formData.period || !formData.companyid || !formData.status) {
      setError('All fields are required');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        reportYear: formData.reportYear,
        period: formData.period,
        companyid: formData.companyid,
        status: formData.status, 
      };
      await axios.put(`https://deepmetrics-be.onrender.com/deepmetrics/api/v1/mainclass/finData/${editId}`, payload, {
        headers: { 'Content-Type': 'application/json', token: TOKEN },
      });
      setSuccess('Financial Data updated successfully!');
      setVisibleEdit(false);
      setFormData({ reportYear: '', period: '', companyid: '', status: '' });
      setEditId(null);
      await fetchFinancialData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error updating Financial Data:', err.response ? err.response.data : err.message);
      setError('Failed to update Financial Data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFinancialData = async (id) => {
    if (!confirm('Are you sure you want to delete this record?')) return;
    setLoading(true);
    try {
      await axios.delete(`https://deepmetrics-be.onrender.com/deepmetrics/api/v1/mainclass/finData/${id}`, {
        headers: { token: TOKEN },
      });
      setSuccess('Financial Data deleted successfully!');
      await fetchFinancialData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error deleting Financial Data:', err.response ? err.response.data : err.message);
      setError('Failed to delete Financial Data');
    } finally {
      setLoading(false);
    }
  };

  if (loading && financialData.length === 0) {
    return (
      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardHeader>
              <strong>Financial Data Dashboard</strong>
              <CButton color="primary" className="float-end" onClick={handleAddOpen} disabled={loading}>
                Add Financial Data
              </CButton>
            </CCardHeader>
            <CCardBody>Loading...</CCardBody>
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
            <strong>Financial Data Dashboard</strong>
            <CButton color="primary" className="float-end" onClick={handleAddOpen} disabled={loading}>
              <CIcon icon={cilPlus} /> Add Financial Data
            </CButton>
          </CCardHeader>
          <CCardBody>
            {success && <div style={{ color: 'green', marginBottom: '10px' }}>{success}</div>}
            {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
            <CTable>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell scope="col">#</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Report Year</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Period</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Company</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Status</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Actions</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {financialData.length > 0 ? (
                  financialData.map((data, index) => (
                    <CTableRow key={data._id}>
                      <CTableHeaderCell scope="row">{index + 1}</CTableHeaderCell>
                      <CTableDataCell>{data.reportYear}</CTableDataCell>
                      <CTableDataCell>{data.period}</CTableDataCell>
                      <CTableDataCell>{data.companyid?.name || 'Unknown Company'}</CTableDataCell>
                      <CTableDataCell>{data.status}</CTableDataCell>
                      <CTableDataCell>
                        <CButton color="warning" size="sm" className="me-2" onClick={() => handleEditOpen(data)}>
                          <CIcon icon={cilPencil} />
                        </CButton>
                        <CButton color="danger" size="sm" onClick={() => handleDeleteFinancialData(data._id)}>
                          <CIcon icon={cilTrash} />
                        </CButton>
                      </CTableDataCell>
                    </CTableRow>
                  ))
                ) : (
                  <CTableRow>
                    <CTableDataCell colSpan="6">No Financial Data available.</CTableDataCell>
                  </CTableRow>
                )}
              </CTableBody>
            </CTable>

            {/* Modal for Adding */}
            <CModal visible={visibleAdd} onClose={() => setVisibleAdd(false)}>
              <CModalHeader>
                <CModalTitle>Add Financial Data</CModalTitle>
              </CModalHeader>
              <CModalBody>
                <CForm onSubmit={handleCreateFinancialData}>
                  <CFormInput
                    type="number"
                    name="reportYear"
                    label="Report Year"
                    value={formData.reportYear}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., 2023"
                  />
                  <CFormSelect
                    name="period"
                    label="Period"
                    value={formData.period}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Period</option>
                    <option value="Q1">Q1</option>
                    <option value="H1">H1</option>
                    <option value="9M">9M</option>
                    <option value="YTD">YTD</option>
                  </CFormSelect>
                  <CFormSelect
                    name="companyid"
                    label="Company"
                    value={formData.companyid}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Company</option>
                    {companies.length > 0 ? (
                      companies.map((company) => (
                        <option key={company._id} value={company._id}>
                          {company.name}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>No companies available</option>
                    )}
                  </CFormSelect>
                  <CFormSelect
                    name="status"
                    label="Status"
                    value={formData.status}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Status</option>
                    <option value="Draft">Draft</option>
                    <option value="Published">Published</option>
                  </CFormSelect>
                  <CButton type="submit" color="primary" className="mt-3" disabled={loading}>
                    {loading ? 'Saving...' : 'Save Financial Data'}
                  </CButton>
                </CForm>
              </CModalBody>
              <CModalFooter>
                <CButton color="secondary" onClick={() => setVisibleAdd(false)} disabled={loading}>
                  Close
                </CButton>
              </CModalFooter>
            </CModal>

            {/* Modal for Editing */}
            <CModal visible={visibleEdit} onClose={() => setVisibleEdit(false)}>
              <CModalHeader>
                <CModalTitle>Edit Financial Data</CModalTitle>
              </CModalHeader>
              <CModalBody>
                <CForm onSubmit={handleEditFinancialData}>
                  <CFormInput
                    type="number"
                    name="reportYear"
                    label="Report Year"
                    value={formData.reportYear}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., 2023"
                  />
                  <CFormSelect
                    name="period"
                    label="Period"
                    value={formData.period}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Period</option>
                    <option value="Q1">Q1</option>
                    <option value="H1">H1</option>
                    <option value="9M">9M</option>
                    <option value="QYTD">YTD</option>
                  </CFormSelect>
                  <CFormSelect
                    name="companyid"
                    label="Company"
                    value={formData.companyid}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Company</option>
                    {companies.length > 0 ? (
                      companies.map((company) => (
                        <option key={company._id} value={company._id}>
                          {company.name}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>No companies available</option>
                    )}
                  </CFormSelect>
                  <CFormSelect
                    name="status"
                    label="Status"
                    value={formData.status}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Status</option>
                    <option value="Draft">Draft</option>
                    <option value="Published">Published</option>
                  </CFormSelect>
                  <CButton type="submit" color="primary" className="mt-3" disabled={loading}>
                    {loading ? 'Updating...' : 'Update Financial Data'}
                  </CButton>
                </CForm>
              </CModalBody>
              <CModalFooter>
                <CButton color="secondary" onClick={() => setVisibleEdit(false)} disabled={loading}>
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

export default FinancialDataForm;