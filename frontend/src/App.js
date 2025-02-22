import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';

// Admin Routes
import AdminDashboard from './pages/Admin/Dashboard';
import AdminLogin from './pages/Admin/AdminLogin';

// Branch Routes
import BranchDashboard from './pages/Branch/Dashboard';

// Rider Routes
import RiderDashboard from './pages/Rider/Dashboard';

// Customer Routes
import LandingPage from './pages/Customer/LandingPage';
import CustomerRegister from './pages/Customer/components/CustomerRegister';
import Login from './pages/Login';

const theme = createTheme({
    palette: {
        primary: {
            main: '#1976d2',
            light: '#42a5f5',
            dark: '#1565c0',
            lighter: '#e3f2fd',
            contrastText: '#fff',
        },
        secondary: {
            main: '#dc004e',
            light: '#ff4081',
            dark: '#c51162',
            lighter: '#fce4ec',
            contrastText: '#fff',
        },
        success: {
            main: '#2e7d32',
            light: '#4caf50',
            dark: '#1b5e20',
            lighter: '#e8f5e9',
        },
        error: {
            main: '#d32f2f',
            light: '#ef5350',
            dark: '#c62828',
            lighter: '#ffebee',
        },
        warning: {
            main: '#ed6c02',
            light: '#ff9800',
            dark: '#e65100',
            lighter: '#fff3e0',
        },
        info: {
            main: '#0288d1',
            light: '#03a9f4',
            dark: '#01579b',
            lighter: '#e1f5fe',
        },
        background: {
            default: '#f5f5f5',
            paper: '#ffffff',
        },
        text: {
            primary: '#2d3748',
            secondary: '#718096',
        },
        divider: 'rgba(0, 0, 0, 0.12)',
    },
    typography: {
        fontFamily: [
            '-apple-system',
            'BlinkMacSystemFont',
            '"Segoe UI"',
            'Roboto',
            '"Helvetica Neue"',
            'Arial',
            'sans-serif',
        ].join(','),
        h1: {
            fontWeight: 600,
            fontSize: '2.375rem',
            lineHeight: 1.21,
        },
        h2: {
            fontWeight: 600,
            fontSize: '1.875rem',
            lineHeight: 1.27,
        },
        h3: {
            fontWeight: 600,
            fontSize: '1.5rem',
            lineHeight: 1.33,
        },
        h4: {
            fontWeight: 600,
            fontSize: '1.25rem',
            lineHeight: 1.4,
        },
        h5: {
            fontWeight: 600,
            fontSize: '1rem',
            lineHeight: 1.5,
        },
        h6: {
            fontWeight: 600,
            fontSize: '0.875rem',
            lineHeight: 1.57,
        },
        body1: {
            fontSize: '0.875rem',
            lineHeight: 1.57,
        },
        body2: {
            fontSize: '0.75rem',
            lineHeight: 1.66,
        },
        subtitle1: {
            fontSize: '0.875rem',
            fontWeight: 500,
            lineHeight: 1.57,
        },
        subtitle2: {
            fontSize: '0.75rem',
            fontWeight: 500,
            lineHeight: 1.66,
        },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    borderRadius: 8,
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: 'none',
                    },
                },
                contained: {
                    '&:hover': {
                        boxShadow: '0px 2px 4px rgba(0,0,0,0.2)',
                    },
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                },
                elevation1: {
                    boxShadow: '0px 2px 8px rgba(0,0,0,0.08)',
                },
                elevation2: {
                    boxShadow: '0px 4px 12px rgba(0,0,0,0.08)',
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    boxShadow: '0px 2px 8px rgba(0,0,0,0.08)',
                },
            },
        },
        MuiTableHead: {
            styleOverrides: {
                root: {
                    backgroundColor: 'rgba(0, 0, 0, 0.02)',
                    '& .MuiTableCell-root': {
                        color: '#718096',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                    },
                },
            },
        },
        MuiTableCell: {
            styleOverrides: {
                root: {
                    borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
                    padding: '16px',
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    borderRadius: 16,
                },
            },
        },
        MuiAvatar: {
            styleOverrides: {
                root: {
                    fontSize: '1rem',
                    fontWeight: 500,
                },
            },
        },
        MuiDialog: {
            styleOverrides: {
                paper: {
                    borderRadius: 12,
                },
            },
        },
    },
});

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <CartProvider>
          <Router>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<CustomerRegister />} />
              <Route path="/admin/login" element={<AdminLogin />} />

              {/* Protected Admin Routes */}
              <Route
                path="/admin/*"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Protected Branch Routes */}
              <Route
                path="/branch/*"
                element={
                  <ProtectedRoute allowedRoles={['branch_manager']}>
                    <BranchDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Protected Rider Routes */}
              <Route
                path="/rider/*"
                element={
                  <ProtectedRoute allowedRoles={['rider']}>
                    <RiderDashboard />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Router>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to={user?.role === 'customer' ? '/' : '/admin/login'} />;
  }

  return children;
};

export default App;