import { createBrowserRouter } from 'react-router-dom'
import App from './App'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Extras } from './screens/Extras'
import { Home } from './screens/Home'
import { Items } from './screens/Items'
import { PrivacyPolicy } from './screens/PrivacyPolicy'
import { Setup } from './screens/Setup'
import { Summary } from './screens/Summary'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: 'privacy', element: <PrivacyPolicy /> },
      { path: 'setup', element: <Setup /> },
      {
        path: 'items',
        element: (
          <ProtectedRoute>
            <Items />
          </ProtectedRoute>
        ),
      },
      {
        path: 'extras',
        element: (
          <ProtectedRoute>
            <Extras />
          </ProtectedRoute>
        ),
      },
      {
        path: 'summary',
        element: (
          <ProtectedRoute>
            <Summary />
          </ProtectedRoute>
        ),
      },
      { path: 'bill', element: <Summary readOnly /> },
    ],
  },
])
