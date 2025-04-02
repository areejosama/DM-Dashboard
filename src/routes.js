import React from 'react'

const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))
const Companies = React.lazy(() => import('./views/companies/Companies'))
const Sectors = React.lazy(() => import('./views/sectors/Sectors'))
const Class = React.lazy(() => import('./views/classes/Class'))
const SubClass = React.lazy(() => import('./views/classes/subClass'))
const SubSubClass = React.lazy(() => import('./views/classes/subsubClass'))
const Accounts = React.lazy(() => import('./views/classes/accounts'))
const SubAccounts = React.lazy(() => import('./views/classes/subaccounts'))
const Reports = React.lazy(() => import('./views/reports/finreports'))
const Data = React.lazy(() => import('./views/reports/reportsdata'))
const DataPage = React.lazy(() => import('./views/reports/addreportpage'))
const Widgets = React.lazy(() => import('./views/widgets/Widgets'))

const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },
  { path: '/companies', name: 'Companies', element: Companies },
  { path: '/sectors', name: 'Sectors', element: Sectors },
  { path: '/classes/class', name: 'Class', element: Class },
  { path: '/classes/subclass', name: 'SubClass', element: SubClass },
  { path: '/classes/subsubclass', name: 'SubSubClass', element: SubSubClass },
  { path: '/classes/accounts', name: 'Accounts', element: Accounts },
  { path: '/classes/subaccounts', name: 'SubAccounts', element: SubAccounts },
  { path: '/reports/finreports', name: 'Reports', element: Reports },
  { path: '/reports/reportsdata', name: 'Data', element: Data },
  { path: '/reports/addreportpage', name: 'DataPage', element: DataPage },
  { path: '/widgets', name: 'Widgets', element: Widgets },
]

export default routes
