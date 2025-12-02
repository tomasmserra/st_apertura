import React from 'react';
import CoTitularesPage from '../CoTitularesPage';
import { firmantesService } from '../../../services';

const CoTitularesIndividuoPage = () => (
  <CoTitularesPage
    title="Co-Titulares"
    entitySingular="Co-Titular"
    entityPlural="Co-Titulares"
    addButtonLabel="Agregar Co-Titular"
    addTitle="Agregar Co-Titular"
    editTitle="Editar Co-Titular"
    saveButtonLabel="Guardar Co-Titular"
    emptyStateMessage={'Aún no registraste co-titulares. Utilizá el botón "Agregar Co-Titular" para comenzar.'}
    tipoFirmante="CO_TITULAR"
    finalizeButtonLabel="Finalizar Apertura"
    finalizePath="/apertura/fin"
    backPath="/apertura/individuo/terminos-condiciones"
    listKey="firmantes"
    fetchService={firmantesService.getFirmantes}
    createService={firmantesService.createFirmante}
    updateService={firmantesService.updateFirmante}
    deleteService={firmantesService.deleteFirmante}
  />
);

export default CoTitularesIndividuoPage;

