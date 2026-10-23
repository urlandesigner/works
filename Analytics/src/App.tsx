import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProviders } from '@/providers';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import LoginRoute from '@/routes/login';
import OverviewRoute from '@/routes/overview';
import SitesRoute from '@/routes/sites';
import SiteNewRoute from '@/routes/site-new';
import SiteDetailRoute from '@/routes/site-detail';
import SiteEditRoute from '@/routes/site-edit';
import SettingsRoute from '@/routes/settings';

export default function App() {
  return (
    <AppProviders>
      <BrowserRouter basename={import.meta.env.VITE_BASE_PATH || '/'}>
        <Routes>
          <Route path="/login" element={<LoginRoute />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<OverviewRoute />} />
            <Route path="/sites" element={<SitesRoute />} />
            <Route path="/sites/new" element={<SiteNewRoute />} />
            <Route path="/sites/:id" element={<SiteDetailRoute />} />
            <Route path="/sites/:id/edit" element={<SiteEditRoute />} />
            <Route path="/configuracoes" element={<SettingsRoute />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProviders>
  );
}
