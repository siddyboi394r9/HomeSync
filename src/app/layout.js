import './globals.css';
import { AppProvider } from '@/context/AppContext';
import AuthShell from '@/components/AuthShell';

export const metadata = {
  title: 'HomeSync — Household Management for Couples',
  description: 'A premium household management app for couples. Track groceries, plan meals, manage finances, and stay in sync with your partner.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AppProvider>
          <AuthShell>{children}</AuthShell>
        </AppProvider>
      </body>
    </html>
  );
}
