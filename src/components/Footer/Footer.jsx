import React from "react"
import { Container, Row, Col } from "react-bootstrap"
import { Typography, Button, Divider } from "@material-ui/core"
import logo from "../../images/logo_blanco.png"
import LinkedinIcon from "@material-ui/icons/LinkedIn"
import { Link } from "react-router-dom"

export const DealFooter = () => {
  return (
    <>
      <div className="deal-footer regular-foot d-none d-md-block">
        <Container>
          <Row className="pt-5 pb-5">
            <Col xs={12} sm={6} md={3}>
              <img src={logo} alt="logo" className="mb-3" />
              <Typography variant="body2" style={{ fontSize: '11px', paddingBottom: '10px'}}>Sede social: Tte. Gral. Juan Domingo Perón 646 piso 4, C1038AAN, CABA</Typography>
              <Typography variant="body2" style={{ fontSize: '11px'}}>Sede operativa: Carlos Pellegrini 989 piso 10, C1009ABS,CABA</Typography>
            </Col>
      
            <Col xs={12} sm={6} md={3}>
                <h5>Páginas</h5>
                <ul>
                    <li><Link to="/">Home</Link></li>
                    <li><Link to="/servicios/asset-management">Servicios</Link></li>
                    <li><Link to="/nuestrosproductos">Productos</Link></li>
                    <li><Link to="/contacto">Contacto</Link></li>
                    <li><Link to="/politicasPrivacidad">Políticas de Privacidad</Link></li>
                    <li><Link to="/codigoEticaConducta">Código de Ética y Conducta</Link></li>
                </ul>
                <h5><Link to="/comisiones">Comisiones</Link></h5>
            </Col>
            <Col xs={12} sm={3}>
              <h5>Contacto</h5>
              <ul>
                <li>
                  <a href={"https://app.stsecurities.com.ar/solicitud-cuenta.registro"}>Abrir Cuenta</a>
                </li>
                <li>
                  <a href={"https://vb-stsecurities.aunesa.com/auth/signin"}>Ingresar</a>
                </li>
                <li>
                  <a href={"https://anima.stsecurities.com.ar/"}>Operar</a>
                </li>
              </ul>
              <h7><a href={"https://www.cnv.gov.ar/SitioWeb/Denuncias"}>Denuncias CNV</a></h7>
            </Col>


            <Col xs={12} sm={6} md={3}>
                <h5>Contacto</h5>
                <ul>
                    <li><Link to="/contacto">administracion@stsecurities.com.ar</Link></li>
                </ul>
                <Divider />
                <Typography paragraph={true}>
                    Seguinos en:
                </Typography>
                <a href="https://www.linkedin.com/company/st-securities" target="_blank" rel="noreferrer"> 
                    <LinkedinIcon />
                </a>
            </Col>
            <Typography variant="body2" style={{ fontSize: '9px' }}>
            ST SECURITIES S.A.U. es un Agente de Liquidación y Compensación y Agente de Negociación Propio registrado bajo el número 524, Agente de Colocación y Distribución Integral de Fondos Comunes de Inversión registrado bajo el número 133 ACyDI y Agente de Colocación y Distribución de Fondos Comunes de Inversión registrado bajo el número 62 ACyD ante la Comisión Nacional de Valores. Miembro de Bolsas y Mercados Argentinos S.A (BYMA), dl Mercado Argentino de Valores (MAV), del Mercado Abierto Electrónico (MAE) y A3 (ex Matba Rofex).
            </Typography>
          </Row>
        </Container>
      </div>
    </>
  )
}