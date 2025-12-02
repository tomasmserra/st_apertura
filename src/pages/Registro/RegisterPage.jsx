import React, {useEffect} from 'react'
import PropTypes from 'prop-types'
import RegisterBox from '../../components/RegisterBox'
import { useHistory } from "react-router-dom";
import { Container, Row, Col } from 'react-bootstrap';

const RegisterPage = props => {
  let history = useHistory();
  
  useEffect(() => {
      const token = localStorage.getItem("token");
      if (token) {
        // Verificar si la sesión es válida antes de redirigir
        const { authenticationService } = require('../../services');
        if (authenticationService.checkSessionValidity()) {
          history.push('/tipo-apertura');
        }
      }
    }, [history])

    return (
      <Container fluid style={{ minHeight: 'calc(100vh - 200px)', paddingTop: '4rem', paddingBottom: '4rem' }}>
        <Row className="justify-content-center align-items-center" style={{ minHeight: '100%' }}>
          <Col xs={12}>
            <RegisterBox></RegisterBox>
          </Col>
        </Row>
      </Container>
    )
}

RegisterPage.propTypes = {

}

export default RegisterPage
