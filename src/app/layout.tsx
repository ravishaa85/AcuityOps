import type { Metadata } from 'next';
import './globals.css';
import Navigation from '@/components/Navigation';

export const metadata: Metadata = {
  title: 'AcuityPro - SIMS Hospital Acuity Management & Staffing Optimization',
  description: 'Hospital Acuity Management and Combinatorial Nurse Staffing Optimization for SIMS Hospital. NABH COP-6 & NCP-4 Standard Compliant.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="app-container">
          <Navigation />
          <main className="main-content">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
