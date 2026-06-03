import React, { useState, useEffect, useCallback } from 'react';
import { Package, Settings, Truck, CheckCircle2, LayoutDashboard, PlusCircle, Wifi } from 'lucide-react';
import { pedidosService } from '../services/api';
import { useWebSocket } from '../hooks/useWebSocket';
import { StatusBadge, TimelineStatus } from '../components/StatusBadge';

// Nimbus Sidebar Nav
function Sidebar({ activePage }) {
  return (
    <aside style={{
      width: 220,
      minHeight: '100vh',
      backgroundColor: 'var(--nb-neutral-800)',
      display: 'flex',
      flexDirection: 'column',
      padding: '0',
      flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{
        padding: '24px 20px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            backgroundColor: 'var(--nb-blue-500)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Package size={18} color="#fff" strokeWidth={2} />
          </div>
          <div>
            <div style={{ color: '#fff', fontWeight: 800, fontSize: 15, lineHeight: 1 }}>TrackLog</div>
            <div style={{ color: 'var(--nb-neutral-400)', fontSize: 11, marginTop: 2 }}>Logística</div>
          </div>
        </div>
      </div>

      {/* Nav items */}
      <nav style={{ padding: '16px 12px', flex: 1 }}>
        {[
          { Icon: LayoutDashboard, label: 'Dashboard',  href: '/dashboard', active: activePage === 'dashboard' },
          { Icon: PlusCircle,      label: 'Novo Pedido', href: '/',          active: activePage === 'novo'      },
        ].map(item => (
          <a key={item.label} href={item.href} style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '9px 12px',
            borderRadius: 'var(--nb-radius-md)',
            marginBottom: 2,
            fontSize: 14,
            fontWeight: item.active ? 700 : 500,
            color: item.active ? '#fff' : 'var(--nb-neutral-400)',
            backgroundColor: item.active ? 'var(--nb-blue-600)' : 'transparent',
            textDecoration: 'none',
            transition: 'all 0.15s ease',
          }}>
            <item.Icon size={16} strokeWidth={2} />
            {item.label}
          </a>
        ))}
      </nav>

      {/* WS Status */}
      <div style={{
        padding: '16px 20px',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}>
        <Wifi size={14} color="var(--nb-green-500)" strokeWidth={2} />
        <span style={{ fontSize: 12, color: 'var(--nb-neutral-400)', fontFamily: 'var(--nb-font-mono)' }}>
          WebSocket ativo
        </span>
      </div>
    </aside>
  );
}

// Metric Card
function MetricCard({ label, valor, cor, Icon }) {
  return (
    <div style={{
      backgroundColor: 'var(--nb-neutral-0)',
      border: '1px solid var(--nb-neutral-200)',
      borderRadius: 'var(--nb-radius-lg)',
      padding: '20px 24px',
      boxShadow: 'var(--nb-shadow-sm)',
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span style={{ fontSize: 28, fontWeight: 800, color: cor, lineHeight: 1 }}>{valor}</span>
        <Icon size={20} color={cor} strokeWidth={2} style={{ opacity: 0.7 }} />
      </div>
      <span style={{ fontSize: 13, color: 'var(--nb-neutral-400)', fontWeight: 600, marginTop: 4 }}>{label}</span>
    </div>
  );
}

// Main Dashboard
export function Dashboard() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pedidoSelecionado, setPedidoSelecionado] = useState(null);
  const [notificacoes, setNotificacoes] = useState([]);

  const carregarPedidos = useCallback(async () => {
    try {
      const dados = await pedidosService.listar();
      setPedidos(dados);
    } catch (err) {
      console.error('Erro ao carregar pedidos:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleStatusAtualizado = useCallback((evento) => {
    setPedidos(prev =>
      prev.map(p => p.id === evento.pedidoId ? { ...p, status: evento.novoStatus } : p)
    );
    setPedidoSelecionado(prev =>
      prev && prev.id === evento.pedidoId ? { ...prev, status: evento.novoStatus } : prev
    );
    const nova = { id: Date.now(), ...evento };
    setNotificacoes(prev => [nova, ...prev.slice(0, 4)]);
    setTimeout(() => {
      setNotificacoes(prev => prev.filter(n => n.id !== nova.id));
    }, 4000);
  }, []);

  useWebSocket(handleStatusAtualizado);

  useEffect(() => {
    carregarPedidos();
    const intervalo = setInterval(carregarPedidos, 30000);
    return () => clearInterval(intervalo);
  }, [carregarPedidos]);

  const contadores = {
    total:       pedidos.length,
    processando: pedidos.filter(p => p.status === 'PROCESSANDO').length,
    enviado:     pedidos.filter(p => p.status === 'ENVIADO').length,
    entregue:    pedidos.filter(p => p.status === 'ENTREGUE').length,
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--nb-neutral-50)' }}>
      <Sidebar activePage="dashboard" />

      {/* Main content */}
      <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
        {/* Page header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--nb-neutral-800)', margin: 0 }}>
            Dashboard
          </h1>
          <p style={{ fontSize: 14, color: 'var(--nb-neutral-400)', marginTop: 4 }}>
            Rastreamento de pedidos em tempo real
          </p>
        </div>

        {/* Metric cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 16,
          marginBottom: 28,
        }}>
          <MetricCard label="Total de Pedidos"  valor={contadores.total}       cor="var(--nb-neutral-700)" Icon={Package}      />
          <MetricCard label="Processando"       valor={contadores.processando} cor="var(--nb-yellow-600)"  Icon={Settings}     />
          <MetricCard label="A Caminho"         valor={contadores.enviado}     cor="var(--nb-blue-600)"    Icon={Truck}        />
          <MetricCard label="Entregues"         valor={contadores.entregue}    cor="var(--nb-green-600)"   Icon={CheckCircle2} />
        </div>

        {/* Content grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20 }}>

          {/* Orders table */}
          <div style={{
            backgroundColor: 'var(--nb-neutral-0)',
            border: '1px solid var(--nb-neutral-200)',
            borderRadius: 'var(--nb-radius-lg)',
            boxShadow: 'var(--nb-shadow-sm)',
            overflow: 'hidden',
          }}>
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid var(--nb-neutral-100)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--nb-neutral-700)' }}>
                Pedidos
              </span>
              <span style={{
                fontSize: 12, color: 'var(--nb-neutral-400)',
                fontFamily: 'var(--nb-font-mono)',
              }}>
                {pedidos.length} registros
              </span>
            </div>

            {loading ? (
              <div style={{ padding: 48, textAlign: 'center', color: 'var(--nb-neutral-400)' }}>
                Carregando pedidos...
              </div>
            ) : pedidos.length === 0 ? (
              <div style={{ padding: 48, textAlign: 'center', color: 'var(--nb-neutral-400)' }}>
                Nenhum pedido encontrado.
              </div>
            ) : (
              <div>
                {/* Table header */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '80px 1fr 180px 120px',
                  padding: '10px 20px',
                  backgroundColor: 'var(--nb-neutral-50)',
                  borderBottom: '1px solid var(--nb-neutral-100)',
                  fontSize: 11,
                  fontWeight: 700,
                  color: 'var(--nb-neutral-400)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}>
                  <span>ID</span>
                  <span>Produto</span>
                  <span>Cliente</span>
                  <span>Status</span>
                </div>

                {pedidos.map((pedido, idx) => (
                  <div
                    key={pedido.id}
                    onClick={() => setPedidoSelecionado(pedido)}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '80px 1fr 180px 120px',
                      padding: '13px 20px',
                      borderBottom: idx < pedidos.length - 1 ? '1px solid var(--nb-neutral-100)' : 'none',
                      cursor: 'pointer',
                      backgroundColor: pedidoSelecionado?.id === pedido.id
                        ? 'var(--nb-blue-100)'
                        : 'transparent',
                      transition: 'background-color 0.15s ease',
                      alignItems: 'center',
                    }}
                  >
                    <span style={{
                      fontFamily: 'var(--nb-font-mono)',
                      fontSize: 13,
                      fontWeight: 600,
                      color: 'var(--nb-blue-600)',
                    }}>
                      #{String(pedido.id).padStart(4, '0')}
                    </span>
                    <span style={{ fontSize: 14, color: 'var(--nb-neutral-700)', fontWeight: 500, paddingRight: 12 }}>
                      {pedido.descricao}
                    </span>
                    <span style={{ fontSize: 13, color: 'var(--nb-neutral-500)', paddingRight: 12 }}>
                      {pedido.nomeUsuario || `Usuário #${pedido.usuarioId}`}
                    </span>
                    <StatusBadge status={pedido.status} animado />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Detail panel */}
          <div style={{
            backgroundColor: 'var(--nb-neutral-0)',
            border: '1px solid var(--nb-neutral-200)',
            borderRadius: 'var(--nb-radius-lg)',
            boxShadow: 'var(--nb-shadow-sm)',
            overflow: 'hidden',
            height: 'fit-content',
          }}>
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid var(--nb-neutral-100)',
            }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--nb-neutral-700)' }}>
                Detalhes do Pedido
              </span>
            </div>

            {pedidoSelecionado ? (
              <div style={{ padding: 20 }}>
                <div style={{ marginBottom: 4 }}>
                  <span style={{
                    fontFamily: 'var(--nb-font-mono)',
                    fontSize: 13,
                    fontWeight: 700,
                    color: 'var(--nb-blue-600)',
                  }}>
                    #{String(pedidoSelecionado.id).padStart(4, '0')}
                  </span>
                </div>

                <TimelineStatus statusAtual={pedidoSelecionado.status} />

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 8 }}>
                  {[
                    { label: 'Produto',      valor: pedidoSelecionado.descricao },
                    { label: 'Endereço',     valor: pedidoSelecionado.enderecoEntrega },
                    { label: 'Status atual', valor: <StatusBadge status={pedidoSelecionado.status} animado /> },
                    { label: 'Criado em',   valor: new Date(pedidoSelecionado.criadoEm).toLocaleString('pt-BR') },
                  ].map(({ label, valor }) => (
                    <div key={label} style={{
                      borderBottom: '1px solid var(--nb-neutral-100)',
                      paddingBottom: 12,
                    }}>
                      <div style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: 'var(--nb-neutral-400)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        marginBottom: 4,
                      }}>{label}</div>
                      <div style={{ fontSize: 14, color: 'var(--nb-neutral-700)', fontWeight: 500 }}>
                        {valor}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
                padding: '48px 24px',
                color: 'var(--nb-neutral-400)',
                textAlign: 'center',
              }}>
                <span style={{ fontSize: 40 }}>📋</span>
                <p style={{ fontSize: 14, lineHeight: 1.5 }}>
                  Selecione um pedido<br />para ver os detalhes
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Toast notifications */}
      <div style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        zIndex: 1000,
      }}>
        {notificacoes.map(n => (
          <div key={n.id} style={{
            backgroundColor: 'var(--nb-neutral-800)',
            border: '1px solid var(--nb-neutral-600)',
            borderRadius: 'var(--nb-radius-md)',
            padding: '10px 16px',
            display: 'flex',
            gap: 10,
            alignItems: 'center',
            animation: 'slideIn 0.25s ease',
            boxShadow: 'var(--nb-shadow-lg)',
            minWidth: 260,
          }}>
            <span style={{
              fontFamily: 'var(--nb-font-mono)',
              fontSize: 12,
              color: 'var(--nb-blue-300)',
              fontWeight: 600,
            }}>
              #{String(n.pedidoId).padStart(4, '0')}
            </span>
            <span style={{ fontSize: 13, color: 'var(--nb-neutral-200)' }}>
              {n.mensagem || `→ ${n.novoStatus}`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
