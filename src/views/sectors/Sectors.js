import React, { useState, useEffect } from 'react'
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
} from '@coreui/react'
import { CIcon } from '@coreui/icons-react'
import { cilPencil, cilTrash } from '@coreui/icons'
import axios from 'axios'

const Tables = () => {
  const [sectors, setSectors] = useState([]) // لحفظ بيانات القطاعات
  const [loading, setLoading] = useState(true) // لحالة التحميل
  const [error, setError] = useState(null) // لتخزين الأخطاء
  const [success, setSuccess] = useState(null) // لتخزين رسالة النجاح
  const [visibleAdd, setVisibleAdd] = useState(false) // لحالة ظهور نموذج الإضافة
  const [visibleEdit, setVisibleEdit] = useState(false) // لحالة ظهور نموذج التعديل
  const [formData, setFormData] = useState({
    Sector: '', // اسم القطاع
  })
  const [sectorid, setEditSectorId] = useState(null) // لحفظ معرف القطاع الذي يتم تعديله

  // جلب بيانات القطاعات من الـ API
  useEffect(() => {
    const fetchSectors = async () => {
      try {
        const response = await axios.get('http://localhost:8000/deepmetrics/api/v1/sector');
        console.log('Sectors API Response:', response.data.allsectors); // تحقق من البيانات

        const sectorData = Array.isArray(response.data.allsectors) 
            ? response.data.allsectors 
            : [response.data.allsectors];

        const formattedSectors = sectorData.map((sector, index) => ({
            _id: sector._id, // التأكد من تحويل _id إلى string
            name: sector.Sector
        }));

        setSectors(formattedSectors);
        setLoading(false);
      } catch (err) {
        console.error('Failed to load sectors', err.response ? err.response.data : err.message);
        setError('Failed to load sectors, try again later');
        setLoading(false);
      }
    };

    fetchSectors()
  }, [])

  // معالجة التغييرات في النموذج
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value }); // تحديث formData فقط
  }

  // فتح نموذج الإضافة
  const handleAddOpen = () => {
    setFormData({ Sector: '' }) // إعادة تعيين النموذج
    setVisibleAdd(true)
  }

  // إضافة قطاع جديد
  async function handleSubmit(e) {
    e.preventDefault();
    if (!formData.Sector.trim()) {
      setError('Please enter a sector name');
      return;
    }

    try {
      let response = await axios.post('http://localhost:8000/deepmetrics/api/v1/sector', { Sector: formData.Sector }, {
        headers: {
          'token': 'arij_eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3YzIwMTAxYTJkMDU1NWQ2NDg1OGNmYyIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc0MDc2NzUwMn0.7RROT-EVMHkt40SNNkmez-ciSlnuWHIakd0ytSfb3IQ',
        },
      });
      setSectors([...sectors, response.data]);
      setSuccess('Sector added successfully!');
      console.log("Response after adding sector:", response.data.allsectors);
      setFormData({ Sector: '' }); // إعادة تعيين النموذج بعد الإضافة
      setVisibleAdd(false); // إغلاق النموذج
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error adding sector:', err.response ? err.response.data : err.message);
      setError('Failed to add sector, try again later');
    }
  }

  // فتح نموذج التعديل مع بيانات القطاع
  const handleEditOpen = (sectorid) => {
    const sector = sectors.find(s => s._id === sectorid)
    if (sector) {
      console.log('Editing sector:', sector);
      setEditSectorId(sectorid)
      setFormData({ Sector: sector.name || sector.Sector }) // استخدام Sector إذا كان name غير موجود
      setVisibleEdit(true)
    }
  }

  // تعديل قطاع
  async function handleEditSubmit(e) {
    e.preventDefault();

    console.log('Editing sector with ID:', sectorid, 'and data:', formData);

    if (!formData.Sector.trim()) {
      setError('Please enter a sector name');
      return;
    }

    try {
      const response = await axios.put(`http://localhost:8000/deepmetrics/api/v1/sector/${sectorid}`, { Sector: formData.Sector }, {
        headers: {
          'Content-Type': 'application/json', 
          'token': 'arij_eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3YmNhNmJkODc0YjJiODczOGY1NmI3YSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc0MDQxNjcxNX0.j-vfzlffh5Orru10hBVHpn2AMJOUJfBtxpIDOZSO9DI',
        },
      });
      console.log('Update response:', response.data);

      setSectors(sectors.map(s => s._id === sectorid ? { ...s, name: response.data.sector?.Sector || formData.Sector } : s));
      setSuccess('Sector updated successfully!');
      setFormData({ Sector: '' });
      setVisibleEdit(false);
      setEditSectorId(null);

      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error updating sector:', err.response ? err.response.data : err.message);
      setError('Failed to update sector, try again later');
    }
  }

  // حذف قطاع
  async function handleDelete(sectorid) {
    console.log('Deleting sector with ID:', sectorid);
    if (window.confirm('Are you sure you want to delete this sector?')) {
      try {
        const response = await axios.delete(`http://localhost:8000/deepmetrics/api/v1/sector/${sectorid}`, {
          headers: {
            'token': 'arij_eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3YmNhNmJkODc0YjJiODczOGY1NmI3YSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc0MDQxNjcxNX0.j-vfzlffh5Orru10hBVHpn2AMJOUJfBtxpIDOZSO9DI',
          },
        });
        console.log('Delete response:', response.data);

        setSectors(sectors.filter(s => s._id !== sectorid));
        setSuccess('Sector deleted successfully!');

        setTimeout(() => setSuccess(null), 3000);
      } catch (err) {
        console.error('Error deleting sector:', err.response ? err.response.data : err.message);
        setError('Failed to delete sector, try again later');
      }
    }
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Sectors List</strong>
            <CButton color="primary" className="float-end" onClick={() => handleAddOpen()}>
              Add New Sector
            </CButton>
          </CCardHeader>

          {loading && (
            <CCardBody>Loading...</CCardBody>
          )}

          {error && (
            <CCardBody style={{ color: 'red' }}>
              <div>{error}</div>
            </CCardBody>
          )}

          {success && (
            <CCardBody style={{ color: 'green' }}>
              <div>{success}</div>
            </CCardBody>
          )}

          <CCardBody>
            {/* جدول لعرض القطاعات */}
            <CTable>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell scope="col">#</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Sector Name</CTableHeaderCell>
                  <CTableHeaderCell scope="col" className="text-end">Actions</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {sectors.map((sector, index) => (
                  <CTableRow key={sector._id}>
                    <CTableHeaderCell scope="row">{index + 1}</CTableHeaderCell>
                    <CTableDataCell>{sector.name || sector.Sector}</CTableDataCell>
                    <CTableHeaderCell className="text-end">
                      <CButton color="warning" size="sm" className="me-2" onClick={() => handleEditOpen(sector._id)}>
                        <CIcon icon={cilPencil} />
                      </CButton>
                      <CButton color="danger" size="sm" onClick={() => handleDelete(sector._id)}>
                        <CIcon icon={cilTrash} />
                      </CButton>
                    </CTableHeaderCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>

            {/* النموذج لإضافة قطاع جديد */}
            <CModal visible={visibleAdd} onClose={() => setVisibleAdd(false)} className="custom-modal">
              <CModalHeader>
                <CModalTitle>Add New Sector</CModalTitle>
              </CModalHeader>
              <CModalBody>
                <CForm onSubmit={handleSubmit}>
                  <CFormInput
                    type="text"
                    name="Sector"
                    label="Sector Name"
                    value={formData.Sector}
                    onChange={handleInputChange}
                    required
                  />
                  <CButton type="submit" color="primary" className="mt-3">
                    Save Sector
                  </CButton>
                </CForm>
              </CModalBody>
              <CModalFooter>
                <CButton color="secondary" onClick={() => setVisibleAdd(false)}>
                  Close
                </CButton>
              </CModalFooter>
            </CModal>

            {/* النموذج لتعديل القطاع */}
            <CModal visible={visibleEdit} onClose={() => setVisibleEdit(false)} className="custom-modal">
              <CModalHeader>
                <CModalTitle>Edit Sector</CModalTitle>
              </CModalHeader>
              <CModalBody>
                <CForm onSubmit={handleEditSubmit}>
                  <CFormInput
                    type="text"
                    name="Sector"
                    label="Sector Name"
                    value={formData.Sector}
                    onChange={handleInputChange}
                    required
                  />
                  <CButton type="submit" color="primary" className="mt-3">
                    Update Sector
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