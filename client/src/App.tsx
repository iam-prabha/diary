import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from '@/context/ThemeContext'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { Toaster } from '@/components/ui/Toaster'
import { Header } from '@/components/layout/Header'
import { MobileFab } from '@/components/layout/MobileFab'
import { useGlobalShortcuts } from '@/hooks/useKeyboardShortcuts'
import { Landing } from '@/pages/Landing'
import { Home } from '@/pages/Home'
import { EntryView } from '@/pages/EntryView'
import { EntryEdit } from '@/pages/EntryEdit'
import { Settings } from '@/pages/Settings'
import { Login } from '@/pages/Login'
import { PageTransition } from '@/components/ui/PageTransition'
import { Loading } from '@/components/ui/Loading'

function GlobalShortcuts() {
  useGlobalShortcuts()
  return null
}

function Protected({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

function AuthedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="paper-texture flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <PageTransition>{children}</PageTransition>
      </main>
      <MobileFab />
    </div>
  )
}

function AppShell() {
  const { user, loading } = useAuth()

  if (loading) {
    return <Loading />
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/diary" replace /> : <Login />}
      />

      <Route path="/" element={user ? <Navigate to="/diary" replace /> : <Landing />} />

      <Route
        path="/diary"
        element={
          <Protected>
            <AuthedLayout>
              <Home />
            </AuthedLayout>
          </Protected>
        }
      />

      <Route
        path="/entry/:id"
        element={
          <Protected>
            <AuthedLayout>
              <EntryView />
            </AuthedLayout>
          </Protected>
        }
      />
      <Route
        path="/new"
        element={
          <Protected>
            <AuthedLayout>
              <EntryEdit />
            </AuthedLayout>
          </Protected>
        }
      />
      <Route
        path="/edit/:id"
        element={
          <Protected>
            <AuthedLayout>
              <EntryEdit />
            </AuthedLayout>
          </Protected>
        }
      />
      <Route
        path="/settings"
        element={
          <Protected>
            <AuthedLayout>
              <Settings />
            </AuthedLayout>
          </Protected>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <ThemeProvider>
      <ErrorBoundary>
        <BrowserRouter>
          <AuthProvider>
            <GlobalShortcuts />
            <AppShell />
            <Toaster />
          </AuthProvider>
        </BrowserRouter>
      </ErrorBoundary>
    </ThemeProvider>
  )
}

export default App
