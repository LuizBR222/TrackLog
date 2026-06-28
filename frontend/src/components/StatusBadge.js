import React from 'react';
import { ClipboardList, Settings, Truck, CheckCircle2, XCircle } from 'lucide-react';

const CONFIG_STATUS = {
  PENDENTE:    { label: 'Pendente',    cor: 'var(--nb-neutral-500)', bg: 'var(--nb-neutral-100)', border: 'var(--nb-neutral-300)', dot: '#8896AB', Icon: ClipboardList },
  PROCESSANDO: { label: 'Processando', cor: 'var(--nb-yellow-600)',  bg: 'var(--nb-yellow-100)',  border: '#F5A62340',             dot: '#F5A623', Icon: Settings      },
  ENVIADO:     { label: 'A Caminho',   cor: 'var(--nb-blue-700)',    bg: 'var(--nb-blue-100)',    border: 'var(--nb-blue-200)',    dot: '#1B6EF3', Icon: Truck          },
  ENTREGUE:    { label: 'Entregue',    cor: 'var(--nb-green-600)',   bg: 'var(--nb-green-100)',   border: '#0FA95840',             dot: '#0FA958', Icon: CheckCircle2   },
  FALHOU:      { label: 'Falhou',      cor: 'var(--nb-red-600)',     bg: 'var(--nb-red-100)',     border: '#E53E3E40',             dot: '#E53E3E', Icon: XCircle        },
};

export function StatusBadge({ status, animado = false }) {
  const config = CONFIG_STATUS[status] || CONFIG_STATUS.PENDENTE;

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '3px 10px',
      borderRadius: 'var(--nb-radius-full)',
      fontSize: 12,
      fontWeight: 700,
      fontFamily: 'var(--nb-font)',
      letterSpacing: '0.02em',
      color: config.cor,
      backgroundColor: config.bg,
      border: `1px solid ${config.border}`,
    }}>
      <span style={{
        width: 6,
        height: 6,
        borderRadius: '50%',
        backgroundColor: config.dot,
        display: 'inline-block',
        animation: animado && status === 'PROCESSANDO' ? 'pulsar 1.4s ease-in-out infinite' : 'none',
        flexShrink: 0,
      }} />
      {config.label}
    </span>
  );
}

export function TimelineStatus({ statusAtual }) {
  const etapas = [
    { status: 'PENDENTE',    label: 'Pedido feito' },
    { status: 'PROCESSANDO', label: 'Processando'  },
    { status: 'ENVIADO',     label: 'A caminho'    },
    { status: 'ENTREGUE',    label: 'Entregue'     },
  ];

  const ordem = ['PENDENTE', 'PROCESSANDO', 'ENVIADO', 'ENTREGUE'];
  const indexAtual = ordem.indexOf(statusAtual);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      margin: '20px 0',
      position: 'relative',
    }}>
      {etapas.map((etapa, i) => {
        const concluido = i <= indexAtual;
        const atual = i === indexAtual;
        const config = CONFIG_STATUS[etapa.status];

        return (
          <React.Fragment key={etapa.status}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              flex: 1,
              position: 'relative',
              zIndex: 1,
            }}>
              <div style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: concluido ? config.bg : 'var(--nb-neutral-100)',
                border: `2px solid ${concluido ? config.dot : 'var(--nb-neutral-200)'}`,
                fontSize: 15,
                transition: 'all 0.35s ease',
                boxShadow: atual ? `0 0 0 4px ${config.dot}20` : 'none',
              }}>
                {concluido
                  ? <config.Icon size={16} color={config.cor} strokeWidth={2.5} />
                  : <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--nb-neutral-300)', display: 'block' }} />
                }
              </div>
              <span style={{
                fontSize: 11,
                marginTop: 6,
                fontWeight: concluido ? 700 : 400,
                color: concluido ? config.cor : 'var(--nb-neutral-400)',
                textAlign: 'center',
                lineHeight: 1.3,
                maxWidth: 64,
              }}>
                {etapa.label}
              </span>
            </div>

            {i < etapas.length - 1 && (
              <div style={{
                flex: 2,
                height: 2,
                marginTop: 17,
                backgroundColor: i < indexAtual ? 'var(--nb-blue-400)' : 'var(--nb-neutral-200)',
                transition: 'background-color 0.35s ease',
              }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
