import { createBrowserRouter } from 'react-router-dom'
import App from './App'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Extras } from './screens/Extras'
import { Home } from './screens/Home'
import { Items } from './screens/Items'
import { Setup } from './screens/Setup'

const Placeholder = ({ name }: { name: string }) => (
  <div className="p-8 text-ink font-bold">{name} (coming soon)</div>
)

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Home /> },
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
            <Placeholder name="Summary" />
          </ProtectedRoute>
        ),
      },
      { path: 'bill', element: <Placeholder name="Shared bill" /> },
    ],
  },
])
