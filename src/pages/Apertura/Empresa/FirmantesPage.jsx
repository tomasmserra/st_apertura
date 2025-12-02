import React from 'react';
import CoTitularesPage from '../CoTitularesPage';

const FirmantesPage = () => (
  <CoTitularesPage
    title="Firmantes"
    entitySingular="Firmante"
    entityPlural="Firmantes"
    addButtonLabel="Agregar Firmante"
    addTitle="Agregar Firmante"
    editTitle="Editar Firmante"
    saveButtonLabel="Guardar Firmante"
    emptyStateMessage={'Aún no registraste firmantes. Utilizá el botón "Agregar Firmante" para comenzar.'}
    tipoFirmante="FIRMANTE"
    finalizeButtonLabel="Finalizar"
    finalizePath="/apertura/empresa/terminos-condiciones"
    backPath="/apertura/empresa/accionistas"
  />
);

export default FirmantesPage;
