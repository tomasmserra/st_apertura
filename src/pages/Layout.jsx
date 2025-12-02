import React, {useEffect, useState} from 'react'
import PropTypes from 'prop-types'
import HeaderBar from '../components/Bar'
import { Footer } from '../components/Footer'
import ProtectedRoute from '../components/ProtectedRoute'
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import { Container, Col, Row } from 'react-bootstrap'
import NotFound from './NotFoundPage'
import RegisterPage from './Registro/RegisterPage'
import TipoAperturaPage from './Apertura/TipoAperturaPage'
import ValidarCodigoPage from './ValidarCodigo/ValidarCodigoPage'
import DatosPrincipalesPage from './Apertura/Individuo/DatosPrincipalesPage'
import DatosPersonalesPage from './Apertura/Individuo/DatosPersonalesPage'
import DomicilioPage from './Apertura/Individuo/DomicilioPage'
import DatosFiscalesPage from './Apertura/Individuo/DatosFiscalesPage'
import DatosFiscalesExteriorPage from './Apertura/Individuo/DatosFiscalesExteriorPage'
import CuentasBancariasPage from './Apertura/Individuo/CuentasBancariasPage'
import CuentasBancariasExteriorPage from './Apertura/Individuo/CuentasBancariasExteriorPage'
import DeclaracionesPage from './Apertura/Individuo/DeclaracionesPage'
import PerfilInversorPage from './Apertura/Individuo/PerfilInversorPage'
import DeclaracionIngresosPage from './Apertura/Individuo/DeclaracionIngresosPage'
import TerminosCondicionesPage from './Apertura/Individuo/TerminosCondicionesPage'
import DocumentoPdfPage from './Apertura/Individuo/DocumentoPdfPage'
import CoTitularesIndividuoPage from './Apertura/Individuo/CoTitularesPage'
import FinAperturaPage from './Apertura/FinAperturaPage'
import DatosPrincipalesEmpresaPage from './Apertura/Empresa/DatosPrincipalesPage'
import DatosOrganizacionEmpresaPage from './Apertura/Empresa/DatosOrganizacionPage'
import DomicilioEmpresaPage from './Apertura/Empresa/DomicilioPage'
import DatosFiscalesEmpresaPage from './Apertura/Empresa/DatosFiscalesPage'
import DatosFiscalesExteriorEmpresaPage from './Apertura/Empresa/DatosFiscalesExteriorPage'
import RegistroEmpresaPage from './Apertura/Empresa/RegistroPage'
import CuentasBancariasEmpresaPage from './Apertura/Empresa/CuentasBancariasPage'
import CuentasBancariasExteriorEmpresaPage from './Apertura/Empresa/CuentasBancariasExteriorPage'
import DeclaracionesEmpresaPage from './Apertura/Empresa/DeclaracionesPage'
import PerfilInversorEmpresaPage from './Apertura/Empresa/PerfilInversorPage'
import DocumentacionRespaldatoriaEmpresaPage from './Apertura/Empresa/DocumentacionRespaldatoriaPage'
import TerminosCondicionesEmpresaPage from './Apertura/Empresa/TerminosCondicionesPage'
import FirmantesEmpresaPage from './Apertura/Empresa/FirmantesPage'
import AccionistasEmpresaPage from './Apertura/Empresa/AccionistasPage'
import { CssBaseline } from '@material-ui/core';

import { BrowserRouter as Router,
        Switch,
        Route } from 'react-router-dom'
import { authenticationService } from '../services';


const theme = createMuiTheme({
    typography: {
      fontFamily: [
        '"Inter"',
        '"Roboto"',
        '"Helvetica"',
        '"Arial"',
        'sans-serif',
      ].join(','),
    },
  });

const Layout = props => {

    const [loggedIn, setLoggedIn] = useState(false)

    const evaluarSesion = () => {
        const isLoggedIn = localStorage.getItem("token") !== null && 
                          authenticationService.checkSessionValidity()
        setLoggedIn(isLoggedIn)
    }

    useEffect(() => {
        evaluarSesion()
    }, [])

    return (
        <>
            <ThemeProvider theme={theme}>
            <CssBaseline />
            <Router>
              <HeaderBar loggedIn={loggedIn} evaluarSesion={evaluarSesion}></HeaderBar>
              <Container className="pb-4">
                  <Switch>
                    <Route exact path="/" component={RegisterPage}></Route>
                    <Route exact path="/validar-codigo/:email" component={ValidarCodigoPage}></Route>
                    <ProtectedRoute exact path="/tipo-apertura" component={TipoAperturaPage} />
                        <ProtectedRoute exact path="/apertura/individuo/datos-principales" component={DatosPrincipalesPage} />
                        <ProtectedRoute exact path="/apertura/individuo/datos-personales" component={DatosPersonalesPage} />
                        <ProtectedRoute exact path="/apertura/individuo/domicilio" component={DomicilioPage} />
                        <ProtectedRoute exact path="/apertura/individuo/datos-fiscales" component={DatosFiscalesPage} />
                        <ProtectedRoute exact path="/apertura/individuo/datos-fiscales-exterior" component={DatosFiscalesExteriorPage} />
                        <ProtectedRoute exact path="/apertura/individuo/cuentas-bancarias" component={CuentasBancariasPage} />
                        <ProtectedRoute exact path="/apertura/individuo/cuentas-bancarias-exterior" component={CuentasBancariasExteriorPage} />
                        <ProtectedRoute exact path="/apertura/individuo/declaraciones" component={DeclaracionesPage} />
                        <ProtectedRoute exact path="/apertura/individuo/perfil-inversor" component={PerfilInversorPage} />
                        <ProtectedRoute exact path="/apertura/individuo/declaracion-ingresos" component={DeclaracionIngresosPage} />
                        <ProtectedRoute exact path="/apertura/individuo/terminos-condiciones" component={TerminosCondicionesPage} />
                        <ProtectedRoute exact path="/apertura/cotitulares" component={CoTitularesIndividuoPage} />
                        <ProtectedRoute exact path="/apertura/fin" component={FinAperturaPage} />
                        <ProtectedRoute exact path="/apertura/documento/:documento" component={DocumentoPdfPage} />
                        <ProtectedRoute exact path="/apertura/empresa/datos-principales" component={DatosPrincipalesEmpresaPage} />
                        <ProtectedRoute exact path="/apertura/empresa/datos-organizacion" component={DatosOrganizacionEmpresaPage} />
                        <ProtectedRoute exact path="/apertura/empresa/domicilio" component={DomicilioEmpresaPage} />
                        <ProtectedRoute exact path="/apertura/empresa/datos-fiscales" component={DatosFiscalesEmpresaPage} />
                        <ProtectedRoute exact path="/apertura/empresa/datos-fiscales-exterior" component={DatosFiscalesExteriorEmpresaPage} />
                        <ProtectedRoute exact path="/apertura/empresa/registro" component={RegistroEmpresaPage} />
                        <ProtectedRoute exact path="/apertura/empresa/cuentas-bancarias" component={CuentasBancariasEmpresaPage} />
                        <ProtectedRoute exact path="/apertura/empresa/cuentas-bancarias-exterior" component={CuentasBancariasExteriorEmpresaPage} />
                        <ProtectedRoute exact path="/apertura/empresa/declaraciones" component={DeclaracionesEmpresaPage} />
                        <ProtectedRoute exact path="/apertura/empresa/perfil-inversor" component={PerfilInversorEmpresaPage} />
                        <ProtectedRoute exact path="/apertura/empresa/documentacion-respaldatoria" component={DocumentacionRespaldatoriaEmpresaPage} />
                        <ProtectedRoute exact path="/apertura/empresa/accionistas" component={AccionistasEmpresaPage} />
                        <ProtectedRoute exact path="/apertura/empresa/terminos-condiciones" component={TerminosCondicionesEmpresaPage} />
                        <ProtectedRoute exact path="/apertura/empresa/firmantes" component={FirmantesEmpresaPage} />
                    
                    <Route>
                      <Col>
                        <NotFound></NotFound>
                      </Col>
                    </Route>
                  </Switch>
            </Container> 
            <Footer />
          </Router>


        </ThemeProvider>
        </>
    )
}

Layout.propTypes = {

}

export default Layout
