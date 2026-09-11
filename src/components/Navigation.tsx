'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Building2,
  CalendarCheck,
  UserSquare2,
  Activity,
  HeartPulse,
  Sliders
} from '@/components/Icons';

export default function Navigation() {
  const pathname = usePathname();

  const navLinks = [
    { href: '/', label: 'Executive Acuity Board', icon: LayoutDashboard },
    { href: '/ward-dashboard', label: 'Ward Patient Dashboard', icon: HeartPulse },
    { href: '/duty-roster', label: 'Duty Assignment Roster', icon: CalendarCheck },
    { href: '/masters/nurses', label: 'Nurse Directory', icon: Users },
    { href: '/masters/wards', label: 'Ward Directory', icon: Building2 },
    { href: '/masters/patients', label: 'Patient Directory', icon: UserSquare2 },
    { href: '/masters/acuity-forms', label: 'Customizable Acuity Forms', icon: Sliders },
  ];

  return (
    <header style={{
      width: '100%',
      background: '#ffffff',
      borderBottom: '1px solid var(--border-subtle)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)'
    }}>
      {/* Top Brand Bar */}
      <div style={{
        maxWidth: '1600px',
        margin: '0 auto',
        padding: '10px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #f1f5f9',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        {/* Left Side: SIMS Logo & AcuityPro Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* SIMS Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/sims-logo.jpg"
              alt="SIMS"
              style={{ height: '38px', width: 'auto', objectFit: 'contain' }}
            />
          </Link>

          {/* Divider */}
          <div style={{ width: '1px', height: '28px', background: '#e2e8f0' }} />

          {/* AcuityPro Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              boxShadow: '0 2px 8px rgba(124, 58, 237, 0.3)'
            }}>
              <Activity size={18} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '17px', fontWeight: 800, letterSpacing: '-0.02em', color: '#0f172a' }}>
                  AcuityPro
                </span>
                <span style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  background: '#f5f3ff',
                  color: '#7c3aed',
                  padding: '1px 6px',
                  borderRadius: '4px',
                  border: '1px solid #ddd6fe'
                }}>
                  AI
                </span>
              </div>
              <p style={{ fontSize: '11px', color: '#64748b' }}>
                Nurse Staffing & Optimization
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Standards Compliance Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            fontSize: '11px',
            fontWeight: 700,
            background: '#ecfdf5',
            color: '#047857',
            border: '1px solid #a7f3d0',
            padding: '4px 10px',
            borderRadius: '6px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
            NABH COP-6
          </span>
          <span style={{
            fontSize: '11px',
            fontWeight: 700,
            background: '#eff6ff',
            color: '#1d4ed8',
            border: '1px solid #bfdbfe',
            padding: '4px 10px',
            borderRadius: '6px'
          }}>
            NCP-4 Excellence
          </span>
        </div>
      </div>

      {/* Horizontal Navigation Menu Row */}
      <div style={{
        maxWidth: '1600px',
        margin: '0 auto',
        padding: '0 32px',
        display: 'flex',
        alignItems: 'center',
        overflowX: 'auto',
        gap: '4px'
      }}>
        {navLinks.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 14px',
                color: isActive ? '#6d28d9' : '#475569',
                background: isActive ? '#f5f3ff' : 'transparent',
                fontWeight: isActive ? 700 : 500,
                fontSize: '13px',
                borderBottom: isActive ? '3px solid #7c3aed' : '3px solid transparent',
                borderRadius: '6px 6px 0 0',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = '#0f172a';
                  e.currentTarget.style.background = '#f8fafc';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = '#475569';
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              <Icon size={16} color={isActive ? '#7c3aed' : '#64748b'} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </header>
  );
}
