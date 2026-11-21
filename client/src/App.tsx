import { Route, Switch, useLocation } from 'wouter';
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import Header from './components/Header';
import MobileWarningPopup from './components/MobileWarningPopup';
import LoadingScreen from './components/LoadingScreen';
import Home from './pages/Home';
import NewHome from './pages/NewHome';
import WavyHome from './pages/WavyHome';
import CleanHome from './pages/CleanHome';
import PerfectHome from './pages/PerfectHome';
import LearnMore from './pages/LearnMore';
import Contact from './pages/Contact';
import BusinessPage from './pages/BusinessPage';
import About from './pages/About';
import Careers from './pages/Careers';
import HelpCenter from './pages/HelpCenter';
import Auth from './pages/Auth';
import Business from './pages/Business';
import RegisterEstablishment from './pages/RegisterEstablishment';
import DashboardMain from './pages/DashboardMain';
import EstablishmentDashboard from './pages/EstablishmentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import UnifiedAdminPanel from './pages/admin/UnifiedAdminPanel';
import AdminAuth from './pages/admin/AdminAuth';
import TransactionManagement from './pages/admin/TransactionManagement';
import UserManagement from './pages/admin/UserManagement';
import UserDetails from './pages/admin/UserDetails';
import AccountSuspended from './pages/AccountSuspended';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import BusinessOverview from './pages/business/BusinessOverview';
import BusinessPerks from './pages/business/BusinessPerks';
import BusinessEvents from './pages/business/BusinessEvents';
import BusinessDrops from './pages/business/BusinessDrops';
import BusinessCustomers from './pages/business/BusinessCustomers';
import BusinessSettings from './pages/business/BusinessSettings';
import BusinessSupport from './pages/business/BusinessSupport';
import BusinessAnalytics from './pages/business/BusinessAnalytics';
import Benefits from './pages/Benefits';
import Events from './pages/Events';
import Explore from './pages/Explore';
import Cards from './pages/Cards';
import Settings from './pages/Settings';
import './videocall.css';
import './fancy-cards.css';

function AppContent() {
  const [location] = useLocation();

  return (
    <>
      <LoadingScreen />
      <MobileWarningPopup />
      <Switch>
        <Route path="/" component={PerfectHome} />
        <Route path="/learn-more" component={LearnMore} />
        <Route path="/contact" component={Contact} />
        <Route path="/business" component={BusinessPage} />
        <Route path="/clean" component={CleanHome} />
        <Route path="/wavy-home" component={WavyHome} />
        <Route path="/new-home" component={NewHome} />
        <Route path="/old-home" component={Home} />
        <Route path="/about" component={About} />
        <Route path="/careers" component={Careers} />
        <Route path="/help" component={HelpCenter} />
        <Route path="/auth" component={Auth} />
        <Route path="/business" component={Business} />
        <Route path="/register/establishment" component={RegisterEstablishment} />
        <Route path="/dashboard/user" component={DashboardMain} />
        <Route path="/dashboard/benefits" component={Benefits} />
        <Route path="/dashboard/events" component={Events} />
        <Route path="/dashboard/explore" component={Explore} />
        <Route path="/dashboard/cards" component={Cards} />
        <Route path="/dashboard/settings" component={Settings} />
        <Route path="/dashboard/establishment" component={EstablishmentDashboard} />
        <Route path="/admin/auth" component={AdminAuth} />
        <Route path="/admin/transactions" component={TransactionManagement} />
        <Route path="/admin/users/:id" component={UserDetails} />
        <Route path="/admin/users" component={UserManagement} />
        <Route path="/admin" component={UnifiedAdminPanel} />
        <Route path="/dashboard/admin" component={UnifiedAdminPanel} />
        <Route path="/account-suspended" component={AccountSuspended} />
        <Route path="/business/overview" component={BusinessOverview} />
        <Route path="/business/perks" component={BusinessPerks} />
        <Route path="/business/events" component={BusinessEvents} />
        <Route path="/business/drops" component={BusinessDrops} />
        <Route path="/business/customers" component={BusinessCustomers} />
        <Route path="/business/analytics" component={BusinessAnalytics} />
        <Route path="/business/settings" component={BusinessSettings} />
        <Route path="/business/support" component={BusinessSupport} />
        <Route path="/terms" component={Terms} />
        <Route path="/privacy" component={Privacy} />
      </Switch>
      <Toaster />
    </>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}
