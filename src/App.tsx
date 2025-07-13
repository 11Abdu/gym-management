import { useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { Login } from '@/components/Login';
import { Sidebar } from '@/components/Sidebar';
import { Dashboard } from '@/components/Dashboard';
import { MemberList } from '@/components/MemberList';
import { AddMember } from '@/components/AddMember';
import { EditMember } from '@/components/EditMember';
import { Plans } from '@/components/Plans';
import { Reports } from '@/components/Reports';
import { QRCheckIn } from '@/components/QRCheckIn';
import { MemberDetails } from '@/components/MemberDetails';
import { AdminManagement } from '@/components/AdminManagement';
import { Toaster } from '@/components/ui/toaster';
import './App.css';


function AppContent() {
  const { admin, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');

  const handleNavigation = (page: string, memberId?: string) => {
    setCurrentPage(page);
    if (memberId) {
      setSelectedMemberId(memberId);
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!admin) {
    return <Login />;
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'members':
        return <MemberList onNavigate={handleNavigation} />;
      case 'add-member':
        return <AddMember onNavigate={handleNavigation} />;
      case 'edit-member':
        return <EditMember memberId={selectedMemberId} onNavigate={handleNavigation} />;
      case 'plans':
        return <Plans />;
      case 'reports':
        return <Reports />;
      case 'checkin':
        return <QRCheckIn onNavigate={handleNavigation} />;
      case 'admin':
        return <AdminManagement />;
      case 'member-details':
        return <MemberDetails memberId={selectedMemberId} />;
      default:
        return <Dashboard onNavigate={handleNavigation} />;
    }
  };

  return (
    <div className="app-main-container h-screen w-screen bg-gray-50 flex overflow-hidden">
      <Sidebar currentPage={currentPage} onNavigate={handleNavigation} />
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto">
          {renderCurrentPage()}
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
        <Toaster />
      </AuthProvider>
    </Router>
  );
}

export default App;