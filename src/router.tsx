import { createBrowserRouter } from 'react-router-dom'
import App from './App'
import { ProtectedRoute } from './components/ProtectedRoute'

const Placeholder = ({ name }: { name: string }) => (
  <div className='p-8 text-ink font-bold'>{name} (coming soon)</div>
)

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Placeholder name='Home' /> },
      { path: 'setup', element: <Placeholder name='Setup' /> },
      {
        path: 'items',
        element: (
          <ProtectedRoute>
            <Placeholder name='Items' />
          </ProtectedRoute>
        ),
      },
      {
        path: 'extras',
        element: (
          <ProtectedRoute>
            <Placeholder name='Extras' />
          </ProtectedRoute>
        ),
      },
      {
        path: 'summary',
        element: (
          <ProtectedRoute>
            <Placeholder name='Summary' />
          </ProtectedRoute>
        ),
      },
      { path: 'bill', element: <Placeholder name='Shared bill' /> },
    ],
  },
])
