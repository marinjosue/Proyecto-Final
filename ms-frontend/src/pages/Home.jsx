import React from "react";
import { Carousel, Card, Row, Col } from "react-bootstrap";

const Home = () => {
  return (
    <div>
      {/* Carrusel */}
      <Carousel className="mb-4 shadow">
        <Carousel.Item>
          <img
            className="d-block w-100"
            src="https://images.unsplash.com/photo-1507874457470-272b3c8d8ee2"
            alt="Concierto 1"
            style={{ height: "400px", objectFit: "cover" }}
          />
          <Carousel.Caption>
            <h3>Concierto Rock Fest 2025</h3>
            <p>Vive la energía del rock con las mejores bandas.</p>
          </Carousel.Caption>
        </Carousel.Item>

        <Carousel.Item>
          <img
            className="d-block w-100"
            src="https://images.unsplash.com/photo-1507878866276-a947ef722fee"
            alt="Concierto 2"
            style={{ height: "400px", objectFit: "cover" }}
          />
          <Carousel.Caption>
            <h3>Latin Beats</h3>
            <p>Baila al ritmo de la música latina más vibrante.</p>
          </Carousel.Caption>
        </Carousel.Item>

        <Carousel.Item>
          <img
            className="d-block w-100"
            src="https://images.unsplash.com/photo-1518972559570-7cc1309f3229"
            alt="Concierto 3"
            style={{ height: "400px", objectFit: "cover" }}
          />
          <Carousel.Caption>
            <h3>Jazz & Blues Night</h3>
            <p>Una noche mágica con los mejores músicos de Jazz y Blues.</p>
          </Carousel.Caption>
        </Carousel.Item>
      </Carousel>

      {/* Sección de tarjetas grandes */}
      <Row className="mb-4">
        <Col md={6}>
          <Card className="shadow border-0 h-100">
            <Card.Body>
              <Card.Title className="text-primary">¿Quiénes Somos?</Card.Title>
              <Card.Text>
                Somos ENCUENTRO, la plataforma líder para compra y venta de entradas de conciertos y eventos. Ofrecemos experiencias únicas para que vivas la música como nunca antes.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="shadow border-0 h-100">
            <Card.Body>
              <Card.Title className="text-success">Formas de Pago</Card.Title>
              <Card.Text>
                Aceptamos pagos con tarjetas de crédito, débito, transferencias bancarias y billeteras electrónicas. Tu compra siempre será rápida, fácil y segura.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Mini tarjetas de eventos */}
      <h4 className="mb-3 text-center">🎤 Eventos Destacados</h4>
      <Row xs={1} md={3} className="g-4">
        {[
          { title: "Pop Live", img: "https://images.unsplash.com/photo-1497032628192-86f99bcd76bc" },
          { title: "Festival Electrónico", img: "https://images.unsplash.com/photo-1507874457470-272b3c8d8ee2" },
          { title: "Noche de Salsa", img: "https://images.unsplash.com/photo-1533236897111-3e94666b2edf" }
        ].map((event, idx) => (
          <Col key={idx}>
            <Card className="shadow-sm border-0 h-100">
              <Card.Img variant="top" src={event.img} style={{ height: "200px", objectFit: "cover" }} />
              <Card.Body>
                <Card.Title>{event.title}</Card.Title>
                <Card.Text>
                  Compra tus entradas para este evento único. ¡No te lo pierdas!
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default Home;
