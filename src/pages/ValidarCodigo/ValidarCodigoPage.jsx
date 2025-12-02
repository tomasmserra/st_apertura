import React, { useState, useRef, useEffect } from 'react'
import PropTypes from 'prop-types'
import { useHistory, useParams } from "react-router-dom"
import { Divider, Typography, CircularProgress, Box } from '@material-ui/core'
import { Container, Col, Row } from 'react-bootstrap'
import { authenticationService } from '../../services'
import './ValidarCodigoPage.css'

const HIDE = "d-none"
const SHOW = ""

const ValidarCodigoPage = () => {
  let history = useHistory()
  let { email: emailParam } = useParams()
  const [email, setEmail] = useState('')
  const [spinnerVisibility, setSpinnerVisibility] = useState(HIDE)
  const [message, setMessage] = useState("")
  const [codigo, setCodigo] = useState(['', '', '', '', '', ''])
  const inputRefs = useRef([])

  useEffect(() => {
    if (!emailParam) {
      history.push('/')
    } else {
      // Decodificar el email en caso de que venga URL-encoded
      setEmail(decodeURIComponent(emailParam))
    }
  }, [emailParam, history])

  const handleInputChange = (index, value) => {
    // Solo permitir números y máximo 1 carácter
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newCodigo = [...codigo]
      newCodigo[index] = value
      setCodigo(newCodigo)

      // Auto-focus al siguiente input si se ingresó un dígito
      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus()
      }

      // Si se completó el código, validar automáticamente
      if (newCodigo.every(digit => digit !== '') && newCodigo.join('').length === 6) {
        handleSubmit(newCodigo.join(''))
      }
    }
  }

  const handleKeyDown = (index, e) => {
    // Si se presiona backspace y el input está vacío, ir al anterior
    if (e.key === 'Backspace' && !codigo[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleSubmit = async (codigoCompleto = null) => {
    const codigoToValidate = codigoCompleto || codigo.join('')
    
    if (codigoToValidate.length !== 6) {
      setMessage("Por favor ingrese el código completo de 6 dígitos")
      return
    }

    setSpinnerVisibility(SHOW)
    setMessage("")

    try {
      const response = await authenticationService.validateCode(email, codigoToValidate)
      console.log('Respuesta de validación:', response);
      
      // Si la respuesta es exitosa (200), redirigir independientemente del formato
      if (response && (response.exitosa === true || response.status === 200 || response.ok === true)) {
        // Redirigir a la apertura de cuenta
        history.push('/tipo-apertura')
      } else {
        console.log('Error en validación:', response);
        setMessage("Código inválido. Por favor verifique e intente nuevamente.")
        setSpinnerVisibility(HIDE)
      }
    } catch (error) {
      console.error('Error en validación:', error);
      setMessage("Error de conexión. Intente nuevamente.")
      setSpinnerVisibility(HIDE)
    }
  }

  const reenviarCodigo = async () => {
    setSpinnerVisibility(SHOW)
    setMessage("")

    try {
      const response = await authenticationService.sendVerificationCode(email)
      
      if (response.exitosa) {
        setMessage("Código reenviado exitosamente")
        setCodigo(['', '', '', '', '', ''])
        inputRefs.current[0]?.focus()
      } else {
        setMessage("Error al reenviar el código. Intente nuevamente.")
      }
      setSpinnerVisibility(HIDE)
    } catch (error) {
      setMessage("Error de conexión. Intente nuevamente.")
      setSpinnerVisibility(HIDE)
    }
  }

  return (
    <Col xs={12} md={{ span: 6, offset: 3 }}>
      <Box boxShadow={2} pb={3}>
        <Box p={2} pr={4} pl={4} bgcolor="#EFEFEF" className="text-center">
          <Typography variant="h4" paragraph={true}>Verificar Código</Typography>
          <Typography mt={2}>
            Ingrese el código de 6 dígitos que enviamos a <strong>{decodeURIComponent(email)}</strong>
          </Typography>
        </Box>
        <Container spacing={2}>
          <Col className="text-center">
            <div className="codigo-inputs">
              {codigo.map((digit, index) => (
                <input
                  key={index}
                  ref={el => inputRefs.current[index] = el}
                  type="text"
                  inputMode="numeric"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="codigo-input"
                  autoFocus={index === 0}
                />
              ))}
            </div>
            
            <Row className="pt-3 pb-3">
              <Col>
                <button
                  className="btn btn-deal-success"
                  onClick={() => handleSubmit()}
                  disabled={codigo.some(digit => digit === '')}
                >
                  Verificar Código
                </button>
              </Col>
            </Row>

            <Row className={spinnerVisibility}>
              <Col>
                <CircularProgress color="secondary" />
              </Col>
            </Row>

            <Typography variant="h6" className="error-message">{message}</Typography>

            <Row className="pt-2">
              <Col>
                <Typography variant="body2">
                  ¿No recibiste el código?{' '}
                  <button 
                    type="button" 
                    className="btn-link"
                    onClick={reenviarCodigo}
                    disabled={spinnerVisibility === SHOW}
                  >
                    Reenviar código
                  </button>
                </Typography>
              </Col>
            </Row>
          </Col>
          
          <Col xs={12} className="pt-4">
            <Divider />
            <Box mt={2} className="text-center">
              <Typography variant="h6">
                ¿Quieres cambiar el email?{' '}
                <button 
                  type="button" 
                  className="btn-link"
                  onClick={() => history.push('/')}
                >
                  Volver al registro
                </button>
              </Typography>
            </Box>
          </Col>
        </Container>
      </Box>
    </Col>
  )
}

ValidarCodigoPage.propTypes = {}

export default ValidarCodigoPage
