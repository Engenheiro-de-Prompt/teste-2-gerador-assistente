
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { AssistantsProvider } from './hooks/useAssistants';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import EmbedWrapperPage from './pages/EmbedWrapperPage';
import Header from './components/Header';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    return user ? <>{children}</> : <Navigate to="/auth" />;
};

function App() {
    return (
        <AuthProvider>
            <AssistantsProvider>
                <div className="min-h-screen bg-gray-900 text-gray-100">
                    <Routes>
                        <Route path="/embed/:assistantId" element={<EmbedWrapperPage />} />
                        <Route path="/*" element={<MainApp />} />
                    </Routes>
                </div>
            </AssistantsProvider>
        </AuthProvider>
    );
}

const MainApp = () => {
    const { user } = useAuth();
    return (
        <>
            {user && <Header />}
            <main>
                <Routes>
                    <Route path="/auth" element={<AuthPage />} />
                    <Route 
                        path="/dashboard" 
                        element={
                            <PrivateRoute>
                                <DashboardPage />
                            </PrivateRoute>
                        } 
                    />
                    <Route path="*" element={<Navigate to={user ? "/dashboard" : "/auth"} />} />
                </Routes>
            </main>
        </>
    );
};

export default App;
