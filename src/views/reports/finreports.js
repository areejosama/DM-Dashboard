// src/components/FinancialDataForm.js
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
import { cilZoom, cilPencil, cilTrash, cilPlus } from '@coreui/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AddFinancialDataPage from './addreportpage'

const FinancialDataForm = () => {
  const [financialData, setFinancialData] = useState([]);
  const [finReports, setFinReports] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [visibleView, setVisibleView] = useState(false);
  const [visibleEdit, setVisibleEdit] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [editData, setEditData] = useState({ _id: '', companyid: '', FinReport_id: '' });

  const navigate = useNavigate(); // For navigation

  const TOKEN = 'arij_eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3YzIwMTAxYTJkMDU1NWQ2NDg1OGNmYyIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc0MDc2NzUwMn0.7RROT-EVMHkt40SNNkmez-ciSlnuWHIakd0ytSfb3IQ';

  useEffect(() => {
    const fetchData = async () => {
      await fetchFinReports();
      await fetchFinancialData();
      await fetchCompanies();
      await fetchReports();
    };
    fetchData();
  }, []);

  const fetchFinReports = async () => {
    try {
      const response = await axios.get('http://localhost:8000/deepmetrics/api/v1/mainclass/finRepo', { headers: { token: TOKEN } });
      console.log('Fin Reports (All Reports - Full):', JSON.stringify(response.data.data, null, 2));
      setFinReports(response.data.data || []);
    } catch (err) {
      console.error('Error fetching finReports:', err);
      setError('Failed to load financial reports');
      setFinReports([]);
    }
  };

  const fetchFinancialData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8000/deepmetrics/api/v1/mainclass/finData', { headers: { token: TOKEN } });
      console.log('Financial Data (Table Data - Full):', JSON.stringify(response.data.data, null, 2));
      setFinancialData(response.data.data || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching financial data:', err);
      setError('Failed to load financial data');
      setFinancialData([]);
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const response = await axios.get('http://localhost:8000/deepmetrics/api/v1/company', { headers: { token: TOKEN } });
      console.log('Companies Response:', JSON.stringify(response.data, null, 2));
      const companiesData = response.data.data || [];
      setCompanies(companiesData);
      console.log('Companies State:', JSON.stringify(companiesData, null, 2));
    } catch (err) {
      console.error('Error fetching companies:', err);
      setError('Failed to fetch companies');
    }
  };

  const fetchReports = async () => {
    try {
      const response = await axios.get('http://localhost:8000/deepmetrics/api/v1/mainclass/finData', { headers: { token: TOKEN } });
      console.log('Reports Response:', JSON.stringify(response.data.data, null, 2));
      setReports(response.data.data || []);
    } catch (err) {
      console.error('Error fetching reports:', err);
    }
  };

  const handleViewReport = (data) => {
    const report = finReports.find(r => r.FinReport_id?._id === data._id);
    setSelectedReport(report);
    setVisibleView(true);
  };

  const handleEditReport = (data) => {
    setEditData({
      _id: data._id,
      companyid: data.companyid?._id || '',
      FinReport_id: data._id || '',
    });
    setVisibleEdit(true);
  };

  const deleteFinancialRepo = async (id) => {
    if (!window.confirm('Are you sure you want to delete this financial report?')) {
      return;
    }

    try {
      console.log('Deleting financial report with ID:', id);
      const response = await axios.delete(`http://localhost:8000/deepmetrics/api/v1/mainclass/finRepo/${id}`, {
        headers: { token: TOKEN },
      });
      console.log('Delete Response:', JSON.stringify(response.data, null, 2));

      setFinReports(prevReports => prevReports.filter(report => report._id !== id));
      setFinancialData(prevData => prevData.filter(data => data._id !== id));
      
      await fetchFinReports();
      await fetchFinancialData();

      alert('Financial report deleted successfully');
    } catch (err) {
      console.error('Error deleting financial report:', err.response ? err.response.data : err.message);
      setError(`Failed to delete financial report: ${err.message}`);
    }
  };

  const handleEditSubmit = async () => {
    try {
      const response = await axios.put(`http://localhost:8000/deepmetrics/api/v1/mainclass/finRepo/${editData._id}`, editData, { headers: { token: TOKEN } });
      setFinReports(finReports.map(report => (report._id === editData._id ? response.data.data : report)));
      setFinancialData(financialData.map(data => (data._id === editData._id ? response.data.data : data)));
      setVisibleEdit(false);
      alert('Edited successfully');
    } catch (err) {
      console.error('Error editing report:', err);
      setError('Failed to edit data');
    }
  };

  if (loading && financialData.length === 0) {
    return <div>Loading...</div>;
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Financial Data Dashboard</strong>
            <CButton color="success" size="sm" onClick={() => navigate('/reports/addreportpage')} className="float-end">
              <CIcon icon={cilPlus} /> Add Data
            </CButton>
          </CCardHeader>
          <CCardBody>
            {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
            <CTable>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell scope="col">#</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Company</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Created At</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Actions</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {financialData.length > 0 ? (
                  financialData.map((data, index) => (
                    <CTableRow key={data._id}>
                      <CTableHeaderCell scope="row">{index + 1}</CTableHeaderCell>
                      <CTableDataCell>{data.companyid?.name || 'Unknown'}</CTableDataCell>
                      <CTableDataCell>{new Date(data.createdAt).toLocaleDateString()}</CTableDataCell>
                      <CTableDataCell>
                        <CButton color="info" size="sm" onClick={() => handleViewReport(data)} className="me-2">
                          <CIcon icon={cilZoom} />
                        </CButton>
                        <CButton color="warning" size="sm" onClick={() => handleEditReport(data)} className="me-2">
                          <CIcon icon={cilPencil} />
                        </CButton>
                        <CButton color="danger" size="sm" onClick={() => deleteFinancialRepo(data._id)}>
                          <CIcon icon={cilTrash} />
                        </CButton>
                      </CTableDataCell>
                    </CTableRow>
                  ))
                ) : (
                  <CTableRow>
                    <CTableDataCell colSpan="4">No Financial Data available.</CTableDataCell>
                  </CTableRow>
                )}
              </CTableBody>
            </CTable>

            {/* View Modal */}
            <CModal visible={visibleView} onClose={() => setVisibleView(false)} size="xl">
              <CModalHeader>
                <CModalTitle>Full Financial Report</CModalTitle>
              </CModalHeader>
              <CModalBody>
                {selectedReport ? (
                  <div>
                    <h5>Company Name: {selectedReport.companyid?.name || 'Unknown'}</h5>
                    <p>
                      Report: {selectedReport.FinReport_id?.reportYear || 'Unknown'} -{' '}
                      {selectedReport.FinReport_id?.period || 'Unknown'}
                    </p>
                    {selectedReport.allclasses && selectedReport.allclasses.length > 0 ? (
                      selectedReport.allclasses.map((classItem, classIndex) => (
                        <div key={classIndex} style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ddd' }}>
                          <p>{classItem.subclassid?.subclass || 'None'}</p>
                          <p>{classItem.subsubclassid?.subsubclass || 'None'}</p>
                          {classItem.accounts && classItem.accounts.length > 0 ? (
                            classItem.accounts.map((account, accountIndex) => (
                              <div key={accountIndex} style={{ marginLeft: '20px', padding: '10px', border: '1px dashed #ccc' }}>
                                {account.finaldata && account.finaldata.length > 0 ? (
                                  account.finaldata.map((finaldata, finaldataIndex) => (
                                    <div key={finaldataIndex} style={{ marginLeft: '20px' }}>
                                      <h6>
                                        {finaldata.subaccountid?.subaccount || 'None'} - Amount: {finaldata.amount || 'N/A'}
                                      </h6>
                                    </div>
                                  ))
                                ) : (
                                  <p>No final data available.</p>
                                )}
                              </div>
                            ))
                          ) : (
                            <p>No accounts available.</p>
                          )}
                        </div>
                      ))
                    ) : (
                      <p>No classes available.</p>
                    )}
                  </div>
                ) : (
                  <p>No matching report found in finReports.</p>
                )}
              </CModalBody>
              <CModalFooter>
                <CButton color="secondary" onClick={() => setVisibleView(false)}>Close</CButton>
              </CModalFooter>
            </CModal>

            {/* Edit Modal */}
            <CModal visible={visibleEdit} onClose={() => setVisibleEdit(false)}>
              <CModalHeader>
                <CModalTitle>Edit Financial Data</CModalTitle>
              </CModalHeader>
              <CModalBody>
                <CForm>
                  <CFormInput
                    type="text"
                    label="Company ID"
                    value={editData.companyid}
                    onChange={(e) => setEditData({ ...editData, companyid: e.target.value })}
                    placeholder="Enter company ID"
                  />
                  <CFormInput
                    type="text"
                    label="Financial Report ID"
                    value={editData.FinReport_id}
                    onChange={(e) => setEditData({ ...editData, FinReport_id: e.target.value })}
                    placeholder="Enter financial report ID"
                  />
                </CForm>
              </CModalBody>
              <CModalFooter>
                <CButton color="secondary" onClick={() => setVisibleEdit(false)}>Cancel</CButton>
                <CButton color="primary" onClick={handleEditSubmit}>Save Changes</CButton>
              </CModalFooter>
            </CModal>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  );
};

export default FinancialDataForm;