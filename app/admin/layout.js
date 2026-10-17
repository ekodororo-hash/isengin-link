import { AdminProvider } from './AdminContext';
export default function AdminLayout({ children }) {
  return <AdminProvider>{children}</AdminProvider>;
}
