// _nav.js
import { cilApplications, cilChart, cilPeople, cilSettings } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { CNavGroup, CNavItem } from '@coreui/react'
import { useAuth } from './contexts/AuthContext'
import { useEffect, useState } from 'react'
import axios from 'axios'

const mode = import.meta.env.VITE_APP_MODE || 'production'
const ENDPOINT_URL = import.meta.env.VITE_BACKEND_URL

const ICON_MAP = {
  cilPeople: cilPeople,
  cilApplications: cilApplications,
  cilChart: cilChart,
  cilSettings: cilSettings,
  // Add others as needed
}

const useNav = () => {
  const { user } = useAuth()
  const [nav, setNav] = useState([]);

  useEffect(() => {
    const fetchNav = async () => {
      if (!user?.UserRoleCode) return;

      try {
        const response = await axios.get(
          `${ENDPOINT_URL}navigations?role=${user.UserRoleCode}`
        );
        const data = response.data.data;

        const transformedNav = data.map(item => {
          // Only include items not marked as devOnly in production
          const filteredItems = item.items?.filter(sub => {
            if (mode === 'production' && sub.devOnly) return false
            return true
          }) || []

          // Don't include group if no items left
          if (filteredItems.length === 0 && item.type === 'group') return null
          console.log('Processing nav item:', item, 'with items:', filteredItems);
          return {
            component: CNavGroup,
            name: item.menuName,
            icon: <CIcon icon={ICON_MAP[item.iconClass]} customClassName="nav-icon" />,
            items: filteredItems.map(sub => ({
              component: CNavItem,
              name: sub.name,
              to: sub.to,
            })),
          }
        }).filter(Boolean)

        console.log('Navigation data:', transformedNav);
        setNav(transformedNav);
      } catch (err) {
        console.error('Failed to load navigation', err);
        // Optional: fallback to static nav
        setNav([]); // or a minimal static version
      }
    };

    fetchNav();
  }, [user]);
  return nav
}

export default useNav
