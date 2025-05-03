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
import { cilZoom, cilPencil, cilTrash, cilPlus } from '@coreui/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AddFinancialDataPage from './addreportpage';

const FinancialDataForm = () => {
  const [financialData, setFinancialData] = useState([]);
  const [finReports, setFinReports] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [reports, setReports] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subClasses, setSubClasses] = useState([]);
  const [subSubClasses, setSubSubClasses] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [subAccounts, setSubAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [visibleView, setVisibleView] = useState(false);
  const [visibleEdit, setVisibleEdit] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [editData, setEditData] = useState({ _id: '', companyid: '', FinReport_id: '', allclasses: [] });

  const navigate = useNavigate();

  const TOKEN = 'arij_eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3ZWRhMDViZDMwMDA5YzMzYzVmMjA1NSIsInJvbGUiOiJtYW5hZ2VyIiwiaWF0IjoxNzQzNjI3NjQxfQ.M5naIsuddc3UZ7Oe7ZTfABdZVYQyw_i-80MU4daCoZE';

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
      const response = await axios.get('https://deepmetrics-be.onrender.com/deepmetrics/api/v1/mainclass/finRepo', {
        headers: { token: TOKEN },
      });
      console.log('Fin Reports (All Reports - Full):', JSON.stringify(response.data.data, null, 2));
      const formattedReports = (response.data.data || []).map(report => ({
        ...report,
        _id: report._id || report.FinReport_id?._id || 'Unknown',
        reportYear: report.reportYear || report.FinReport_id?.reportYear || 'Unknown',
        period: report.period || report.FinReport_id?.period || 'Unknown',
      }));
      setFinReports(formattedReports);

      // استخراج الـ classes, subclasses, subsubclasses, accounts, subaccounts
      const allClasses = [];
      const allSubClasses = [];
      const allSubSubClasses = [];
      const allAccounts = [];
      const allSubAccounts = [];

      formattedReports.forEach(report => {
        report.allclasses.forEach(cls => {
          // Classes
          if (cls.classid && !allClasses.some(c => c._id === cls.classid._id)) {
            allClasses.push(cls.classid);
          }
          // Sub Classes
          if (cls.subclassid && !allSubClasses.some(sc => sc._id === cls.subclassid._id)) {
            allSubClasses.push(cls.subclassid);
          }
          // Sub Sub Classes
          if (cls.subsubclassid && !allSubSubClasses.some(ssc => ssc._id === cls.subsubclassid._id)) {
            allSubSubClasses.push(cls.subsubclassid);
          }
          // Accounts
          cls.accounts.forEach(acc => {
            if (acc.accountid && !allAccounts.some(a => a._id === acc.accountid._id)) {
              allAccounts.push(acc.accountid);
            }
            // Sub Accounts
            acc.finaldata.forEach(fd => {
              if (fd.subaccountid && !allSubAccounts.some(sa => sa._id === fd.subaccountid._id)) {
                allSubAccounts.push(fd.subaccountid);
              }
            });
          });
        });
      });

      setClasses(allClasses);
      setSubClasses(allSubClasses);
      setSubSubClasses(allSubSubClasses);
      setAccounts(allAccounts);
      setSubAccounts(allSubAccounts);

      console.log('Extracted Classes:', allClasses);
      console.log('Extracted SubClasses:', allSubClasses);
      console.log('Extracted SubSubClasses:', allSubSubClasses);
      console.log('Extracted Accounts:', allAccounts);
      console.log('Extracted SubAccounts:', allSubAccounts);
    } catch (err) {
      console.error('Error fetching finReports:', err);
      setFinReports([]);
    }
  };

  const fetchFinancialData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('https://deepmetrics-be.onrender.com/deepmetrics/api/v1/mainclass/finRepo', {
        headers: { token: TOKEN },
      });
      console.log('Financial Data (Table Data - Full):', JSON.stringify(response.data.data, null, 2));
      const formattedData = (response.data.data || []).map(data => ({
        ...data,
        companyid: typeof data.companyid === 'object' ? data.companyid : { _id: data.companyid, name: 'Unknown' },
        FinReport_id: typeof data.FinReport_id === 'object' ? data.FinReport_id : { _id: data.FinReport_id, reportYear: 'Unknown', period: 'Unknown' },
        allclasses: (data.allclasses || []).map(cls => ({
          classid: typeof cls.classid === 'object' ? cls.classid?._id || 'Unknown' : cls.classid || 'Unknown',
          subclassid: typeof cls.subclassid === 'object' ? cls.subclassid?._id || 'Unknown' : cls.subclassid || 'Unknown',
          subsubclassid: typeof cls.subsubclassid === 'object' ? cls.subsubclassid?._id || 'Unknown' : cls.subsubclassid || 'Unknown',
          accounts: (cls.accounts || []).map(acc => ({
            accountid: typeof acc.accountid === 'object' ? acc.accountid?._id || 'Unknown' : acc.accountid || 'Unknown',
            finaldata: (acc.finaldata || []).map(fd => ({
              subaccountid: typeof fd.subaccountid === 'object' ? fd.subaccountid?._id || 'Unknown' : fd.subaccountid || 'Unknown',
              amount: fd.amount || 0,
            })),
          })),
        })),
      }));
      setFinancialData(formattedData);
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
      const { data: { companies } } = await axios.get('https://deepmetrics-be.onrender.com/deepmetrics/api/v1/company', {
        headers: { token: TOKEN },
      });
      setCompanies(companies || []);
    } catch (err) {
      console.error('Error fetching companies:', err);
    }
  };

  const fetchReports = async () => {
    try {
      const response = await axios.get('https://deepmetrics-be.onrender.com/deepmetrics/api/v1/mainclass/finRepo', {
        headers: { token: TOKEN },
      });
      console.log('Reports Response:', JSON.stringify(response.data.data, null, 2));
      setReports(response.data.data || []);
    } catch (err) {
      console.error('Error fetching reports:', err);
    }
  };

  // دوال مساعدة لجلب الـ name بناءً على الـ ID
  const getClassName = (classId) => {
    const classItem = classes.find(cls => cls._id === classId);
    return classItem ? (classItem.name || classItem.class || 'Unknown') : 'Unknown';
  };

  const getSubClassName = (subClassId) => {
    const subClassItem = subClasses.find(sc => sc._id === subClassId);
    return subClassItem ? (subClassItem.subclass || 'Unknown') : 'Unknown';
  };

  const getSubSubClassName = (subSubClassId) => {
    const subSubClassItem = subSubClasses.find(ssc => ssc._id === subSubClassId);
    return subSubClassItem ? (subSubClassItem.subsubclass || 'Unknown') : 'Unknown';
  };

  const getAccountName = (accountId) => {
    const accountItem = accounts.find(acc => acc._id === accountId);
    return accountItem ? (accountItem.account || 'Unknown') : 'Unknown';
  };

  const getSubAccountName = (subAccountId) => {
    const subAccountItem = subAccounts.find(sa => sa._id === subAccountId);
    return subAccountItem ? (subAccountItem.subaccount || 'Unknown') : 'Unknown';
  };

  const handleViewReport = (data) => {
    const report = financialData.find(r => r._id === data._id);
    setSelectedReport(report);
    setVisibleView(true);
  };

  const handleEditReport = (data) => {
    setEditData({
      _id: data._id,
      companyid: data.companyid?._id || '',
      FinReport_id: data.FinReport_id?._id || data.FinReport_id || '',
      allclasses: data.allclasses || [],
    });
    setVisibleEdit(true);
  };

  const deleteFinancialRepo = async (id) => {
    if (!window.confirm('Are you sure you want to delete this financial report?')) {
      return;
    }

    try {
      console.log('Deleting financial report with ID:', id);
      const response = await axios.delete(`https://deepmetrics-be.onrender.com/deepmetrics/api/v1/mainclass/finRepo/${id}`, {
        headers: { token: TOKEN },
      });
      console.log('Delete Response:', JSON.stringify(response.data, null, 2));

      setFinancialData(prevData => prevData.filter(data => data._id !== id));
      setSuccess('Financial report deleted successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error deleting financial report:', err.response ? err.response.data : err.message);
      setError(`Failed to delete financial report: ${err.message}`);
    }
  };

  const handleEditSubmit = async () => {
    try {
      const payload = {
        allclasses: editData.allclasses,
        companyId: editData.companyid,
      };
      const response = await axios.put(
        `https://deepmetrics-be.onrender.com/deepmetrics/api/v1/mainclass/finRepo/${editData.FinReport_id}`,
        payload,
        { headers: { token: TOKEN } }
      );
      setFinancialData(financialData.map(data => (data._id === editData._id ? response.data.data : data)));
      setSuccess('Edited successfully');
      setVisibleEdit(false);
      setTimeout(() => setSuccess(null), 3000);
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
            {success && <div style={{ color: 'green', marginBottom: '10px' }}>{success}</div>}
            <CTable>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell scope="col">#</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Company</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Created At</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Period - Report Year</CTableHeaderCell>
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
                        {data.FinReport_id?.period || 'Unknown'} - {data.FinReport_id?.reportYear || 'Unknown'}
                      </CTableDataCell>
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
                    <CTableDataCell colSpan="5">No Financial Data available.</CTableDataCell>
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
                          <p>{getSubClassName(classItem.subclassid) || 'None'}</p>
                          <p>{getSubSubClassName(classItem.subsubclassid) || 'None'}</p>
                          {classItem.accounts && classItem.accounts.length > 0 ? (
                            classItem.accounts.map((account, accountIndex) => (
                              <div key={accountIndex} style={{ marginLeft: '20px', padding: '10px', border: '1px dashed #ccc' }}>
                                {account.finaldata && account.finaldata.length > 0 ? (
                                  account.finaldata.map((finaldata, finaldataIndex) => (
                                    <div key={finaldataIndex} style={{ marginLeft: '20px' }}>
                                      <h6>
                                        {getSubAccountName(finaldata.subaccountid) || 'None'} - Amount: {finaldata.amount || 'N/A'}
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
                  <p>No matching report found.</p>
                )}
              </CModalBody>
              <CModalFooter>
                <CButton color="secondary" onClick={() => setVisibleView(false)}>Close</CButton>
              </CModalFooter>
            </CModal>

            {/* Edit Modal */}
            <CModal visible={visibleEdit} onClose={() => setVisibleEdit(false)} size="lg">
              <CModalHeader>
                <CModalTitle>Edit Financial Data</CModalTitle>
              </CModalHeader>
              <CModalBody>
                <CForm>
                  <CFormSelect
                    label="Company"
                    value={editData.companyid}
                    onChange={(e) => setEditData({ ...editData, companyid: e.target.value })}
                    required
                  >
                    <option value="">Select Company</option>
                    {companies.map((company) => (
                      <option key={company._id} value={company._id}>
                        {company.name}
                      </option>
                    ))}
                  </CFormSelect>
                  <CFormSelect
                    label="Financial Report"
                    value={editData.FinReport_id}
                    onChange={(e) => setEditData({ ...editData, FinReport_id: e.target.value })}
                    required
                  >
                    <option value="">Select Financial Report</option>
                    {finReports.map((report) => (
                      <option key={report._id} value={report._id}>
                        {report.reportYear} - {report.period}
                      </option>
                    ))}
                  </CFormSelect>
                  {/* عرض وتعديل allclasses */}
                  {editData.allclasses.map((classItem, classIndex) => (
                    <div key={classIndex} style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ddd' }}>
                      <h6>Class {classIndex + 1}</h6>
                      <CFormSelect
                        label="Class ID"
                        value={classItem.classid || ''}
                        onChange={(e) => {
                          const updatedClasses = [...editData.allclasses];
                          updatedClasses[classIndex].classid = e.target.value;
                          setEditData({ ...editData, allclasses: updatedClasses });
                        }}
                      >
                        <option value="">Select Class</option>
                        {classes.map((cls) => (
                          <option key={cls._id} value={cls._id}>
                            {cls.name || cls.class || 'Unknown'}
                          </option>
                        ))}
                      </CFormSelect>
                      <CFormSelect
                        label="Sub Class ID"
                        value={classItem.subclassid || ''}
                        onChange={(e) => {
                          const updatedClasses = [...editData.allclasses];
                          updatedClasses[classIndex].subclassid = e.target.value;
                          setEditData({ ...editData, allclasses: updatedClasses });
                        }}
                      >
                        <option value="">Select Sub Class</option>
                        {subClasses.map((subCls) => (
                          <option key={subCls._id} value={subCls._id}>
                            {subCls.subclass || 'Unknown'}
                          </option>
                        ))}
                      </CFormSelect>
                      <CFormSelect
                        label="Sub Sub Class ID"
                        value={classItem.subsubclassid || ''}
                        onChange={(e) => {
                          const updatedClasses = [...editData.allclasses];
                          updatedClasses[classIndex].subsubclassid = e.target.value;
                          setEditData({ ...editData, allclasses: updatedClasses });
                        }}
                      >
                        <option value="">Select Sub Sub Class</option>
                        {subSubClasses.map((subSubCls) => (
                          <option key={subSubCls._id} value={subSubCls._id}>
                            {subSubCls.subsubclass || 'Unknown'}
                          </option>
                        ))}
                      </CFormSelect>
                      {classItem.accounts.map((account, accountIndex) => (
                        <div key={accountIndex} style={{ marginLeft: '20px', padding: '10px', border: '1px dashed #ccc' }}>
                          <CFormSelect
                            label={`Account ID ${accountIndex + 1}`}
                            value={account.accountid || ''}
                            onChange={(e) => {
                              const updatedClasses = [...editData.allclasses];
                              updatedClasses[classIndex].accounts[accountIndex].accountid = e.target.value;
                              setEditData({ ...editData, allclasses: updatedClasses });
                            }}
                          >
                            <option value="">Select Account</option>
                            {accounts.map((acc) => (
                              <option key={acc._id} value={acc._id}>
                                {acc.account || 'Unknown'}
                              </option>
                            ))}
                          </CFormSelect>
                          {account.finaldata.map((finaldata, finaldataIndex) => (
                            <div key={finaldataIndex} style={{ marginLeft: '20px' }}>
                              <CFormSelect
                                label={`Sub Account ID ${finaldataIndex + 1}`}
                                value={finaldata.subaccountid || ''}
                                onChange={(e) => {
                                  const updatedClasses = [...editData.allclasses];
                                  updatedClasses[classIndex].accounts[accountIndex].finaldata[finaldataIndex].subaccountid = e.target.value;
                                  setEditData({ ...editData, allclasses: updatedClasses });
                                }}
                              >
                                <option value="">Select Sub Account</option>
                                {subAccounts.map((subAcc) => (
                                  <option key={subAcc._id} value={subAcc._id}>
                                    {subAcc.subaccount || 'Unknown'}
                                  </option>
                                ))}
                              </CFormSelect>
                              <CFormInput
                                label={`Amount ${finaldataIndex + 1}`}
                                type="number"
                                value={finaldata.amount || ''}
                                onChange={(e) => {
                                  const updatedClasses = [...editData.allclasses];
                                  updatedClasses[classIndex].accounts[accountIndex].finaldata[finaldataIndex].amount = e.target.value;
                                  setEditData({ ...editData, allclasses: updatedClasses });
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  ))}
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