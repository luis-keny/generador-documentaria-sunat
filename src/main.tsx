import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from "react-router";

import './index.css'

import { Dashboard } from '@/layout/dashboard.tsx';
import { Documentos } from '@/pages/dashboard/documentacion/documentos';
// import { TipoDocumento } from '@/pages/dashboard/documentacion/tipo-documento';
import { EmitirDocumento } from '@/pages/dashboard/documentacion/emitir-documento/emitir-documento';
import { NotFound } from './pages/not-found';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route index element={<Navigate to={'dashboard'} replace />} />
        <Route path="dashboard" element={<Dashboard />}>
          <Route index element={<Navigate to={'documentos'} replace />} />
          <Route path="documentos" element={<Documentos />} />
          {/* <Route path="documentos/nuevo" element={<TipoDocumento />} /> */}
          <Route path="documentos/emitir" element={<EmitirDocumento />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
