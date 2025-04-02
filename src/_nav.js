import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilSpeedometer
} from '@coreui/icons'
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'

const _nav = [
  {
    component: CNavItem,
    name: 'Dashboard',
    to: '/dashboard',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
    badge: {
      color: 'info',
 
    },
  },
  {
    component: CNavItem,
    name: 'Companies',
    to: '/companies',
  
  },
  {
    component: CNavItem,
    name: 'Sectors',
    to: '/sectors',
  },
  {
    component: CNavGroup,
    name: 'Classifications',
    items: [
      {
        component: CNavItem,
        name: 'Main Class',
        to: '/classes/class',
      },
      {
        component: CNavItem,
        name: 'Sub Class',
        to: '/classes/subclass',
      },
      {
        component: CNavItem,
        name: 'Sub Sub Class',
        to: '/classes/subsubclass',
      },
      {
        component: CNavItem,
        name: 'Accounts',
        to: '/classes/accounts',
      },
      {
        component: CNavItem,
        name: 'Sub Accounts',
        to: '/classes/subaccounts',
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Financial Reports',
    items: [
      {
        component: CNavItem,
        name: 'Reports',
        to: '/reports/finreports',
      },
      {
        component: CNavItem,
        name: 'Data',
        to: '/reports/reportsdata',
      }
    ],
  }
]

export default _nav
