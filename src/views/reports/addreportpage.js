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
    const subAccountKey = selectedSubAccountToAdd[subClassKey];
    if (subAccountKey) {
      // Extract the SubAccount details from subAccountKey
      const keyParts = subAccountKey.split('.');
      const subAccountName = keyParts[keyParts.length - 1];
      const pathParts = keyParts.slice(1, -1); // Exclude mainClass and subAccountName
  
      // Find the SubAccount data from classesData
      let subAccountData = null;
      const subClasses = classesData[selectedMainClass]?.structure || {};
      let found = false;
      Object.entries(subClasses).forEach(([subClass, subSubClasses]) => {
        Object.entries(subSubClasses).forEach(([subSubClass, accounts]) => {
          Object.entries(accounts).forEach(([account, subAccounts]) => {
            if (subAccounts[subAccountName]) {
              subAccountData = subAccounts[subAccountName];
              found = true;
            }
          });
        });
      });
  
      if (subAccountData) {
        // Add to addedSubAccounts
        setAddedSubAccounts(prev => {
          const newSet = new Set(prev);
          newSet.add(subAccountKey);
          console.log(`[handleAddSubAccount] Updated addedSubAccounts:`, Array.from(newSet));
          return newSet;
        });
  
        // Update items to include the new SubAccount
        setItems(prevItems => {
          const newItems = JSON.parse(JSON.stringify(prevItems)); // Deep copy
          let currentLevel = newItems[subClassKey.split('.')[1]]; // e.g., Long-term Assets
          pathParts.forEach((part, index) => {
            if (!currentLevel[part]) {
              currentLevel[part] = {};
            }
            currentLevel = currentLevel[part];
          });
          currentLevel[subAccountName] = { ...subAccountData, subaccountId: subAccountData.subaccountId };
          console.log(`[handleAddSubAccount] Added ${subAccountKey} to items:`, newItems);
          return newItems;
        });
  
        // Reset the dropdown selection
        setSelectedSubAccountToAdd(prev => {
          console.log(`[handleAddSubAccount] Resetting selectedSubAccountToAdd for ${subClassKey}`);
          return { ...prev, [subClassKey]: '' };
        });
      } else {
        console.log(`[handleAddSubAccount] SubAccount ${subAccountKey} not found in classesData`);
      }
    } else {
      console.log(`[handleAddSubAccount] No subAccountKey selected for ${subClassKey}`);
    }
  };

const calculateSubClassTotal = (subClassData, subClassKey, mainClassId) => {
  let currentTotal = 0;
  let previousTotal = 0;

  const calculate = (items, prefix) => {
    Object.entries(items).forEach(([key, value]) => {
      const currentKey = prefix ? `${prefix}.${key}` : `${subClassKey}.${key}`;
      const isLeaf = !Object.keys(value).some(k => typeof value[k] === 'object' && !value[k].amount);
      if (isLeaf) {
        const currentAmount = Number(amounts[currentKey]) || 0;
        currentTotal += currentAmount;
        console.log(`[calculateSubClassTotal] Adding ${currentKey}: ${currentAmount} to currentTotal=${currentTotal}`);

        const matchingClass = previousReport?.allclasses?.find(cls => cls.classid?._id === mainClassId);
        const matchingAccount = matchingClass?.accounts?.find(acc =>
          acc.finaldata?.some(fd => {
            const subaccountIdToCompare = typeof fd.subaccountid === 'object' ? fd.subaccountid?._id || fd.subaccountid?.id : fd.subaccountid;
            return subaccountIdToCompare === value.subaccountId;
          })
        );
        const matchingFinalData = matchingAccount?.finaldata?.find(fd => {
          const subaccountIdToCompare = typeof fd.subaccountid === 'object' ? fd.subaccountId?._id || fd.subaccountid?.id : fd.subaccountid;
          return subaccountIdToCompare === value.subaccountId;
        });
        const prevAmount = matchingFinalData?.amount ?? 0;
        previousTotal += prevAmount;
        console.log(`[calculateSubClassTotal] Adding ${currentKey}: ${prevAmount} to previousTotal=${previousTotal}`);
      } else {
        calculate(value, currentKey);
      }
    });
  };

  calculate(subClassData, '');
  console.log(`[calculateSubClassTotal] Final for ${subClassKey}: currentTotal=${currentTotal}, previousTotal=${previousTotal}`);
  return { currentTotal, previousTotal };
};


const renderTree = (items, prefix = '') => {
  // Helper function to check if a node or its children have a value
  const hasValueInTree = (node, nodePrefix) => {
    const isLeaf = !Object.keys(node).some(k => typeof node[k] === 'object' && !node[k].amount);
    if (isLeaf) {
      const currentKey = nodePrefix;
      let previousAmount = 0;
      const matchingClass = previousReport?.allclasses?.find(cls => cls.classid?._id === selectedMainClass);
      const matchingAccount = matchingClass?.accounts?.find(acc =>
        acc.finaldata?.some(fd => {
          const subaccountIdToCompare = typeof fd.subaccountid === 'object' ? fd.subaccountid?._id || fd.subaccountid?.id : fd.subaccountid;
          return subaccountIdToCompare === node.subaccountId;
        })
      );
      const matchingFinalData = matchingAccount?.finaldata?.find(fd => {
        const subaccountIdToCompare = typeof fd.subaccountid === 'object' ? fd.subaccountid?._id || fd.subaccountid?.id : fd.subaccountid;
        return subaccountIdToCompare === node.subaccountId;
      });
      previousAmount = matchingFinalData?.amount ?? 0;
      const isAdded = addedSubAccounts.has(currentKey);
      console.log(`[hasValueInTree] Checking ${currentKey}: previousAmount=${previousAmount}, currentAmount=${amounts[currentKey]}, isAdded=${isAdded}`);
      return isAdded || previousAmount !== 0 || (amounts[currentKey] !== null && amounts[currentKey] !== undefined && amounts[currentKey] !== '');
    }
    return Object.entries(node).some(([subKey, subValue]) => {
      const subKeyPath = nodePrefix ? `${nodePrefix}.${subKey}` : `${selectedMainClass}.${subKey}`;
      return hasValueInTree(subValue, subKeyPath);
    });
  };

  // Filter items to only include nodes with values or SubClasses
  const filteredItems = Object.entries(items).reduce((acc, [key, value]) => {
    const currentKey = prefix ? `${prefix}.${key}` : `${selectedMainClass}.${key}`;
    const isSubClass = prefix === '';
    if (isSubClass) {
      acc[key] = value;
    } else {
      if (hasValueInTree(value, currentKey)) {
        acc[key] = value;
      }
    }
    console.log(`[renderTree] Filtering ${currentKey}: included=${key in acc}`);
    return acc;
  }, {});

  return Object.entries(filteredItems).map(([key, value]) => {
    const currentKey = prefix ? `${prefix}.${key}` : `${selectedMainClass}.${key}`;
    const isLeaf = !Object.keys(value).some(k => typeof value[k] === 'object' && !value[k].amount);
    const isSubClass = prefix === '';

    const missingSubAccounts = [];

    const collectMissingSubAccounts = (items, currentPrefix) => {
      Object.entries(items).forEach(([subKey, subValue]) => {
        const keyPath = currentPrefix ? `${currentPrefix}.${subKey}` : `${currentKey}.${subKey}`;
        const isSubLeaf = !Object.keys(subValue).some(k => typeof subValue[k] === 'object' && !subValue[k].amount);

        if (isSubLeaf) {
          let isInPreviousReport = false;
          if (previousReport?.allclasses) {
            const matchingClass = previousReport.allclasses.find(cls => cls.classid?._id === selectedMainClass);
            isInPreviousReport = matchingClass?.accounts?.some(acc =>
              acc.finaldata?.some(fd => {
                const subaccountIdToCompare = typeof fd.subaccountid === 'object' ? fd.subaccountid?._id || fd.subaccountid?.id : fd.subaccountid;
                return subaccountIdToCompare === subValue.subaccountId;
              })
            );
          }

          const isAddedManually = addedSubAccounts.has(keyPath);
          if (!isInPreviousReport && !isAddedManually && subValue.subaccountId) {
            missingSubAccounts.push({ key: keyPath, name: subKey });
            console.log(`[collectMissingSubAccounts] Added to missing: ${keyPath}`);
          } else {
            console.log(`[collectMissingSubAccounts] Skipped ${keyPath}: InPreviousReport=${isInPreviousReport}, AddedManually=${isAddedManually}`);
          }
        } else {
          collectMissingSubAccounts(subValue, keyPath);
        }
      });
    };

    if (isSubClass) {
      collectMissingSubAccounts(value, currentKey);
    }

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

    const hasValue = isLeaf
      ? previousAmount !== 0 || addedSubAccounts.has(currentKey) || (amounts[currentKey] !== null && amounts[currentKey] !== undefined && amounts[currentKey] !== '')
      : Object.entries(value).some(([subKey, subValue]) => {
          const subKeyPath = prefix ? `${prefix}.${key}.${subKey}` : `${selectedMainClass}.${key}.${subKey}`;
          return hasValueInTree(subValue, subKeyPath);
        });

    return (
      <div key={currentKey} className={isLeaf ? 'sub-account' : 'class-item'}>
        <button onClick={() => toggleExpand(currentKey)} className="expand-btn">
          {isLeaf ? '' : expanded[currentKey] ? '▼' : '▶'} {key}
        </button>
        {(expanded[currentKey] || hasValue) && !isLeaf && (
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
                value={amounts[currentKey] !== null && amounts[currentKey] !== undefined ? amounts[currentKey] : ''}
                onChange={(e) => {
                  console.log(`[renderTree] Changing key: ${currentKey}, Value: ${e.target.value}`);
                  handleAmountChange(currentKey, e.target.value);
                }}
              />
            </span>
          </div>
        )}
        {isSubClass && (
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
          </div>
        )}
        {isSubClass && missingSubAccounts.length > 0 && (
          <div className="add-sub-account-container">
            <CFormSelect
              value={selectedSubAccountToAdd[currentKey] || ''}
              onChange={(e) => {
                console.log(`[renderTree] Selected subaccount to add: ${e.target.value}`);
                setSelectedSubAccountToAdd(prev => ({
                  ...prev,
                  [currentKey]: e.target.value,
                }));
              }}
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
              onClick={() => {
                console.log(`[renderTree] Adding subaccount for key: ${currentKey}, Selected: ${selectedSubAccountToAdd[currentKey]}`);
                handleAddSubAccount(currentKey);
              }}
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
  
    const processSubaccounts = (subaccounts, path, subClass, subSubClass, accountId, subaccountId) => {
      Object.entries(subaccounts).forEach(([subaccount, data]) => {
        // Try multiple key formats to match the amount
        const possibleKeys = [
          `${path}.${subaccount}`,
          `${selectedMainClass}.${subClass}.${subSubClass}.${subaccount}.${subaccount}`, // For redundant nesting
          `${selectedMainClass}.${subaccount}.${subaccount}.${subaccount}`, // For Comprehensive Income
          `${selectedMainClass}.${subaccount}`,
        ];
        let amount;
        for (const key of possibleKeys) {
          if (amounts[key] !== null && amounts[key] !== undefined && amounts[key] !== '' && !isNaN(amounts[key])) {
            amount = Number(amounts[key]);
            break;
          }
        }
  
        console.log(`[processSubaccounts] Path: ${path}, Subaccount: ${subaccount}, Amount: ${amount}, Possible Keys:`, possibleKeys);
  
        if (amount !== undefined && amount !== null && !isNaN(amount)) {
          const accountEntry = {
            accountid: data.accountId || accountId || subaccountId || data.subaccountId,
            finaldata: [{ subaccountid: data.subaccountId || subaccountId || data.accountId, amount }],
          };
          console.log(`[processSubaccounts] Adding account:`, accountEntry);
          classData.accounts.push(accountEntry);
          if (subClass && !classData.subclassid) {
            classData.subclassid = classesData[selectedMainClass]?.ids[`subclass_${subClass}`] || undefined;
          }
          if (subSubClass && !classData.subsubclassid) {
            classData.subsubclassid = classesData[selectedMainClass]?.ids[`subsubclass_${subClass}_${subSubClass}`]?.id || undefined;
          }
        } else {
          console.log(`[processSubaccounts] Skipping subaccount: ${subaccount} (no valid amount found)`);
        }
      });
    };
  
    const structure = classesData[selectedMainClass]?.structure || {};
    console.log('[saveMainClassData] Class Structure:', structure);
    console.log('[saveMainClassData] Current amounts:', amounts);
  
    // Check if structure is simple (e.g., Comprehensive Income)
    const isSimpleStructure = Object.keys(structure).every(
      key => !Object.keys(structure[key]).some(k => typeof structure[key][k] === 'object' && !structure[key][k].amount)
    );
  
    if (isSimpleStructure) {
      console.log('[saveMainClassData] Processing as simple structure');
      Object.entries(structure).forEach(([subClass, subaccounts]) => {
        processSubaccounts(subaccounts, `${selectedMainClass}.${subClass}`, subClass, subClass, subaccounts[subClass]?.accountId, subaccounts[subClass]?.subaccountId);
      });
    } else {
      // Normal structure with subclasses
      Object.entries(structure).forEach(([subClass, subSubClasses]) => {
        Object.entries(subSubClasses).forEach(([subSubClass, accounts]) => {
          Object.entries(accounts).forEach(([account, subaccounts]) => {
            console.log(`[saveMainClassData] Processing subClass: ${subClass}, subSubClass: ${subSubClass}, account: ${account}`);
            processSubaccounts(subaccounts, `${selectedMainClass}.${subClass}.${subSubClass}.${account}`, subClass, subSubClass, subaccounts[account]?.accountId, subaccounts[account]?.subaccountId);
          });
        });
      });
    }
  
    if (classData.accounts.length === 0) {
      console.log('[saveMainClassData] No accounts with valid amounts to save. Current amounts:', amounts);
      alert('Please enter at least one amount before saving.');
      return;
    }
  
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
