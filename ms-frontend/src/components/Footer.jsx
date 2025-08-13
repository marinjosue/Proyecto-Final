import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-dark text-light pt-4 pb-2 mt-auto">
      <div className="container text-center">
        <h5 className="text-warning">Plataforma de Entretenimiento</h5>
        <p>La mejor experiencia de entretenimiento en línea.</p>

        <div className="row my-3">
          <div className="col-md-6">
            <h6>Enlaces Rápidos</h6>
            <ul className="list-unstyled">
              <li>Inicio</li>
              <li>Explorar</li>
              <li>Categorías</li>
              <li>Soporte</li>
              <li>Contacto</li>
            </ul>
          </div>
          <div className="col-md-6">
            <h6>Contacto</h6>
            <p>📧 contacto@plataforma.com</p>
            <p>📞 +1 234 567 890</p>
          </div>
        </div>

        <p className="text-secondary mt-3">© 2025 Encuentro. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
};

export default Footer;
