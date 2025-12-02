import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { Typography, CircularProgress, TextField, Button } from '@material-ui/core';
import { Container, Col, Row } from 'react-bootstrap'
import { authenticationService } from './../../services';
import { useHistory } from "react-router-dom";
import './style.css'

const HIDE = "d-none"
const SHOW = ""

const RegisterBox = props => {

  let history = useHistory();
  const [spinnerVisibility, setSpinnerVisibility] = useState(HIDE);
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setSpinnerVisibility(SHOW)
    setMessage("")
    
    // Enviar código de verificación por email
    authenticationService.sendVerificationCode(email)
        .then(
            response => {
                console.log('Respuesta del backend:', response);
                // Si la respuesta es exitosa (200), redirigir independientemente del formato
                if (response && (response.exitosa === true || response.status === 200 || response.ok === true)) {
                  // Redirigir a la pantalla de validación de código
                  history.push('/validar-codigo/' + email)
                }
                else {
                  console.log('Error en la respuesta:', response);
                  if (response && response.codigoError === 2) {
                    setMessage("Error al enviar el código. Intente nuevamente.")
                  } else {
                    setMessage("Error al enviar el código. Intente nuevamente.")
                  }
                  setSpinnerVisibility(HIDE)
                }
            },
            error => {
                console.error('Error en la petición:', error);
                setSpinnerVisibility(HIDE)
                setMessage("Error de conexión. Intente nuevamente.")
            }
        );
  }

  return (
      <Col xs={12} md={{ span: 6, offset: 3 }} style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
        <div className="apertura-container">
          <div className="apertura-header">
            <Typography variant="h6" style={{ color: 'white', fontWeight: 'bold' }}>
              Apertura de cuenta
            </Typography>
          </div>
          <div className="apertura-content">
                <Typography variant="h6" paragraph={true} style={{ fontWeight: 'bold', color: '#333', marginBottom: '15px' }}>
                  ¡Comencemos!
                </Typography>
            <Typography variant="body2" style={{ color: '#333', marginBottom: '7px' }}>
              Ingresá tu correo para iniciar o continuar la apertura de la cuenta
            </Typography>
          <Container spacing={2}>
                <Col className="text-center">
                  <form onSubmit={onSubmit}>
                    <TextField
                      autoComplete="email"
                      fullWidth
                      label="Email"
                      margin="normal"
                      name="email"
                      required
                      variant="outlined"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      type="email"
                    />
                    <Row>
                      <Col className="pt-3 pb-3">
                        <Button
                          style={{ backgroundColor: 'var(--main-green)', color: '#fff' , width: '50%'}}
                          type="submit"
                          variant="contained"
                          fullWidth
                        >
                          Iniciar 
                        </Button>
                      </Col>
                    </Row>                       
                    <Row className={spinnerVisibility}>
                      <Col>
                        <CircularProgress color="secondary" />
                      </Col>
                    </Row>
                  </form>
                      <Typography variant="body2">{message}</Typography>
                </Col>
          </Container>
          </div>
        </div>
      </Col>
)    
}

RegisterBox.propTypes = {}

export default RegisterBox