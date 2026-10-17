import { DashProvider } from './DashContext';
export default function DashLayout({ children }) {
  return <DashProvider>{children}</DashProvider>;
}
