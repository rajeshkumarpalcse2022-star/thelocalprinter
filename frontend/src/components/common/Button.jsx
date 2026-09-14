'use client';

import React, { useRef, useEffect } from 'react';
import Link from 'next/link';
import gsap from 'gsap';

export default function Button({ children, href, className = '', icon: Icon, iconPosition = 'left', onClick, type = 'button', disabled = false, ...props }) {
  const buttonRef = useRef(null);
  const iconRef = useRef(null);
  const textRef = useRef(null);

  useEffect(() => {
    const btn = buttonRef.current;
    if (!btn || disabled) return;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      const onMouseEnter = () => {
        if (iconRef.current) gsap.to(iconRef.current, { x: iconPosition === 'right' ? 4 : -4, duration: 0.4, ease: 'power3.out' });
        if (textRef.current && iconRef.current) gsap.to(textRef.current, { x: iconPosition === 'right' ? -1 : 1, duration: 0.4, ease: 'power3.out' });
      };
      const onMouseLeave = () => {
        if (iconRef.current) gsap.to(iconRef.current, { x: 0, duration: 0.4, ease: 'power3.out' });
        if (textRef.current) gsap.to(textRef.current, { x: 0, duration: 0.4, ease: 'power3.out' });
        gsap.to(btn, { scale: 1, duration: 0.4, ease: 'power3.out' });
      };
      const onMouseDown = () => { gsap.to(btn, { scale: 0.96, duration: 0.2, ease: 'power2.out' }); };
      const onMouseUp = () => { gsap.to(btn, { scale: 1, duration: 0.4, ease: 'power3.out' }); };

      btn.addEventListener('mouseenter', onMouseEnter);
      btn.addEventListener('mouseleave', onMouseLeave);
      btn.addEventListener('mousedown', onMouseDown);
      btn.addEventListener('mouseup', onMouseUp);
      btn.addEventListener('touchstart', onMouseDown, { passive: true });
      btn.addEventListener('touchend', onMouseUp, { passive: true });

      return () => {
        btn.removeEventListener('mouseenter', onMouseEnter);
        btn.removeEventListener('mouseleave', onMouseLeave);
        btn.removeEventListener('mousedown', onMouseDown);
        btn.removeEventListener('mouseup', onMouseUp);
        btn.removeEventListener('touchstart', onMouseDown);
        btn.removeEventListener('touchend', onMouseUp);
      };
    });
    return () => ctx.revert();
  }, [disabled, iconPosition]);

  const content = (
    <>
      {Icon && iconPosition === 'left' && <Icon ref={iconRef} className="w-4 h-4 shrink-0 transition-none" />}
      <span ref={textRef} className="transition-none whitespace-nowrap">{children}</span>
      {Icon && iconPosition === 'right' && <Icon ref={iconRef} className="w-4 h-4 shrink-0 transition-none" />}
    </>
  );

  const baseClasses = `flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange/50 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`;

  if (href) return <Link href={disabled ? '#' : href} ref={buttonRef} className={`${baseClasses} ${className}`} {...props}>{content}</Link>;
  return <button ref={buttonRef} type={type} onClick={onClick} disabled={disabled} className={`${baseClasses} ${className}`} {...props}>{content}</button>;
}
