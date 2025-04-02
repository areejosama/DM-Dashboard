import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
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
} from '@coreui/react'
import { CIcon } from '@coreui/icons-react'
import { cilPencil, cilTrash } from '@coreui/icons'
import axios from 'axios'

const Tables = () => {
  const [companies, setCompanies] = useState([]) // لحفظ بيانات الشركات
  const [loading, setLoading] = useState(true) // لحالة التحميل
  const [error, setError] = useState(null) // لتخزين الأخطاء
  const [success, setSuccess] = useState(null) // لتخزين رسالة النجاح
  const [visibleAdd, setVisibleAdd] = useState(false) // لحالة ظهور نموذج الإضافة
  const [visibleEdit, setVisibleEdit] = useState(false) // لحالة ظهور نموذج التعديل
  const [sectors, setSectors] = useState([]) // لحفظ بيانات القطاعات
  const [formData, setFormData] = useState({
    name: '',
    sectorid: '',
    image: null,
    country: '',
    currency: '',
  })
  const [editCompanyId, setEditCompanyId] = useState(null) // لحفظ معرف الشركة التي يتم تعديلها

  // جلب بيانات الشركات من الـ API
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await axios.get('http://localhost:8000/deepmetrics/api/v1/company')
        setCompanies(response.data.companies || []) // التأكد من أن البيانات موجودة
        setLoading(false)
      } catch (err) {
        setError('Failed to load companies, try again later')
        setLoading(false)
        console.error(err)
      }
    }

    // جلب بيانات القطاعات من الـ API
     const fetchSectors = async () => {
        try {
            const response = await axios.get('http://localhost:8000/deepmetrics/api/v1/sector');
            console.log('Sectors API Response:', response.data.allsectors); // تحقق من البيانات
    
            // التأكد من أن `allsectors` عبارة عن مصفوفة، وإلا تحويلها إلى مصفوفة
            const sectorData = Array.isArray(response.data.allsectors) 
                ? response.data.allsectors 
                : [response.data.allsectors];
    
            // تنسيق البيانات بحيث تحتوي على `_id` فريد
            const formattedSectors = sectorData.map((sector, index) => ({
                _id: sector._id || `sector_${index}`, // إذا لم يكن هناك `_id` استخدم `index`
                name: sector.Sector
            }));
    
            setSectors(formattedSectors || []);
        } catch (err) {
            console.error('Failed to load sectors', err.response ? err.response.data : err.message);
        }
    };

    fetchCompanies()
    fetchSectors()
  }, [])

  // معالجة التغييرات في النموذج
  const handleInputChange = (e) => {
    const { name, value, files } = e.target
    console.log('Input Change:', { name, value }) // تسجيل التغييرات
    if (name === 'image') {
      setFormData({ ...formData, [name]: files[0] })
    } else {
      setFormData({ ...formData, [name]: value })
    }
  }

  // فتح نموذج الإضافة
  const handleAddOpen = () => {
    setFormData({
      name: '',
      sectorid: sectors.length > 0 ? sectors[0]._id : '', // تعيين القطاع الأول كافتراضي
      image: null,
      country: '',
      currency: '',
    })
    setVisibleAdd(true)
    console.log(setFormData)
  }

  // إضافة شركة جديدة
  const handleSubmit = async (e) => {
    e.preventDefault()
    let  formDataToSend = new FormData()
    console.log('Form Data before submit:', formData) // تسجيل البيانات قبل الإرسال

    // التأكد من ملء جميع الحقول المطلوبة
    if (!formData.name || formData.name.length < 3) {
      setError('Please enter a company name with at least 3 characters')
      return
    }
    if (!formData.sectorid) {
      setError('Please select a valid sector from the list')
      return
    }
    if (!formData.country) {
      setError('Please enter a country')
      return
    }
    if (!formData.currency) {
      setError('Please enter a currency')
      return
    }

    formDataToSend = new FormData();
    formDataToSend.append("name", formData.name);
    formDataToSend.append("sectorid", formData.sectorid);
    formDataToSend.append("country", formData.country);
    formDataToSend.append("currency", formData.currency);
    formDataToSend.append("image", formData.image); 

    try {
      let response = await axios.post('http://localhost:8000/deepmetrics/api/v1/company', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
           token: 'arij_eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3YzIwMTAxYTJkMDU1NWQ2NDg1OGNmYyIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc0MDc2NzUwMn0.7RROT-EVMHkt40SNNkmez-ciSlnuWHIakd0ytSfb3IQ'
        },
      })
      console.log('API Response:', response.data) // تسجيل الاستجابة
      setCompanies([...companies, response.data.company || response.data.data])
      setSuccess('Company added successfully!')
      setVisibleAdd(false)
      setFormData({ name: '', sectorid: '', image: null, country: '', currency: '' })
      // إخفاء الرسالة بعد 3 ثوانٍ
      setTimeout(() => setSuccess(null), 2000)
    } catch (err) {
      console.error('Error adding company:', err.response ? err.response.data : err.message)
      setError('Failed to add company, try again later')
    }
  }

  // فتح نموذج التعديل مع بيانات الشركة
  const handleEditOpen = (companyId) => {
    const company = companies.find(c => c._id === companyId)
    if (company) {
      setEditCompanyId(companyId)
      setFormData({
        name: company.name,
        sectorid: company.sectorid?._id || '',
        image: null, // يمكنكِ إضافة خيار لتحديث الصورة هنا
        country: company.country,
        currency: company.currency,
      })
      setVisibleEdit(true)
    }
  }

  // تعديل شركة
  const handleEditSubmit = async (e) => {
    e.preventDefault()
    let  formDataToSend = new FormData()

    // التأكد من ملء جميع الحقول المطلوبة
    if (!formData.name || formData.name.length < 3) {
      setError('Please enter a company name with at least 3 characters')
      return
    }
    if (!formData.sectorid) {
      setError('Please select a valid sector from the list')
      return
    }
    if (!formData.country) {
      setError('Please enter a country')
      return
    }
    if (!formData.currency) {
      setError('Please enter a currency')
      return
    }

    formDataToSend.append('name', formData.name)
    formDataToSend.append('sectorid', formData.sectorid)
    formDataToSend.append('country', formData.country)
    formDataToSend.append('currency', formData.currency)
    if (formData.image) {
      formDataToSend.append('image', formData.image)
    }

    try {
      const response = await axios.put(`http://localhost:8000/deepmetrics/api/v1/company/${editCompanyId}`, formDataToSend, {
        headers: {
            'Content-Type': 'multipart/form-data',
            token: 'arij_eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3YzIwMTAxYTJkMDU1NWQ2NDg1OGNmYyIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc0MDc2NzUwMn0.7RROT-EVMHkt40SNNkmez-ciSlnuWHIakd0ytSfb3IQ'
        },
      })
      setCompanies(companies.map(c => c._id === editCompanyId ? response.data.brand || response.data.company || response.data.data : c))
      setSuccess('Company updated successfully!')
      setVisibleEdit(false)
      setFormData({ name: '', sectorid: '', image: null, country: '', currency: '' })
      setEditCompanyId(null)
      // إخفاء الرسالة بعد 3 ثوانٍ
      setTimeout(() => setSuccess(null), 2000)
    } catch (err) {
      console.error('Error updating company:', err.response ? err.response.data : err.message)
      setError('Failed to update company, try again later')
    }
  }

  // حذف شركة
  const handleDelete = async (companyId) => {
    if (window.confirm('Are you sure you want to delete this company?')) {
      try {
        await axios.delete(`http://localhost:8000/deepmetrics/api/v1/company/${companyId}`,{
            headers: {
                'Content-Type': 'multipart/form-data',
                token: 'arij_eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3YzIwMTAxYTJkMDU1NWQ2NDg1OGNmYyIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc0MDc2NzUwMn0.7RROT-EVMHkt40SNNkmez-ciSlnuWHIakd0ytSfb3IQ'
            },
        })
        setCompanies(companies.filter(c => c._id !== companyId))
        setSuccess('Company deleted successfully!')
        // إخفاء الرسالة بعد 3 ثوانٍ
        setTimeout(() => setSuccess(null), 2000)
      } catch (err) {
        console.error('Error deleting company:', err.response ? err.response.data : err.message)
        setError('Failed to delete company, try again later')
      }
    }
  }

  if (loading) {
    return (
      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardHeader>
              <strong>Companies List</strong>
              <CButton color="primary" className="float-end" onClick={() => handleAddOpen()}>
                Add New Company
              </CButton>
            </CCardHeader>
            <CCardBody>
              {error ? (
                <div>
                  <p className="text-danger">{error}</p>
                  <CButton color="danger" onClick={() => window.location.reload()}>Retry</CButton>
                </div>
              ) : (
                <div>Loading...</div>
              )}
            </CCardBody>
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
              <strong>Companies List</strong>
              <CButton color="primary" className="float-end" onClick={() => handleAddOpen()}>
                Add New Company
              </CButton>
            </CCardHeader>
            <CCardBody>
              <div>{error}</div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    )
  }

  if (success) {
    return (
      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardBody>
              <div style={{ color: 'green' }}>{success}</div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    )
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Companies List</strong>
            <CButton color="primary" className="float-end" onClick={() => handleAddOpen()}>
              Add New Company
            </CButton>
          </CCardHeader>
          <CCardBody>
            <CTable>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell scope="col">#</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Company Name</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Currency</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Image</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Country</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Sector</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Actions</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {companies.map((company, index) => {
                  // البحث عن اسم القطاع بناءً على sectorid
                  const sector = sectors.find(s => s._id === company.sectorid || s._id === company.sectorid?._id)
                  const sectorName = sector ? sector.name : 'No Sector'
                  return (
                    <CTableRow key={company._id}>
                      <CTableHeaderCell scope="row">{index + 1}</CTableHeaderCell>
                      <CTableDataCell>{company.name}</CTableDataCell>
                      <CTableDataCell>{company.currency}</CTableDataCell>
                      <CTableDataCell>
                        <img src={company.image} alt={company.name} style={{ width: '50px', height: '50px' }} />
                      </CTableDataCell>
                      <CTableDataCell>{company.country}</CTableDataCell>
                      <CTableDataCell>{sectorName}</CTableDataCell>
                      <CTableHeaderCell>
                        <CButton color="warning" size="sm" className="me-2" onClick={() => handleEditOpen(company._id)}>
                          <CIcon icon={cilPencil} />
                        </CButton>
                        <CButton color="danger" size="sm" onClick={() => handleDelete(company._id)}>
                          <CIcon icon={cilTrash} />
                        </CButton>
                      </CTableHeaderCell>
                    </CTableRow>
                  )
                })}
              </CTableBody>
            </CTable>

            {/* النموذج لإضافة شركة جديدة */}
            <CModal visible={visibleAdd} onClose={() => setVisibleAdd(false)}>
              <CModalHeader>
                <CModalTitle>Add New Company</CModalTitle>
              </CModalHeader>
              <CModalBody>
                <CForm onSubmit={handleSubmit}>
                  <CFormInput
                    type="text"
                    name="name"
                    label="Company Name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                  <CFormSelect
                    name="sectorid"
                    label="Sector"
                    value={formData.sectorid}
                    onChange={handleInputChange}
                    required
                  >
                    {sectors.length > 0 ? (
                      sectors.map(sector => (
                        <option key={sector._id} value={sector._id}>{sector.name}</option>
                      ))
                    ) : (
                      <option value="" disabled>No sectors available, please try again later</option>
                    )}
                  </CFormSelect>
                  <CFormInput
                    type="text"
                    name="country"
                    label="Country"
                    value={formData.country}
                    onChange={handleInputChange}
                    required
                  />
                  <CFormInput
                    type="text"
                    name="currency"
                    label="Currency"
                    value={formData.currency}
                    onChange={handleInputChange}
                    required
                  />
                  <CFormInput
                    type="file"
                    name="image"
                    label="Company Logo (Image)"
                    onChange={handleInputChange}
                  />
                  <CButton type="submit" color="primary" className="mt-3">
                    Save Company
                  </CButton>
                </CForm>
              </CModalBody>
              <CModalFooter>
                <CButton color="secondary" onClick={() => setVisibleAdd(false)}>
                  Close
                </CButton>
              </CModalFooter>
            </CModal>

            {/* النموذج لتعديل شركة */}
            <CModal visible={visibleEdit} onClose={() => setVisibleEdit(false)}>
              <CModalHeader>
                <CModalTitle>Edit Company</CModalTitle>
              </CModalHeader>
              <CModalBody>
                <CForm onSubmit={handleEditSubmit}>
                  <CFormInput
                    type="text"
                    name="name"
                    label="Company Name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                  <CFormSelect
                    name="sectorid"
                    label="Sector"
                    value={formData.sectorid}
                    onChange={handleInputChange}
                    required
                  >
                    {sectors.length > 0 ? (
                      sectors.map(sector => (
                        <option key={sector._id} value={sector._id}>{sector.name}</option>
                      ))
                    ) : (
                      <option value="" disabled>No sectors available, please try again later</option>
                    )}
                  </CFormSelect>
                  <CFormInput
                    type="text"
                    name="country"
                    label="Country"
                    value={formData.country}
                    onChange={handleInputChange}
                    required
                  />
                  <CFormInput
                    type="text"
                    name="currency"
                    label="Currency"
                    value={formData.currency}
                    onChange={handleInputChange}
                    required
                  />
                  <CFormInput
                    type="file"
                    name="image"
                    label="Company Logo (Image)"
                    onChange={handleInputChange}
                  />
                  <CButton type="submit" color="primary" className="mt-3">
                    Update Company
                  </CButton>
                </CForm>
              </CModalBody>
              <CModalFooter>
                <CButton color="secondary" onClick={() => setVisibleEdit(false)}>
                  Close
                </CButton>
              </CModalFooter>
            </CModal>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default Tables