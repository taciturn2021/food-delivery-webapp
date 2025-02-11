import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider, createTheme } from '@mui/material';

// Import pages (we'll create these next)
import Login from './pages/Login';
import Register from './pages/Register';
import CustomerHome from './pages/Customer/Home';
import AdminDashboard from './pages/Admin/Dashboard';
import BranchDashboard from './pages/Branch/Dashboard';

const theme = createTheme({
    palette: {
        primary: {
            main: '#1976d2',
        },
        secondary: {
            main: '#dc004e',
        },
    },
});

function App() {
    return (
        <ThemeProvider theme={theme}>
            <AuthProvider>
                <Router>
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/customer/*" element={<CustomerHome />} />
                        <Route path="/admin/*" element={<AdminDashboard />} />
                        <Route path="/branch/*" element={<BranchDashboard />} />
                    </Routes>
                </Router>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;