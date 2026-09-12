'use client';

import React, { useState, useRef, useEffect } from 'react';
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
  Sliders,
  ChevronDown,
  Database
} from '@/components/Icons';

export default function Navigation() {
  const pathname = usePathname();
  const [isMastersOpen, setIsMastersOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isMastersActive = pathname.startsWith('/masters');

  const navLinks = [
    { href: '/', label: 'Executive Acuity Board', icon: LayoutDashboard },
    { href: '/ward-dashboard', label: 'Ward Patient Dashboard', icon: HeartPulse },
    { href: '/duty-roster', label: 'Duty Assignment Roster', icon: CalendarCheck },
  ];

  const masterLinks = [
    {
      href: '/masters/nurses',
      label: 'Nurse Directory',
      description: 'Staff credentials, competencies & shifts',
      icon: Users
    },
    {
      href: '/masters/wards',
      label: 'Ward Directory',
      description: '32 hospital wards & 423 bed capacities from HIS',
      icon: Building2
    },
    {
      href: '/masters/patients',
      label: 'Patient Directory',
      description: 'Live HIS admitted inpatient registry',
      icon: UserSquare2
    },
    {
      href: '/masters/acuity-forms',
      label: 'Customizable Acuity Forms',
      description: 'Clinical scoring templates & weights',
      icon: Sliders
    },
  ];

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsMastersOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsMastersOpen(false);
    }, 200);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsMastersOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    setIsMastersOpen(false);
  }, [pathname]);

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

        {/* Right Side: Standards Compliance Badges & Live HIS Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            fontSize: '11px',
            fontWeight: 700,
            background: '#f5f3ff',
            color: '#6d28d9',
            border: '1px solid #ddd6fe',
            padding: '4px 10px',
            borderRadius: '6px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#7c3aed' }} />
            HIS Web Service Live
          </span>
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
        gap: '4px',
        position: 'relative'
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

        {/* Masters Dropdown Menu */}
        <div
          ref={dropdownRef}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          style={{ position: 'relative' }}
        >
          <button
            type="button"
            onClick={() => setIsMastersOpen(prev => !prev)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 14px',
              color: isMastersActive ? '#6d28d9' : '#475569',
              background: isMastersActive ? '#f5f3ff' : 'transparent',
              fontWeight: isMastersActive ? 700 : 500,
              fontSize: '13px',
              border: 'none',
              borderBottom: isMastersActive ? '3px solid #7c3aed' : '3px solid transparent',
              borderRadius: '6px 6px 0 0',
              whiteSpace: 'nowrap',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              if (!isMastersActive) {
                e.currentTarget.style.color = '#0f172a';
                e.currentTarget.style.background = '#f8fafc';
              }
            }}
            onMouseLeave={(e) => {
              if (!isMastersActive) {
                e.currentTarget.style.color = '#475569';
                e.currentTarget.style.background = 'transparent';
              }
            }}
            aria-expanded={isMastersOpen}
            aria-haspopup="true"
          >
            <Database size={16} color={isMastersActive ? '#7c3aed' : '#64748b'} />
            <span>Masters</span>
            <ChevronDown
              size={14}
              color={isMastersActive ? '#7c3aed' : '#94a3b8'}
              style={{
                transform: isMastersOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease'
              }}
            />
          </button>

          {/* Submenu Dropdown Panel */}
          {isMastersOpen && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                minWidth: '310px',
                background: '#ffffff',
                borderRadius: '0 8px 12px 12px',
                boxShadow: '0 12px 30px -4px rgba(0, 0, 0, 0.12), 0 4px 8px -2px rgba(0, 0, 0, 0.06)',
                border: '1px solid #e2e8f0',
                borderTop: '2px solid #7c3aed',
                padding: '8px',
                zIndex: 1000,
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}
            >
              <div style={{
                padding: '6px 10px 4px',
                fontSize: '10px',
                fontWeight: 700,
                color: '#94a3b8',
                letterSpacing: '0.06em',
                textTransform: 'uppercase'
              }}>
                Master Registries
              </div>

              {masterLinks.map((sub) => {
                const isSubActive = pathname === sub.href;
                const SubIcon = sub.icon;

                return (
                  <Link
                    key={sub.href}
                    href={sub.href}
                    onClick={() => setIsMastersOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      background: isSubActive ? '#f5f3ff' : 'transparent',
                      border: isSubActive ? '1px solid #ddd6fe' : '1px solid transparent',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSubActive) {
                        e.currentTarget.style.background = '#f8fafc';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSubActive) {
                        e.currentTarget.style.background = 'transparent';
                      }
                    }}
                  >
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '7px',
                      background: isSubActive ? '#ede9fe' : '#f1f5f9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      color: isSubActive ? '#7c3aed' : '#64748b'
                    }}>
                      <SubIcon size={16} />
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: '13px',
                        fontWeight: isSubActive ? 700 : 600,
                        color: isSubActive ? '#6d28d9' : '#1e293b',
                        lineHeight: 1.3
                      }}>
                        {sub.label}
                      </div>
                      <div style={{
                        fontSize: '11px',
                        color: '#64748b',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        marginTop: '2px'
                      }}>
                        {sub.description}
                      </div>
                    </div>

                    {isSubActive && (
                      <span style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: '#7c3aed'
                      }} />
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
