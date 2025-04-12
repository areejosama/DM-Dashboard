import React, { useState, useEffect } from 'react';
import { CCard, CCardHeader, CCardBody, CCol, CRow, CForm, CFormSelect, CButton } from '@coreui/react';
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
  const [previousReport, setPreviousReport] = useState(null);
  const [savedData, setSavedData] = useState([]);
  const [completedMainClasses, setCompletedMainClasses] = useState([]);
  const [addedSubAccounts, setAddedSubAccounts] = useState(new Set());
  const [selectedSubAccountToAdd, setSelectedSubAccountToAdd] = useState({});

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
    setAddedSubAccounts(new Set());
    setSelectedSubAccountToAdd({});
    setPreviousReport(null);
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
    setAddedSubAccounts(new Set());
    setSelectedSubAccountToAdd({});
    if (!classesData[mainClassId]) {
      await fetchClassData(mainClassId);
    }
  };

  const fetchClassData = async (mainClassId) => {
    try {
      console.log('Fetching Class Data for mainClassId:', mainClassId);
      console.log('Selected Company ID:', selectedCompany);
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

      data.subclasses.forEach(sub => {
        ids[`subclass_${sub.subclass}`] = sub._id;
        classStructure[sub.subclass] = sub.subsubclasses.reduce((acc, subsub) => {
          const sectorId = subsub.sectorid?._id || subsub.sectorid;
          console.log(`SubSubClass: ${subsub.subsubclass}, Sector ID:`, sectorId);
          ids[`subsubclass_${sub.subclass}_${subsub.subsubclass}`] = {
            id: subsub._id,
            sectorid: sectorId,
          };
          acc[subsub.subsubclass] = subsub.accounts.reduce((acc2, accnt) => {
            acc2[accnt.account] = accnt.subaccounts.reduce((acc3, subacc) => {
              acc3[subacc.subaccount] = {
                amount: subacc.amount || '',
                subaccountId: subacc._id,
                accountId: accnt._id,
              };
              initialAmounts[`${mainClassId}.${sub.subclass}.${subsub.subsubclass}.${accnt.account}.${subacc.subaccount}`] = subacc.amount || '';
              return acc3;
            }, {});
            return acc2;
          }, {});
          return acc;
        }, {});
      });

      setClassesData(prev => ({ ...prev, [mainClassId]: { structure: classStructure, ids } }));
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
    }
  };

  const toggleExpand = (key) => {
    setExpanded(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleAmountChange = (key, value) => {
    const sanitizedValue = value === '' ? null : Number(value);
    console.log(`[handleAmountChange] Key: ${key}, Value: ${sanitizedValue}`);
    setAmounts(prev => {
      const updated = { ...prev, [key]: sanitizedValue };
      console.log('[handleAmountChange] Updated amounts:', updated);
      return updated;
    });
  };

  const handleAddSubAccount = (subClassKey) => {
    const selectedKey = selectedSubAccountToAdd[subClassKey];
    if (selectedKey) {
      setAddedSubAccounts(prev => {
        const updated = new Set(prev);
        updated.add(selectedKey);
        return updated;
      });
      setSelectedSubAccountToAdd(prev => ({
        ...prev,
        [subClassKey]: '',
      }));
    }
  };

  const calculateSubClassTotal = (subClassItems, prefix, mainClassId) => {
    let currentTotal = 0;
    let previousTotal = 0;
    let allCurrentAmountsFilled = true;

    const collectAmounts = (items, currentPrefix) => {
      Object.entries(items).forEach(([key, value]) => {
        const keyPath = currentPrefix ? `${currentPrefix}.${key}` : `${prefix}.${key}`;
        const isLeaf = !Object.keys(value).some(k => typeof value[k] === 'object');

        if (isLeaf) {
          const currentAmount = amounts[keyPath];
          if (currentAmount !== null && currentAmount !== undefined && currentAmount !== '' && !isNaN(currentAmount)) {
            currentTotal += Number(currentAmount);
          } else {
            allCurrentAmountsFilled = false;
          }

          const matchingClass = previousReport?.allclasses?.find(cls => cls.classid?._id === mainClassId);
          const matchingAccount = matchingClass?.accounts?.find(acc =>
            acc.finaldata?.some(fd => {
              const subaccountIdToCompare = typeof fd.subaccountid === 'object' ? fd.subaccountid?._id || fd.subaccountid?.id : fd.subaccountid;
              return subaccountIdToCompare === value.subaccountId;
            })
          );
          const matchingFinalData = matchingAccount?.finaldata?.find(fd => {
            const subaccountIdToCompare = typeof fd.subaccountid === 'object' ? fd.subaccountid?._id || fd.subaccountid?.id : fd.subaccountid;
            return subaccountIdToCompare === value.subaccountId;
          });
          const previousAmount = matchingFinalData?.amount ?? 0;
          if (previousAmount !== 0 && previousAmount !== null && previousAmount !== undefined && !isNaN(previousAmount)) {
            previousTotal += Number(previousAmount);
          }
        } else {
          collectAmounts(value, keyPath);
        }
      });
    };

    collectAmounts(subClassItems, prefix);
    return {
      currentTotal: allCurrentAmountsFilled ? currentTotal : 0,
      previousTotal: previousTotal > 0 ? previousTotal : 0,
    };
  };

  const renderTree = (items, prefix = '') => {
    return Object.entries(items).map(([key, value]) => {
      const currentKey = prefix ? `${prefix}.${key}` : `${selectedMainClass}.${key}`;
      const isLeaf = !Object.keys(value).some(k => typeof value[k] === 'object');
      const isSubClass = prefix === '';

      const missingSubAccounts = [];

      const collectMissingSubAccounts = (items, currentPrefix) => {
        Object.entries(items).forEach(([subKey, subValue]) => {
          const keyPath = currentPrefix ? `${currentPrefix}.${subKey}` : `${currentKey}.${subKey}`;
          const isSubLeaf = !Object.keys(subValue).some(k => typeof subValue[k] === 'object');

          if (isSubLeaf) {
            const matchingClass = previousReport?.allclasses?.find(cls => cls.classid?._id === selectedMainClass);
            const matchingAccount = matchingClass?.accounts?.find(acc =>
              acc.finaldata?.some(fd => {
                const subaccountIdToCompare = typeof fd.subaccountid === 'object' ? fd.subaccountid?._id || fd.subaccountid?.id : fd.subaccountid;
                return subaccountIdToCompare === subValue.subaccountId;
              })
            );
            const matchingFinalData = matchingAccount?.finaldata?.find(fd => {
              const subaccountIdToCompare = typeof fd.subaccountid === 'object' ? fd.subaccountid?._id || fd.subaccountid?.id : fd.subaccountid;
              return subaccountIdToCompare === subValue.subaccountId;
            });
            const previousAmount = matchingFinalData?.amount ?? 0;
            const isAddedManually = addedSubAccounts.has(keyPath);

            const subsubclassKey = keyPath.split('.').slice(0, 3).join('.');
            const subsubclassIdKey = `subsubclass_${subsubclassKey.split('.')[1]}_${subsubclassKey.split('.')[2]}`;
            const subsubclassSectorId = classesData[selectedMainClass]?.ids[subsubclassIdKey]?.sectorid;

            console.log(`Sub-Account: ${subKey}, KeyPath: ${keyPath}, SubSubClass Sector ID: ${subsubclassSectorId}, Company Sector ID: ${companySectorId}`);
            console.log(`Previous Amount: ${previousAmount}, Is Added Manually: ${isAddedManually}`);
            const subAccountSectorId = subValue.sectorid; // Use the sectorid of the Sub-Account

            console.log(`Sub-Account: ${subKey}, KeyPath: ${keyPath}, Sub-Account Sector ID: ${subAccountSectorId}, Company Sector ID: ${companySectorId}`);
            if (
              previousAmount === 0 &&
              !isAddedManually & subAccountSectorId === companySectorId
            ) {
              console.log(`Adding Sub-Account to missingSubAccounts: ${subKey}`);
              missingSubAccounts.push({ key: keyPath, name: subKey });
            } else {
              console.log(`Skipping Sub-Account: ${subKey} (Previous amount exists or already added)`);
            }
          } else {
            collectMissingSubAccounts(subValue, keyPath);
          }
        });
      };

      if (isSubClass) {
        collectMissingSubAccounts(value, currentKey);
      }

      console.log(`Missing Sub-Accounts for ${currentKey}:`, missingSubAccounts);

      const { currentTotal, previousTotal } = isSubClass
        ? calculateSubClassTotal(value, currentKey, selectedMainClass)
        : { currentTotal: 0, previousTotal: 0 };

      let previousAmount = 0;
      if (isLeaf) {
        const matchingClass = previousReport?.allclasses?.find(cls => cls.classid?._id === selectedMainClass);
        const matchingAccount = matchingClass?.accounts?.find(acc =>
          acc.finaldata?.some(fd => {
            const subaccountIdToCompare = typeof fd.subaccountid === 'object' ? fd.subaccountid?._id || fd.subaccountid?.id : fd.subaccountid;
            return subaccountIdToCompare === value.subaccountId;
          })
        );
        const matchingFinalData = matchingAccount?.finaldata?.find(fd => {
          const subaccountIdToCompare = typeof fd.subaccountid === 'object' ? fd.subaccountid?._id || fd.subaccountid?.id : fd.subaccountid;
          return subaccountIdToCompare === value.subaccountId;
        });
        previousAmount = matchingFinalData?.amount ?? 0;
      }

      const isAddedManually = addedSubAccounts.has(currentKey);

      // Check if the current key is redundant (e.g., "Inventory" -> "Inventory" -> "Inventory")
      const shouldSkipRendering = () => {
        if (isLeaf) return false; // Always render the leaf (Sub-Account with Input Field)

        const childKeys = Object.keys(value);
        if (childKeys.length === 1) {
          const childKey = childKeys[0];
          const childValue = value[childKey];
          const isChildLeaf = !Object.keys(childValue).some(k => typeof childValue[k] === 'object');

          // If the child is a leaf and has the same name as the current key, skip rendering this level
          if (isChildLeaf && childKey === key) {
            return true;
          }

          // If the child is not a leaf, check the next level
          const grandChildKeys = Object.keys(childValue);
          if (grandChildKeys.length === 1) {
            const grandChildKey = grandChildKeys[0];
            const isGrandChildLeaf = !Object.keys(childValue[grandChildKey]).some(k => typeof childValue[grandChildKey][k] === 'object');
            if (isGrandChildLeaf && grandChildKey === childKey && childKey === key) {
              return true;
            }
          }
        }
        return false;
      };

      const skipRendering = shouldSkipRendering();

      if (skipRendering) {
        // Skip rendering this level and render the child directly
        return renderTree(value, prefix);
      }

      return (
        <div key={currentKey} className={isLeaf ? 'sub-account' : 'class-item'}>
          <button onClick={() => toggleExpand(currentKey)} className="expand-btn">
            {isLeaf ? '' : expanded[currentKey] ? '▼' : '▶'} {key}
          </button>
          {expanded[currentKey] && !isLeaf && (
            <div style={{ marginLeft: '15px' }}>
              {renderTree(value, currentKey)}
            </div>
          )}
          {isLeaf && (
            <div className="table-row sub-account-row">
              <span className="table-cell sub-account-name">Amount</span>
              <span className="table-cell previous-report" data-label="Previous Report:">
                {previousAmount !== 0 ? previousAmount : '-'}
              </span>
              <span className="table-cell current-report" data-label="Current Report:">
                <input
                  type="number"
                  value={amounts[currentKey] || ''}
                  onChange={(e) => {
                    console.log(`[renderTree] Changing key: ${currentKey}, Value: ${e.target.value}`);
                    handleAmountChange(currentKey, e.target.value);
                  }}
                  // placeholder="Enter amount"
                />
              </span>
            </div>
          )}
          {isSubClass && (currentTotal > 0 || previousTotal > 0) && (
            <div className="table-row total-row">
              <span className="table-cell sub-account-name">
                <strong>Total:</strong>
              </span>
              <span className="table-cell previous-report" data-label="Previous Report:">{previousTotal > 0 ? previousTotal : '-'}</span>
              <span className="table-cell current-report" data-label="Current Report:">{currentTotal > 0 ? currentTotal : '-'}</span>
            </div>
          )}
          {isSubClass && missingSubAccounts.length > 0 && (
            <div className="add-sub-account-container">
              <CFormSelect
                value={selectedSubAccountToAdd[currentKey] || ''}
                onChange={(e) => setSelectedSubAccountToAdd(prev => ({
                  ...prev,
                  [currentKey]: e.target.value,
                }))}
                className="add-sub-account-select"
              >
                <option value="">Select Sub-Account to Add</option>
                {missingSubAccounts.map(subAccount => (
                  <option key={subAccount.key} value={subAccount.key}>
                    {subAccount.name}
                  </option>
                ))}
              </CFormSelect>
              <CButton
                color="success"
                onClick={() => handleAddSubAccount(currentKey)}
                disabled={!selectedSubAccountToAdd[currentKey]}
                className="add-sub-account-btn"
              >
                Add
              </CButton>
            </div>
          )}
        </div>
      );
    });
  };

  const saveMainClassData = () => {
    const classData = {
      classid: selectedMainClass,
      accounts: [],
      subclassid: undefined,
      subsubclassid: undefined,
    };

    const processSubaccounts = (subaccounts, path, subClass, subSubClass) => {
      Object.entries(subaccounts).forEach(([subaccount, data]) => {
        const key = `${path}.${subaccount}`;
        const amount = amounts[key];
        console.log(`[processSubaccounts] Key: ${key}, Amount: ${amount}, Type: ${typeof amount}`);
        if (amount !== null && amount !== undefined && !isNaN(amount) && amount !== '') {
          const accountEntry = {
            accountid: data.accountId,
            finaldata: [{ subaccountid: data.subaccountId, amount }],
          };
          console.log(`[processSubaccounts] Adding account:`, accountEntry);
          classData.accounts.push(accountEntry);
          if (!classData.subclassid) {
            classData.subclassid = classesData[selectedMainClass].ids[`subclass_${subClass}`];
          }
          if (!classData.subsubclassid) {
            classData.subsubclassid = classesData[selectedMainClass].ids[`subsubclass_${subClass}_${subSubClass}`].id;
          }
        } else {
          console.log(`[processSubaccounts] Skipping key: ${key} (invalid or empty amount)`);
        }
      });
    };

    Object.entries(classesData[selectedMainClass].structure).forEach(([subClass, subSubClasses]) => {
      Object.entries(subSubClasses).forEach(([subSubClass, accounts]) => {
        Object.entries(accounts).forEach(([account, subaccounts]) => {
          processSubaccounts(subaccounts, `${selectedMainClass}.${subClass}.${subSubClass}.${account}`, subClass, subSubClass);
        });
      });
    });

    if (classData.accounts.length === 0) {
      console.log('[saveMainClassData] No accounts with valid amounts to save.');
      alert('Please enter at least one amount before saving.');
      return;
    }

    classData.accounts = classData.accounts.filter(account => 
      account.finaldata && account.finaldata.length > 0 && account.finaldata[0].amount !== null && account.finaldata[0].amount !== undefined
    );

    console.log('[saveMainClassData] Final classData:', classData);
    setCompletedMainClasses(prev => [...prev, selectedMainClass]);
    setSavedData(prev => [...prev.filter(d => d.classid !== selectedMainClass), classData]);
    setSelectedMainClass('');
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
                  </div>
                  {renderTree(classesData[selectedMainClass].structure)}
                  <CButton
                    color="primary"
                    onClick={saveMainClassData}
                    className="mt-3"
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
                  className="mt-3"
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