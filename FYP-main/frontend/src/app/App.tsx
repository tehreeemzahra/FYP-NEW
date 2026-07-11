import { useState, lazy, Suspense } from 'react';
import { clearAuth } from '@/lib/api';
import { WelcomePage } from './components/WelcomePage';
import { ParentRegisterPage } from './components/ParentRegisterPage';
import { ParentLoginPage } from './components/ParentLoginPage';
import { ChildLoginPage } from './components/ChildLoginPage';
import { LoginCodeModal } from './components/LoginCodeModal';
import { SimpleParentDashboard } from './components/SimpleParentDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminLoginPage } from './components/AdminLoginPage';
import { useGlobalClickSound } from './components/useGlobalClickSound';
import { useDismissTextCaret } from './components/useDismissTextCaret';

const Dashboard = lazy(() => import('./components/Dashboard'));

type Page = 'welcome' | 'register' | 'parentLogin' | 'childLogin' | 'childDashboard' | 'parentDashboard' | 'adminLogin' | 'adminDashboard';

export default function App() {
  useGlobalClickSound(true);
  useDismissTextCaret(true);

  const [currentPage, setCurrentPage] = useState<Page>('welcome');
  const [childData, setChildData] = useState<any>(null);
  const [parentData, setParentData] = useState<any>(null);
  const [showLoginCodeModal, setShowLoginCodeModal] = useState(false);
  const [registrationLoginCodes, setRegistrationLoginCodes] = useState<{ name: string; loginCode: string }[]>([]);

  const handleRoleSelection = (role: 'parent' | 'child' | 'admin') => {
    if (role === 'parent') {
      setCurrentPage('parentLogin');
    } else if (role === 'child') {
      setCurrentPage('childLogin');
    } else if (role === 'admin') {
      setCurrentPage('adminLogin');
    }
  };

  const handleParentRegister = (parent: any, children: any[], loginCodes: { name: string; loginCode: string }[]) => {
    setParentData(parent);
    setChildData(children[0] ?? null);
    setRegistrationLoginCodes(loginCodes);
    setShowLoginCodeModal(true);
  };

  const handleParentLogin = (parent: any) => {
    setParentData(parent);
    setCurrentPage('parentDashboard');
  };

  const handleChildLogin = (child: any) => {
    setChildData(child);
    setCurrentPage('childDashboard');
  };

  const handleLoginCodeModalContinue = () => {
    setShowLoginCodeModal(false);
    setCurrentPage('parentDashboard');
  };

  const handleLoginCodeGoToLogins = () => {
    setShowLoginCodeModal(false);
    setCurrentPage('welcome');
  };

  const handleSignOut = () => {
    clearAuth();
    setChildData(null);
    setParentData(null);
    setCurrentPage('welcome');
  };

  const handleBackToWelcome = () => {
    setCurrentPage('welcome');
  };

  const handleAdminLogin = () => {
    setCurrentPage('adminDashboard');
  };

  // Render Parent Dashboard
  if (currentPage === 'parentDashboard') {
    return (
      <SimpleParentDashboard 
        parentData={parentData}
        onSignOut={handleSignOut}
      />
    );
  }

  // Render Child Dashboard
  if (currentPage === 'childDashboard') {
    return (
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center cq-bg-app text-white">
            <div className="cq-chip animate-pulse">Loading dashboard...</div>
          </div>
        }
      >
        <Dashboard
          childData={childData}
          onSignOut={handleSignOut}
          showBackButton={false}
        />
      </Suspense>
    );
  }

  // Render Admin Dashboard
  if (currentPage === 'adminDashboard') {
    return (
      <AdminDashboard
        onSignOut={handleSignOut}
      />
    );
  }

  // Render Auth Pages
  return (
    <>
      {currentPage === 'welcome' ? (
        <WelcomePage onSelectRole={handleRoleSelection} />
      ) : currentPage === 'parentLogin' ? (
        <ParentLoginPage
          onBack={handleBackToWelcome}
          onSwitchToRegister={() => setCurrentPage('register')}
          onLogin={handleParentLogin}
        />
      ) : currentPage === 'childLogin' ? (
        <ChildLoginPage
          onBack={handleBackToWelcome}
          onLogin={handleChildLogin}
          onSwitchToRegister={() => setCurrentPage('register')}
        />
      ) : currentPage === 'adminLogin' ? (
        <AdminLoginPage
          onBack={handleBackToWelcome}
          onLoginSuccess={handleAdminLogin}
        />
      ) : (
        <ParentRegisterPage
          onBack={handleBackToWelcome}
          onSwitchToLogin={() => setCurrentPage('parentLogin')}
          onRegister={handleParentRegister}
        />
      )}

      {/* Login Code Modal */}
      {showLoginCodeModal && registrationLoginCodes.length > 0 && (
        <LoginCodeModal 
          childAccounts={registrationLoginCodes}
          onContinue={handleLoginCodeModalContinue}
          onGoToLogins={handleLoginCodeGoToLogins}
        />
      )}
    </>
  );
}