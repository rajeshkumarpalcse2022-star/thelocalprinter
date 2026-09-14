"use client";

import { Printer } from "lucide-react";

const DashboardPlaceholder = ({ title, description }) => {
  return (
    <div className="placeholder-page">
      <div className="placeholder-card">
        <div className="placeholder-icon">
          <Printer size={48} />
        </div>
        <h2>{title}</h2>
        <p>{description}</p>
        <div className="placeholder-badge">Coming Soon</div>
      </div>
      <style>{`
        .placeholder-page {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 70vh;
        }
        .placeholder-card {
          text-align: center;
          background: var(--color-white);
          padding: 3rem;
          border-radius: var(--radius-xl);
          box-shadow: var(--shadow);
          max-width: 480px;
          width: 100%;
        }
        .placeholder-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: linear-gradient(135deg, rgba(37,99,235,0.1), rgba(249,115,22,0.1));
          color: var(--color-blue);
          margin-bottom: 1.5rem;
        }
        .placeholder-card h2 {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--color-gray-900);
          margin-bottom: 0.5rem;
        }
        .placeholder-card p {
          color: var(--color-gray-500);
          font-size: 0.95rem;
        }
        .placeholder-badge {
          display: inline-block;
          margin-top: 1.5rem;
          padding: 0.4rem 1rem;
          background: rgba(37,99,235,0.08);
          color: var(--color-blue);
          border-radius: 9999px;
          font-size: 0.8rem;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
};

export default DashboardPlaceholder;
