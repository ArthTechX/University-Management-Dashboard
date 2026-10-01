import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// ─── Institutional Monogram ───────────────────────────────────────────────────
const Monogram = () => (
  <span
    aria-label="EduTrack monogram"
    className="inline-flex items-center justify-center w-8 h-8 border-2 border-academic-primary text-academic-primary font-serif font-bold text-sm flex-shrink-0 select-none"
    style={{ letterSpacing: '-0.04em' }}
  >
    ET
  </span>
);

// ─── Footer ───────────────────────────────────────────────────────────────────
const Footer = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-academic-border bg-academic-surface">
      {/* Main columns */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">

          {/* Column 1 — Identity */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <Monogram />
              <span className="font-serif font-bold text-xl text-academic-heading tracking-tight">
                EduTrack
              </span>
            </div>
            <p className="text-sm text-academic-muted leading-relaxed mb-0">
              Academic records, enrollment, and coursework — in one place.
            </p>
          </div>

          {/* Column 2 — Role-aware quick links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-academic-muted mb-4 border-none pb-0">
              {isAdmin ? 'Administration' : 'Student Portal'}
            </h4>
            <nav aria-label="Footer navigation">
              <ul className="space-y-2">
                {isAdmin ? (
                  <>
                    <li>
                      <Link
                        to="/admin/dashboard"
                        className="text-sm text-academic-text hover:text-academic-primary transition-colors"
                      >
                        Dashboard
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/admin/users"
                        className="text-sm text-academic-text hover:text-academic-primary transition-colors"
                      >
                        Student Directory
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/admin/courses"
                        className="text-sm text-academic-text hover:text-academic-primary transition-colors"
                      >
                        Course Management
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/admin/enrollments"
                        className="text-sm text-academic-text hover:text-academic-primary transition-colors"
                      >
                        Enrollment Records
                      </Link>
                    </li>
                  </>
                ) : (
                  <>
                    <li>
                      <Link
                        to="/dashboard"
                        className="text-sm text-academic-text hover:text-academic-primary transition-colors"
                      >
                        My Dashboard
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/courses"
                        className="text-sm text-academic-text hover:text-academic-primary transition-colors"
                      >
                        Course Catalogue
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/files"
                        className="text-sm text-academic-text hover:text-academic-primary transition-colors"
                      >
                        My Documents
                      </Link>
                    </li>
                  </>
                )}
              </ul>
            </nav>
          </div>

          {/* Column 3 — Support */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-academic-muted mb-4 border-none pb-0">
              Support
            </h4>
            <ul className="space-y-2">
              <li className="text-sm text-academic-text">
                For academic queries, contact your faculty coordinator.
              </li>
              <li>
                <span className="text-xs text-academic-muted">Technical Support:</span>
                {/* Email is rendered as text via React — no XSS risk; no innerHTML */}
                <span className="block text-sm text-academic-text font-medium">
                  support@edutrack.edu
                </span>
              </li>
              <li className="text-xs text-academic-muted pt-1">
                Office hours: Mon–Fri, 9 am – 5 pm
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-academic-border bg-[#FBFBFA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-academic-muted mb-0">
            &copy; {year} EduTrack. All rights reserved.
          </p>
          <p className="text-xs text-academic-muted mb-0">
            <span
              className="inline-block w-1.5 h-1.5 bg-academic-accent mr-1.5 align-middle"
              aria-hidden="true"
            />
            All systems operational
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
