import { ExternalLink, Globe, Link2 } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';
import LogoESSG from '../../assets/files/images/logo/EssG.png';
import type { FooterProps, SocialItem } from '@/types';

function SocialIcon({ kind }: Readonly<{ kind: SocialItem['kind'] }>) {
  switch (kind) {
    case 'web':
      return <Link2 className="size-5" />;
    case 'linkedin':
      return <Globe className="size-5" />;
    case 'facebook':
      return <Globe className="size-5" />;
    default:
      return <ExternalLink className="size-5" />;
  }
}

const Footer: React.FC<FooterProps> = (props: Readonly<FooterProps>) => {
  const {
    companyName = 'ESSG',
    navLinks = [
      { label: 'Tableau de bord', to: '/' },
      { label: 'Admissions', to: '/admissions' },
    ],
    contact = {
      email: 'essg@univ-fianarantsoa.mg',
      phone: '+261 38 18 282 49',
      address: 'Campus Andrainjato, Université de Fianarantsoa, Madagascar',
    },
    socials = [
      { href: 'https://essg.itdcmada.com', kind: 'web', ariaLabel: 'Site officiel ESSG' },
      {
        href: 'https://www.linkedin.com/company/essg',
        kind: 'linkedin',
        ariaLabel: 'LinkedIn ESSG',
      },
      {
        href: 'https://www.facebook.com/profile.php?id=61588935937597',
        kind: 'facebook',
        ariaLabel: 'Facebook ESSG',
      },
    ],
  } = props;

  return (
    <footer className="bg-ink-900 text-ink-100">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link to="/" className="inline-flex items-center gap-3">
              <img
                src={LogoESSG}
                alt={`${companyName} logo`}
                loading="lazy"
                decoding="async"
                className="w-10 h-10 object-contain bg-white rounded-lg p-1"
              />
              <span className="text-xl font-bold tracking-tight text-white">{companyName}</span>
            </Link>
            <p className="text-sm text-ink-300 max-w-xs">
              École Supérieure des Sciences Géomatiques — Université de Fianarantsoa. Formation,
              recherche et innovation géospatiale.
            </p>
            <div className="flex items-center gap-2">
              {socials.map((s) => (
                <a
                  key={`${s.kind ?? 'social'}-${s.href}`}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.ariaLabel ?? `Ouvrir ${companyName} social`}
                  className="p-2 rounded-lg text-ink-300 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <SocialIcon kind={s.kind} />
                </a>
              ))}
            </div>
          </div>

          <div className="md:col-span-2 grid grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-semibold text-ink-100 uppercase tracking-wider">
                Navigation
              </h4>
              <ul className="mt-4 space-y-2 text-sm text-ink-300">
                {navLinks.map((link) => (
                  <li key={link.to}>
                    <Link to={link.to} className="hover:text-white transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-ink-100 uppercase tracking-wider">
                Contact
              </h4>
              <ul className="mt-4 space-y-2 text-sm text-ink-300">
                {contact.email && (
                  <li>
                    <a
                      href={`mailto:${contact.email}`}
                      className="hover:text-white transition-colors break-all"
                    >
                      {contact.email}
                    </a>
                  </li>
                )}
                {contact.phone && (
                  <li>
                    <a
                      href={`tel:${contact.phone.replaceAll(/\s+/g, '')}`}
                      className="hover:text-white transition-colors"
                    >
                      {contact.phone}
                    </a>
                  </li>
                )}
                {contact.address && <li className="text-ink-400">{contact.address}</li>}
              </ul>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-ink-100 uppercase tracking-wider">
              Université de Fianarantsoa
            </h4>
            <p className="text-sm text-ink-300">
              Campus Andrainjato, BP 1264
              <br />
              Fianarantsoa 301, Madagascar
            </p>
            <p className="text-xs text-ink-400 mt-4">
              © {new Date().getFullYear()} ESSG. Tous droits réservés.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
