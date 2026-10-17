import '../panel.css';
import { DashProvider } from './DashContext';
// Latar kuning dipasang langsung di HTML supaya tidak ada kilatan biru saat halaman dimuat ulang.
export default function DashLayout({ children }) {
  return (<>
    <style>{'body{background:#ffd23f}'}</style>
    <DashProvider>{children}</DashProvider>
  </>);
}
