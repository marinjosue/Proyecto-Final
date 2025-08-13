import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: 'Inicio', href: '#' },
    { name: 'Explorar Eventos', href: '#' },
    { name: 'Categorías', href: '#' },
    { name: 'Artistas', href: '#' },
    { name: 'Venues', href: '#' }
  ];

  const supportLinks = [
    { name: 'Centro de Ayuda', href: '#' },
    { name: 'Política de Reembolsos', href: '#' },
    { name: 'Términos de Servicio', href: '#' },
    { name: 'Política de Privacidad', href: '#' },
    { name: 'Contacto', href: '#' }
  ];

  return (
    <>
      <style>{`
        .footer-gradient {
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
        }
        
        .footer-card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .social-icon {
          transition: all 0.3s ease;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .social-icon:hover {
          transform: translateY(-3px) scale(1.1);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
        }
        
        .social-facebook:hover {
          background: #1877f2;
          border-color: #1877f2;
        }
        
        .social-twitter:hover {
          background: #1da1f2;
          border-color: #1da1f2;
        }
        
        .social-instagram:hover {
          background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%);
          border-color: #bc1888;
        }
        
        .link-hover {
          position: relative;
          transition: all 0.3s ease;
        }
        
        .link-hover:hover {
          color: #60a5fa;
          transform: translateX(5px);
        }
        
        .link-hover::before {
          content: '';
          position: absolute;
          left: -15px;
          top: 50%;
          width: 0;
          height: 2px;
          background: #60a5fa;
          transition: width 0.3s ease;
          transform: translateY(-50%);
        }
        
        .link-hover:hover::before {
          width: 8px;
        }
        
        .newsletter-input {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          transition: all 0.3s ease;
        }
        
        .newsletter-input:focus {
          background: rgba(255, 255, 255, 0.15);
          border-color: #60a5fa;
          box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.1);
          outline: none;
        }
        
        .newsletter-btn {
          background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
          transition: all 0.3s ease;
        }
        
        .newsletter-btn:hover {
          background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%);
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(59, 130, 246, 0.3);
        }
        
        .contact-item {
          transition: all 0.3s ease;
        }
        
        .contact-item:hover {
          color: #34d399;
          transform: translateY(-2px);
        }
        
        .contact-icon {
          background: rgba(52, 211, 153, 0.1);
          transition: all 0.3s ease;
        }
        
        .contact-item:hover .contact-icon {
          background: rgba(52, 211, 153, 0.2);
          transform: scale(1.1);
        }
        
        .github-btn {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          transition: all 0.3s ease;
        }
        
        .github-btn:hover {
          background: #24292e;
          border-color: #24292e;
          transform: translateY(-2px) scale(1.05);
          box-shadow: 0 10px 25px rgba(36, 41, 46, 0.3);
        }
        
        .pulse-heart {
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        
        .brand-icon {
          background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
        }
        
        .section-title {
          position: relative;
          padding-bottom: 10px;
        }
        
        .section-title::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 40px;
          height: 2px;
          background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
        }
      `}</style>
      
      <footer className="footer-gradient text-white mt-auto">
        {/* Main Footer Content */}
        <div className="container-fluid px-4 py-5">
          <div className="row g-4 mb-5">
            {/* Brand Section */}
            <div className="col-lg-3 col-md-6">
              <div className="d-flex align-items-center gap-3 mb-4">
                <div className="brand-icon p-3 rounded-3 d-flex align-items-center justify-content-center">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 18V5l12-2v13"/>
                    <circle cx="6" cy="18" r="3"/>
                    <circle cx="18" cy="16" r="3"/>
                  </svg>
                </div>
                <div>
                  <h3 className="h4 mb-0 fw-bold">ENCUENTRO</h3>
                  <small className="text-light opacity-75">Plataforma de Entretenimiento</small>
                </div>
              </div>
              <p className="text-light mb-4 opacity-90">
                La mejor experiencia de entretenimiento en línea. Conectamos artistas con fanáticos para crear momentos inolvidables.
              </p>
              
              {/* Social Links */}
              <div className="d-flex gap-3">
                <a href="#" className="social-icon social-facebook d-flex align-items-center justify-content-center rounded-circle p-3 text-white text-decoration-none" style={{width: '48px', height: '48px'}}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a href="#" className="social-icon social-twitter d-flex align-items-center justify-content-center rounded-circle p-3 text-white text-decoration-none" style={{width: '48px', height: '48px'}}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
                <a href="#" className="social-icon social-instagram d-flex align-items-center justify-content-center rounded-circle p-3 text-white text-decoration-none" style={{width: '48px', height: '48px'}}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987c6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447c0-1.297.49-2.448 1.297-3.323C5.902 8.248 7.053 7.758 8.35 7.758c1.297 0 2.448.49 3.323 1.297c.875.875 1.366 2.026 1.366 3.323c0 1.297-.491 2.448-1.366 3.323c-.875.875-2.026 1.366-3.323 1.366zm7.718 0c-1.297 0-2.448-.49-3.323-1.297c-.875-.875-1.366-2.026-1.366-3.323c0-1.297.491-2.448 1.366-3.323c.875-.875 2.026-1.366 3.323-1.366c1.297 0 2.448.491 3.323 1.366c.875.875 1.366 2.026 1.366 3.323c0 1.297-.491 2.448-1.366 3.323c-.875.875-2.026 1.366-3.323 1.366z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="col-lg-2 col-md-6">
              <h5 className="section-title text-primary mb-4">Enlaces Rápidos</h5>
              <ul className="list-unstyled">
                {quickLinks.map((link, index) => (
                  <li key={index} className="mb-2">
                    <a 
                      href={link.href}
                      className="link-hover text-light text-decoration-none opacity-75"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support Links */}
            <div className="col-lg-2 col-md-6">
              <h5 className="section-title text-info mb-4">Soporte</h5>
              <ul className="list-unstyled">
                {supportLinks.map((link, index) => (
                  <li key={index} className="mb-2">
                    <a 
                      href={link.href}
                      className="link-hover text-light text-decoration-none opacity-75"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div className="col-lg-3 col-md-6">
              <h5 className="section-title text-success mb-4">Contacto</h5>
              <div className="d-flex flex-column gap-3">
                <a 
                  href="mailto:josuisaac2002@gmail.com"
                  className="contact-item text-light text-decoration-none d-flex align-items-center gap-3"
                >
                  <div className="contact-icon p-2 rounded">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                  </div>
                  <div>
                    <small className="text-light opacity-75">Email</small>
                    <div>josuisaac2002@gmail.com</div>
                  </div>
                </a>

                <a 
                  href="tel:+1234567890"
                  className="contact-item text-light text-decoration-none d-flex align-items-center gap-3"
                >
                  <div className="contact-icon p-2 rounded">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>
                    </svg>
                  </div>
                  <div>
                    <small className="text-light opacity-75">Teléfono</small>
                    <div>+593 991267695</div>
                  </div>
                </a>

                <div className="d-flex align-items-center gap-3 text-light">
                  <div className="contact-icon p-2 rounded">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                  </div>
                  <div>
                    <small className="text-light opacity-75">Ubicación</small>
                    <div>Quito, Ecuador</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Newsletter */}
            <div className="col-lg-2 col-md-12">
              <h5 className="section-title text-warning mb-4">Newsletter</h5>
              <p className="text-light opacity-75 mb-3 small">
                Recibe las últimas noticias y ofertas especiales.
              </p>
              <div className="d-flex flex-column gap-2">
                <input
                  type="email"
                  placeholder="tu@email.com"
                  className="newsletter-input form-control text-white border-0"
                  style={{backgroundColor: 'rgba(255,255,255,0.1)'}}
                />
                <button className="newsletter-btn btn text-white fw-semibold">
                  Suscribirse
                </button>
              </div>
            </div>
          </div>

          {/* Newsletter Section */}
          <div className="footer-card rounded-4 p-4 mb-5 text-center">
            <h4 className="h5 mb-3">🎵 Mantente Actualizado</h4>
            <p className="text-light opacity-75 mb-4">
              Suscríbete para recibir las últimas noticias sobre conciertos y eventos exclusivos.
            </p>
            <div className="row justify-content-center">
              <div className="col-md-6">
                <div className="input-group">
                  <input
                    type="email"
                    placeholder="Ingresa tu email"
                    className="newsletter-input form-control text-white"
                  />
                  <button className="newsletter-btn btn text-white fw-semibold px-4">
                    Suscribirse
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-top border-secondary border-opacity-25" style={{backgroundColor: 'rgba(0,0,0,0.2)'}}>
          <div className="container-fluid px-4 py-4">
            <div className="row align-items-center">
              <div className="col-md-6">
                <p className="text-light opacity-75 mb-2 mb-md-0">
                  © {currentYear} ENCUENTRO. Todos los derechos reservados.
                </p>
              </div>
              
              <div className="col-md-6">
                <div className="d-flex flex-column flex-sm-row align-items-md-end justify-content-md-end gap-3">
                  <div className="d-flex align-items-center gap-2 text-light opacity-75 small">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                      <circle cx="9" cy="7" r="4"/>
                      <path d="M23 21v-2a4 4 0 00-3-3.87"/>
                      <path d="M16 3.13a4 4 0 010 7.75"/>
                    </svg>
                    <span>Desarrollado con</span>
                    <svg className="pulse-heart text-danger" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
                    </svg>
                    <span>por</span>
                    <span className="text-primary fw-semibold">Josué Marín</span>
                    <span>&</span>
                    <span className="text-info fw-semibold">Elkin Pabón</span>
                  </div>
                  
                  <a
                    href="https://github.com/marinjosue/Proyecto-Final/tree/main"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="github-btn btn btn-sm d-flex align-items-center gap-2 text-white text-decoration-none"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                    <span>Ver Código</span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
                      <polyline points="15,3 21,3 21,9"/>
                      <line x1="10" y1="14" x2="21" y2="3"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;