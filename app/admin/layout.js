import '../panel.css';
import { AdminProvider } from './AdminContext';
// Latar kuning dipasang langsung di HTML supaya tidak ada kilatan biru saat halaman dimuat ulang.
export default function AdminLayout({ children }) {
  return (<>
    <style>{'body{background:#ffd23f}'}</style>
    <AdminProvider>{children}</AdminProvider>
  </>);
}
