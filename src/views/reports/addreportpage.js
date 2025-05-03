import React, { useState, useEffect } from 'react';
import { CCard, CCardHeader, CCardBody, CCol, CRow, CForm, CFormSelect, CButton, CFormInput } from '@coreui/react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './style.css';

const AddFinancialReportPage = () => {
  const navigate = useNavigate();

  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [companySectorId, setCompanySectorId] = useState(null);
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState('');
  const [mainClasses, setMainClasses] = useState([]);
  const [selectedMainClass, setSelectedMainClass] = useState('');
  const [classesData, setClassesData] = useState({});
  const [expanded, setExpanded] = useState({});
  const [amounts, setAmounts] = useState({});
  const [selectedSubAccounts, setSelectedSubAccounts] = useState({});
  const [previousReport, setPreviousReport] = useState(null);
  const [savedData, setSavedData] = useState([]);
  const [completedMainClasses, setCompletedMainClasses] = useState([]);

  const TOKEN = 'arij_eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3ZWRhMDViZDMwMDA5YzMzYzVmMjA1NSIsInJvbGUiOiJtYW5hZ2VyIiwiaWF0IjoxNzQzNjI3NjQxfQ.M5naIsuddc3UZ7Oe7ZTfABdZVYQyw_i-80MU4daCoZE';

  useEffect(() => {
    fetchCompanies();
    fetchReports();
    fetchMainClasses();
  }, []);

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
      const { data: { data } } = await axios.get('https://deepmetrics-be.onrender.com/deepmetrics/api/v1/mainclass/finData', {
        headers: { token: TOKEN },
      });
      setReports(data || []);
    } catch (err) {
      console.error('Error fetching reports:', err);
    }
  };

  const fetchMainClasses = async () => {
    try {
      const { data: { data } } = await axios.get('https://deepmetrics-be.onrender.com/deepmetrics/api/v1/mainclass', {
        headers: { token: TOKEN },
      });
      console.log('Fetched Main Classes:', data);
      setMainClasses(data || []);
    } catch (err) {
      console.error('Error fetching main classes:', err);
      setMainClasses([]);
    }
  };

  const fetchCompanySector = async (companyId) => {
    try {
      const { data } = await axios.get(`https://deepmetrics-be.onrender.com/deepmetrics/api/v1/company`, {
        headers: { token: TOKEN },
      });
      console.log('Company Data Response:', data.companies);
      const selectedCompanyData = data.companies.find(company => company._id === companyId || company.id === companyId);
      if (!selectedCompanyData) {
        console.error('Company not found for ID:', companyId);
        setCompanySectorId(null);
        return;
      }
      const sectorId = selectedCompanyData.sectorid?._id || selectedCompanyData.sectorid;
      setCompanySectorId(sectorId || null);
      console.log('Selected Company:', selectedCompanyData);
      console.log('Company Sector ID:', sectorId);
    } catch (err) {
      console.error('Error fetching company sector:', err);
      setCompanySectorId(null);
    }
  };

  const handleCompanyChange = async (companyId) => {
    setSelectedCompany(companyId);
    setPreviousReport(null);
    setSelectedSubAccounts({});
    if (companyId) {
      await fetchCompanySector(companyId);
      await fetchPreviousReport(companyId);
    } else {
      setCompanySectorId(null);
      setPreviousReport(null);
    }
  };

  const fetchPreviousReport = async (companyId) => {
    try {
      const { data } = await axios.get(`https://deepmetrics-be.onrender.com/deepmetrics/api/v1/mainclass/finData/company/${companyId}/latest`, {
        headers: { token: TOKEN },
      });
      console.log('previousReport full response:', data);
      console.log('previousReport.allclasses:', data.data?.allclasses);
      if (data.data?.allclasses) {
        data.data.allclasses.forEach((cls, index) => {
          console.log(`previousReport.allclasses[${index}].classid:`, cls.classid);
          console.log(`previousReport.allclasses[${index}].accounts:`, cls.accounts);
        });
      } else {
        console.log('No previous report found for this company.');
      }
      setPreviousReport(data.data || null);
    } catch (err) {
      console.error('Error fetching previous report:', err);
      console.log('Setting previousReport to null due to error.');
      setPreviousReport(null);
    }
  };

  const handleMainClassChange = async (mainClassId) => {
    setSelectedMainClass(mainClassId);
    setSelectedSubAccounts({});
    if (!classesData[mainClassId]) {
      await fetchClassData(mainClassId);
    }
  };

  const fetchClassData = async (mainClassId) => {
    try {
      console.log('Fetching Class Data for mainClassId:', mainClassId);
      const { data } = await axios.get(
        `https://deepmetrics-be.onrender.com/deepmetrics/api/v1/mainclass/all/${mainClassId}`,
        {
          headers: { token: TOKEN },
        }
      );
      console.log('Class Data Response:', data);

      const classStructure = {};
      const initialAmounts = {};
      const ids = {};

      if (!data.subclasses || data.subclasses.length === 0) {
        console.log(`No subclasses for mainClassId: ${mainClassId}, checking for accounts`);
        if (data.accounts && Array.isArray(data.accounts)) {
          data.accounts.forEach(accnt => {
            const accountName = accnt.account || accnt.subaccount || accnt.name || 'Unknown';
            classStructure[accountName] = {
              [accountName]: {
                amount: accnt.amount || '',
                subaccountId: accnt._id || accnt.subaccountId || accnt.accountId,
                accountId: accnt._id || accnt.accountId || accnt.subaccountId,
              },
            };
            const key = `${mainClassId}.${accountName}`;
            initialAmounts[key] = accnt.amount || '';
            ids[`account_${accountName}`] = accnt._id || accnt.subaccountId || accnt.accountId;
            console.log(`Added account to classStructure: ${key}`);
          });
        } else {
          console.warn(`No accounts found for mainClassId: ${mainClassId}, setting empty structure`);
        }
      } else {
        data.subclasses.forEach(sub => {
          ids[`subclass_${sub.subclass}`] = sub._id;
          const subsubclasses = Array.isArray(sub.subsubclasses) ? sub.subsubclasses : [];
          classStructure[sub.subclass] = subsubclasses.reduce((acc, subsub) => {
            const sectorId = subsub.sectorid?._id || subsub.sectorid;
            console.log(`SubSubClass: ${subsub.subsubclass}, Sector ID:`, sectorId);
            ids[`subsubclass_${sub.subclass}_${subsub.subsubclass}`] = {
              id: subsub._id,
              sectorid: sectorId,
            };
            const accounts = Array.isArray(subsub.accounts) ? subsub.accounts : [];
            acc[subsub.subsubclass] = accounts.reduce((acc2, accnt) => {
              const subaccounts = Array.isArray(accnt.subaccounts) ? accnt.subaccounts : [];
              acc2[accnt.account] = subaccounts.reduce((acc3, subacc) => {
                acc3[subacc.subaccount] = {
                  amount: subacc.amount || '',
                  subaccountId: subacc._id || subacc.subaccountId,
                  accountId: accnt._id || accnt.accountId,
                };
                const key = `${mainClassId}.${sub.subclass}.${subsub.subsubclass}.${accnt.account}.${subacc.subaccount}`;
                initialAmounts[key] = subacc.amount || '';
                console.log(`Added subaccount to classStructure: ${key}`);
                return acc3;
              }, {});
              return acc2;
            }, {});
            return acc;
          }, {});
        });
      }

      setClassesData(prev => ({
        ...prev,
        [mainClassId]: { structure: classStructure, ids },
      }));
      setAmounts(prev => ({ ...prev, ...initialAmounts }));
      setExpanded(prev => ({
        ...prev,
        ...Object.keys(classStructure).reduce((acc, sub) => {
          acc[`${mainClassId}.${sub}`] = true;
          return acc;
        }, {}),
      }));
    } catch (err) {
      console.error('Error fetching class data:', err);
      console.error('Error Details:', err.response?.data);
      setClassesData(prev => ({
        ...prev,
        [mainClassId]: { structure: {}, ids: {} },
      }));
    }
  };

  const toggleExpand = (key) => {
    setExpanded(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleAmountChange = (subSubClassKey, subAccountId, value) => {
    const sanitizedValue = value === '' ? null : Number(value);
    console.log(`[handleAmountChange] Key: ${subSubClassKey}.${subAccountId}, Value: ${sanitizedValue}`);
    setAmounts(prev => {
      const updated = { ...prev, [`${subSubClassKey}.${subAccountId}`]: sanitizedValue };
      console.log('[handleAmountChange] Updated amounts:', updated);
      return updated;
    });
  };

  const handleAddSubAccount = (subSubClassKey, subAccountId) => {
    setSelectedSubAccounts(prev => {
      const currentSelections = prev[subSubClassKey] || {};
      return {
        ...prev,
        [subSubClassKey]: {
          ...currentSelections,
          [subAccountId]: true,
        },
      };
    });
  };

  const handleRemoveSubAccount = (subSubClassKey, subAccountId) => {
    setSelectedSubAccounts(prev => {
      const currentSelections = prev[subSubClassKey] || {};
      const { [subAccountId]: _, ...rest } = currentSelections;
      return {
        ...prev,
        [subSubClassKey]: rest,
      };
    });
    setAmounts(prev => {
      const updated = { ...prev };
      delete updated[`${subSubClassKey}.${subAccountId}`];
      return updated;
    });
  };

  const calculateSubClassTotal = (subClassData, subClassKey, mainClassId) => {
    let currentTotal = 0;
    let previousTotal = 0;

    const calculate = (items, prefix) => {
      Object.entries(items).forEach(([key, value]) => {
        const currentKey = prefix ? `${prefix}.${key}` : `${subClassKey}.${key}`;
        const isLeaf = !Object.keys(value).some(k => typeof value[k] === 'object' && !value[k].amount);
        if (!isLeaf) {
          const subSubClassKey = currentKey;
          const selections = selectedSubAccounts[subSubClassKey] || {};
          Object.keys(selections).forEach(selectedSubAccountId => {
            if (selectedSubAccountId) {
              const subAccountKey = `${subSubClassKey}.${selectedSubAccountId}`;
              const currentAmount = Number(amounts[subAccountKey]) || 0;
              currentTotal += currentAmount;
              console.log(`[calculateSubClassTotal] Adding ${subAccountKey}: ${currentAmount} to currentTotal=${currentTotal}`);

              const matchingClass = previousReport?.allclasses?.find(cls => cls.classid?._id === mainClassId);
              const matchingAccount = matchingClass?.accounts?.find(acc =>
                acc.finaldata?.some(fd => {
                  const subaccountIdToCompare = typeof fd.subaccountid === 'object' ? fd.subaccountid?._id || fd.subaccountid?.id : fd.subaccountid;
                  return subaccountIdToCompare === selectedSubAccountId;
                })
              );
              const matchingFinalData = matchingAccount?.finaldata?.find(fd => {
                const subaccountIdToCompare = typeof fd.subaccountid === 'object' ? fd.subaccountid?._id || fd.subaccountid?.id : fd.subaccountid;
                return subaccountIdToCompare === selectedSubAccountId;
              });
              const prevAmount = matchingFinalData?.amount ?? 0;
              previousTotal += prevAmount;
              console.log(`[calculateSubClassTotal] Adding ${subAccountKey}: ${prevAmount} to previousTotal=${previousTotal}`);
            }
          });
        }
        if (Object.keys(value).some(k => typeof value[k] === 'object')) {
          calculate(value, currentKey);
        }
      });
    };

    calculate(subClassData, '');
    console.log(`[calculateSubClassTotal] Final for ${subClassKey}: currentTotal=${currentTotal}, previousTotal=${previousTotal}`);
    return { currentTotal, previousTotal };
  };

  const renderTree = (items, prefix = '') => {
    return Object.entries(items).map(([key, value]) => {
      const currentKey = prefix ? `${prefix}.${key}` : `${selectedMainClass}.${key}`;
      const isSubClass = prefix === '';
      const isSubSubClass = !isSubClass && Object.keys(value).some(k => typeof value[k] === 'object' && Object.keys(value[k]).some(sk => typeof value[k][sk] === 'object' && !value[k][sk].amount));
      const isAccountLevel = !isSubClass && !isSubSubClass && Object.keys(value).some(k => typeof value[k] === 'object' && Object.keys(value[k]).every(sk => !Object.keys(value[k][sk]).some(ssk => typeof value[k][sk][ssk] === 'object')));
      const isLeaf = !isSubClass && !isSubSubClass && !isAccountLevel;

      if (isSubClass) {
        const { currentTotal, previousTotal } = calculateSubClassTotal(value, currentKey, selectedMainClass);

        return (
          <div key={currentKey} className="class-item">
            <button onClick={() => toggleExpand(currentKey)} className="expand-btn">
              {expanded[currentKey] ? '▼' : '▶'} {key}
            </button>
            {expanded[currentKey] && (
              <div style={{ marginLeft: '15px' }}>
                {renderTree(value, currentKey)}
                <div className="table-row total-row">
                  <span className="table-cell sub-account-name">
                    <strong>Total:</strong>
                  </span>
                  <span className="table-cell previous-report" data-label="Previous Report:">
                    {previousTotal !== 0 ? previousTotal : '-'}
                  </span>
                  <span className="table-cell current-report" data-label="Current Report:">
                    {currentTotal !== 0 ? currentTotal : '-'}
                  </span>
                  <span className="table-cell action"></span>
                </div>
              </div>
            )}
          </div>
        );
      }

      if (isSubSubClass) {
        const subSubClassKey = currentKey;
        const subAccounts = [];
        const collectSubAccounts = (accounts) => {
          Object.entries(accounts).forEach(([account, subaccounts]) => {
            Object.entries(subaccounts).forEach(([subaccount, data]) => {
              subAccounts.push({ name: subaccount, subaccountId: data.subaccountId, accountId: data.accountId });
            });
          });
        };
        collectSubAccounts(value);

        const selections = selectedSubAccounts[subSubClassKey] || {};

        return (
          <div key={currentKey} className="class-item sub-sub-class">
            <button onClick={() => toggleExpand(currentKey)} className="expand-btn">
              {expanded[currentKey] ? '▼' : '▶'} {key}
            </button>
            {expanded[currentKey] && (
              <div style={{ marginLeft: '15px', padding: '15px 0' }}>
                <div className="add-sub-account">
                  <CFormSelect
                    value=""
                    onChange={(e) => handleAddSubAccount(subSubClassKey, e.target.value)}
                    className="sub-account-select"
                  >
                    <option value=""> Sub-Account...</option>
                    {subAccounts
                      .filter(subAcc => !selections[subAcc.subaccountId])
                      .map(subAcc => (
                        <option key={subAcc.subaccountId} value={subAcc.subaccountId}>
                          {subAcc.name}
                        </option>
                      ))}
                  </CFormSelect>
                </div>
                {Object.keys(selections).length > 0 && (
                  <div className="sub-account-table">
                    <div className="table-header table-row">
                      <span className="table-cell sub-account-header">Sub-Account</span>
                      <span className="table-cell previous-report-header">Previous Report</span>
                      <span className="table-cell current-report-header">Current Report</span>
                      <span className="table-cell action-header">Action</span>
                    </div>
                    {Object.keys(selections).map(subAccountId => {
                      const subAcc = subAccounts.find(sa => sa.subaccountId === subAccountId);
                      let previousAmount = 0;
                      if (subAcc) {
                        const matchingClass = previousReport?.allclasses?.find(cls => cls.classid?._id === selectedMainClass);
                        const matchingAccount = matchingClass?.accounts?.find(acc =>
                          acc.finaldata?.some(fd => {
                            const subaccountIdToCompare = typeof fd.subaccountid === 'object' ? fd.subaccountid?._id || fd.subaccountid?.id : fd.subaccountid;
                            return subaccountIdToCompare === subAccountId;
                          })
                        );
                        const matchingFinalData = matchingAccount?.finaldata?.find(fd => {
                          const subaccountIdToCompare = typeof fd.subaccountid === 'object' ? fd.subaccountid?._id || fd.subaccountid?.id : fd.subaccountid;
                          return subaccountIdToCompare === subAccountId;
                        });
                        previousAmount = matchingFinalData?.amount ?? 0;
                      }

                      return (
                        <div key={`${subSubClassKey}_${subAccountId}`} className="table-row sub-account-row">
                          <span className="table-cell sub-account-name">{subAcc?.name || 'Unknown'}</span>
                          <span className="table-cell previous-report" data-label="Previous Report:">
                            {previousAmount !== 0 ? previousAmount : '-'}
                          </span>
                          <span className="table-cell current-report" data-label="Current Report:">
                            <CFormInput
                              type="number"
                              value={amounts[`${subSubClassKey}.${subAccountId}`] || ''}
                              onChange={(e) => handleAmountChange(subSubClassKey, subAccountId, e.target.value)}
                              className="amount-input"
                            />
                          </span>
                          <span className="table-cell action">
                            <CButton
                              color="danger"
                              size="sm"
                              onClick={() => handleRemoveSubAccount(subSubClassKey, subAccountId)}
                              className="delete-btn"
                            >
                              Delete
                            </CButton>
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
                <hr className="divider" />
              </div>
            )}
          </div>
        );
      }

      if (isAccountLevel || isLeaf) {
        return null;
      }

      return null;
    });
  };

  const saveMainClassData = () => {
    const classData = {
      classid: selectedMainClass,
      accounts: [],
      subclassid: undefined,
      subsubclassid: undefined,
    };

    const structure = classesData[selectedMainClass]?.structure || {};
    Object.entries(structure).forEach(([subClass, subSubClasses]) => {
      Object.entries(subSubClasses).forEach(([subSubClass, accounts]) => {
        const subSubClassKey = `${selectedMainClass}.${subClass}.${subSubClass}`;
        const selections = selectedSubAccounts[subSubClassKey] || {};
        Object.keys(selections).forEach(selectedSubAccountId => {
          const amountKey = `${subSubClassKey}.${selectedSubAccountId}`;
          const amount = Number(amounts[amountKey]);
          if (!isNaN(amount) && amount !== null && amount !== undefined) {
            let accountId = null;
            let subaccountId = selectedSubAccountId;
            Object.entries(accounts).forEach(([account, subaccounts]) => {
              Object.entries(subaccounts).forEach(([subaccount, data]) => {
                if (data.subaccountId === selectedSubAccountId) {
                  accountId = data.accountId;
                }
              });
            });

            classData.accounts.push({
              accountid: accountId,
              finaldata: [{ subaccountid: subaccountId, amount }],
            });

            if (!classData.subclassid) {
              classData.subclassid = classesData[selectedMainClass]?.ids[`subclass_${subClass}`] || undefined;
            }
            if (!classData.subsubclassid) {
              classData.subsubclassid = classesData[selectedMainClass]?.ids[`subsubclass_${subClass}_${subSubClass}`]?.id || undefined;
            }
          }
        });
      });
    });

    if (classData.accounts.length === 0) {
      alert('Please enter at least one amount before saving.');
      return;
    }

    setCompletedMainClasses(prev => [...prev, selectedMainClass]);
    setSavedData(prev => [...prev.filter(d => d.classid !== selectedMainClass), classData]);
    setSelectedMainClass('');
    setSelectedSubAccounts({});
  };

  const submitReport = async () => {
    try {
      if (!selectedCompany || !selectedReport || savedData.length === 0) {
        alert('Please select a company, report, and save at least one main class.');
        return;
      }
      const cleanedSavedData = savedData.map(classItem => ({
        ...classItem,
        accounts: classItem.accounts.filter(account => 
          account.finaldata && account.finaldata.length > 0 && account.finaldata[0].amount !== null && account.finaldata[0].amount !== undefined
        ),
      })).filter(classItem => classItem.accounts.length > 0);

      const payload = {
        companyId: selectedCompany,
        FinReport_id: selectedReport,
        allclasses: cleanedSavedData,
      };
      console.log('[submitReport] Payload:', payload);
      await axios.post('https://deepmetrics-be.onrender.com/deepmetrics/api/v1/mainclass/finRepo', payload, {
        headers: { token: TOKEN },
      });
      alert('Report submitted successfully!');
      navigate('/dashboard');
    } catch (err) {
      console.error('Error submitting report:', err);
      alert('Failed to submit report');
    }
  };

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Add Financial Report</strong>
            <CButton color="secondary" onClick={() => navigate('/dashboard')} className="float-end">
              Back
            </CButton>
          </CCardHeader>
          <CCardBody>
            <CForm>
              <CFormSelect
                label="Company"
                value={selectedCompany}
                onChange={(e) => handleCompanyChange(e.target.value)}
              >
                <option value="">Select Company</option>
                {companies.map(c => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </CFormSelect>

              <CFormSelect
                label="Report"
                value={selectedReport}
                onChange={(e) => setSelectedReport(e.target.value)}
                disabled={!selectedCompany}
              >
                <option value="">Select Report</option>
                {reports.map(r => (
                  <option key={r._id} value={r._id}>
                    {r.reportYear} - {r.period}
                  </option>
                ))}
              </CFormSelect>

              <CFormSelect
                label="Main Class"
                value={selectedMainClass}
                onChange={(e) => handleMainClassChange(e.target.value)}
                disabled={!selectedCompany || !selectedReport}
              >
                <option value="">Select Main Class</option>
                {mainClasses.map(mc => (
                  <option key={mc._id} value={mc._id}>
                    {mc.name}{completedMainClasses.includes(mc._id) ? ' - Completed' : ''}
                  </option>
                ))}
              </CFormSelect>

              {selectedMainClass && classesData[selectedMainClass] && (
                <div className="tree-container">
                  <h3>{mainClasses.find(mc => mc._id === selectedMainClass)?.name}</h3>
                  <div className="table-header table-row">
                    <span className="table-cell sub-account-header">Sub-Account</span>
                    <span className="table-cell previous-report-header">Previous Report</span>
                    <span className="table-cell current-report-header">Current Report</span>
                    <span className="table-cell action-header">Action</span>
                  </div>
                  {renderTree(classesData[selectedMainClass].structure)}
                  <CButton
                    color="primary"
                    onClick={saveMainClassData}
                    className="mt-3 save-main-class-btn"
                    disabled={!selectedCompany || !selectedReport}
                  >
                    Save Main Class
                  </CButton>
                </div>
              )}

              {savedData.length > 0 && (
                <CButton
                  color="success"
                  onClick={submitReport}
                  className="mt-3 submit-report-btn"
                  disabled={!selectedCompany || !selectedReport}
                >
                  Submit Report
                </CButton>
              )}
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  );
};

export default AddFinancialReportPage;