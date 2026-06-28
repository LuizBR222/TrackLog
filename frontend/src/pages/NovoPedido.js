import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Send, CheckCircle, ArrowRight, XCircle } from 'lucide-react';
import { pedidosService, usuariosService } from '../services/api';
import { useWebSocket } from '../hooks/useWebSocket';
import { TimelineStatus } from '../components/StatusBadge';

// Nimbus Input
function NbInput({ label, hint, children, error }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{
        fontSize: 14,
        fontWeight: 700,
        color: 'var(--nb-neutral-700)',
      }}>{label}</label>
      {children}
      {hint && !error && (
        <span style={{ fontSize: 12, color: 'var(--nb-neutral-400)' }}>{hint}</span>
      )}
      {error && (
        <span style={{ fontSize: 12, color: 'var(--nb-red-500)', fontWeight: 500 }}>{error}</span>
      )}
    </div>
  );
}

const inputStyle = {
  backgroundColor: 'var(--nb-neutral-0)',
  border: '1px solid var(--nb-neutral-300)',
  borderRadius: 'var(--nb-radius-md)',
  padding: '10px 14px',
  color: 'var(--nb-neutral-700)',
  fontSize: 14,
  fontFamily: 'var(--nb-font)',
  width: '100%',
  transition: 'border-color 0.15s, box-shadow 0.15s',
};

export function NovoPedido() {
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState([]);
  const [form, setForm] = useState({ usuarioId: '', descricao: '', enderecoEntrega: '' });
  const [pedidoCriado, setPedidoCriado] = useState(null);
  const [statusAtual, setStatusAtual] = useState(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  const { assinarPedido } = useWebSocket((evento) => {
    if (pedidoCriado && evento.pedidoId === pedidoCriado.id) {
      setStatusAtual(evento.novoStatus);
    }
  });

  useEffect(() => {
    usuariosService.listar().then(setUsuarios).catch(console.error);
  }, []);

  useEffect(() => {
    if (pedidoCriado) {
      assinarPedido(pedidoCriado.id);
      setStatusAtual(pedidoCriado.status);
    }
  }, [pedidoCriado, assinarPedido]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.usuarioId || !form.descricao || !form.enderecoEntrega) {
      setErro('Preencha todos os campos antes de continuar.');
      return;
    }
    setLoading(true);
    setErro('');
    try {
      const pedido = await pedidosService.criar({
        usuarioId: Number(form.usuarioId),
        descricao: form.descricao,
        enderecoEntrega: form.enderecoEntrega,
      });
      setPedidoCriado(pedido);
    } catch (err) {
      setErro('Não foi possível criar o pedido. Verifique o servidor.');
    } finally {
      setLoading(false);
    }
  };

  // Success state
  if (pedidoCriado) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: 'var(--nb-neutral-50)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        fontFamily: 'var(--nb-font)',
        animation: 'fadeUp 0.3s ease',
      }}>
        <div style={{
          backgroundColor: 'var(--nb-neutral-0)',
          border: '1px solid var(--nb-neutral-200)',
          borderRadius: 'var(--nb-radius-lg)',
          padding: '40px 48px',
          width: '100%',
          maxWidth: 520,
          boxShadow: 'var(--nb-shadow-md)',
        }}>
          {/* Success header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 24,
            padding: '14px 16px',
            backgroundColor: 'var(--nb-green-100)',
            borderRadius: 'var(--nb-radius-md)',
            border: '1px solid #0FA95840',
          }}>
            <CheckCircle size={22} color="var(--nb-green-500)" strokeWidth={2} />
            <div>
              <div style={{ fontWeight: 700, color: 'var(--nb-green-600)', fontSize: 15 }}>
                Pedido #{String(pedidoCriado.id).padStart(4, '0')} criado com sucesso!
              </div>
              <div style={{ fontSize: 13, color: 'var(--nb-green-500)', marginTop: 2 }}>
                Mensagem publicada no tópico Kafka
              </div>
            </div>
          </div>

          <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--nb-neutral-500)', marginBottom: 8 }}>
            Acompanhe o status em tempo real
          </h3>

          <TimelineStatus statusAtual={statusAtual || 'PENDENTE'} />

          {/* Kafka info */}
          <div style={{
            backgroundColor: 'var(--nb-neutral-50)',
            border: '1px solid var(--nb-neutral-200)',
            borderRadius: 'var(--nb-radius-md)',
            padding: '12px 16px',
            display: 'flex',
            gap: 10,
            alignItems: 'flex-start',
            marginTop: 8,
            marginBottom: 24,
          }}>
            <span style={{
              backgroundColor: 'var(--nb-yellow-100)',
              color: 'var(--nb-yellow-600)',
              border: '1px solid #F5A62330',
              borderRadius: 4,
              padding: '2px 8px',
              fontSize: 11,
              fontFamily: 'var(--nb-font-mono)',
              fontWeight: 700,
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}>⚡ KAFKA</span>
            <span style={{ fontSize: 13, color: 'var(--nb-neutral-500)', lineHeight: 1.5 }}>
              O worker está consumindo o tópico{' '}
              <code style={{
                backgroundColor: 'var(--nb-neutral-100)',
                border: '1px solid var(--nb-neutral-200)',
                padding: '1px 6px',
                borderRadius: 4,
                fontFamily: 'var(--nb-font-mono)',
                fontSize: 12,
                color: 'var(--nb-blue-600)',
              }}>pedidos</code>
              {' '}de forma assíncrona.
            </span>
          </div>

          {statusAtual === 'ENTREGUE' && (
            <div style={{
              textAlign: 'center',
              fontSize: 15,
              color: 'var(--nb-green-600)',
              fontWeight: 700,
              padding: '12px',
              backgroundColor: 'var(--nb-green-100)',
              borderRadius: 'var(--nb-radius-md)',
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}>
              <CheckCircle size={18} color="var(--nb-green-600)" strokeWidth={2.5} />
              Pedido entregue com sucesso!
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={() => {
                setPedidoCriado(null);
                setStatusAtual(null);
                setForm({ usuarioId: '', descricao: '', enderecoEntrega: '' });
              }}
              style={{
                flex: 1,
                backgroundColor: 'var(--nb-neutral-0)',
                color: 'var(--nb-neutral-600)',
                border: '1px solid var(--nb-neutral-300)',
                borderRadius: 'var(--nb-radius-md)',
                padding: '11px',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'var(--nb-font)',
              }}>
              Novo Pedido
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              style={{
                flex: 1,
                backgroundColor: 'var(--nb-blue-500)',
                color: '#fff',
                border: 'none',
                borderRadius: 'var(--nb-radius-md)',
                padding: '11px',
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'var(--nb-font)',
              }}>
              Ver Dashboard <ArrowRight size={14} style={{ display: 'inline', marginLeft: 4 }} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Form state
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--nb-neutral-50)',
      display: 'flex',
      fontFamily: 'var(--nb-font)',
    }}>
      {/* Left panel — branding */}
      <div style={{
        width: 340,
        backgroundColor: 'var(--nb-blue-600)',
        padding: '48px 40px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 48 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 8,
              backgroundColor: 'rgba(255,255,255,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Package size={20} color="#fff" strokeWidth={2} />
            </div>
            <span style={{ color: '#fff', fontWeight: 800, fontSize: 18 }}>TrackLog</span>
          </div>

          <h2 style={{ color: '#fff', fontSize: 26, fontWeight: 800, lineHeight: 1.3, marginBottom: 12 }}>
            Gestão de pedidos<br />em tempo real
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 15, lineHeight: 1.6 }}>
            Pedidos processados de forma assíncrona via Kafka, com atualizações instantâneas via WebSocket.
          </p>
        </div>

        {/* Flow diagram */}
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.08)',
          borderRadius: 'var(--nb-radius-md)',
          padding: '16px 20px',
          border: '1px solid rgba(255,255,255,0.15)',
        }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--nb-font-mono)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Fluxo assíncrono
          </div>
          {['API REST', 'Kafka', 'Worker', 'WebSocket', 'Interface'].map((step, i, arr) => (
            <div key={step} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 28, height: 28,
                borderRadius: 6,
                backgroundColor: 'rgba(255,255,255,0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontFamily: 'var(--nb-font-mono)', color: '#fff', fontWeight: 700,
              }}>
                {i + 1}
              </div>
              <span style={{ fontSize: 13, color: '#fff', fontWeight: 600 }}>{step}</span>
              {i < arr.length - 1 && (
                <div style={{
                  marginLeft: 'auto',
                  marginRight: 0,
                  fontSize: 11,
                  color: 'rgba(255,255,255,0.4)',
                }}>↓</div>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={() => navigate('/dashboard')}
          style={{
            background: 'none', border: 'none',
            color: 'rgba(255,255,255,0.55)',
            cursor: 'pointer', fontSize: 13,
            fontFamily: 'var(--nb-font)',
            textAlign: 'left',
            padding: 0,
          }}>
          → Ver Dashboard Admin
        </button>
      </div>

      {/* Right panel — form */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 40px',
      }}>
        <div style={{ width: '100%', maxWidth: 440 }}>
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--nb-neutral-800)', margin: 0 }}>
              Novo pedido
            </h1>
            <p style={{ fontSize: 14, color: 'var(--nb-neutral-400)', marginTop: 6 }}>
              Preencha os dados para iniciar o processamento
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <NbInput label="Cliente">
              <select
                style={inputStyle}
                value={form.usuarioId}
                onChange={e => setForm(f => ({ ...f, usuarioId: e.target.value }))}
              >
                <option value="">Selecione um cliente...</option>
                {usuarios.map(u => (
                  <option key={u.id} value={u.id}>{u.nome} — {u.email}</option>
                ))}
              </select>
            </NbInput>

            <NbInput label="Descrição do produto" hint="Ex: Notebook Dell XPS 13, Smartphone Galaxy S24">
              <input
                style={inputStyle}
                type="text"
                placeholder="Descreva o produto..."
                value={form.descricao}
                onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))}
              />
            </NbInput>

            <NbInput label="Endereço de entrega" hint="Rua, número, cidade e estado">
              <input
                style={inputStyle}
                type="text"
                placeholder="Ex: Rua das Flores, 123 — Palmas, TO"
                value={form.enderecoEntrega}
                onChange={e => setForm(f => ({ ...f, enderecoEntrega: e.target.value }))}
              />
            </NbInput>

            {erro && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 14px',
                backgroundColor: 'var(--nb-red-100)',
                border: '1px solid #E53E3E40',
                borderRadius: 'var(--nb-radius-md)',
                fontSize: 13,
                color: 'var(--nb-red-600)',
                fontWeight: 500,
              }}>
                <XCircle size={15} color="var(--nb-red-500)" strokeWidth={2} />
                {erro}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                backgroundColor: loading ? 'var(--nb-blue-300)' : 'var(--nb-blue-500)',
                color: '#fff',
                border: 'none',
                borderRadius: 'var(--nb-radius-md)',
                padding: '12px',
                fontSize: 15,
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'var(--nb-font)',
                marginTop: 4,
                transition: 'background-color 0.15s',
              }}>
              {loading
                ? <><Send size={15} style={{ marginRight: 8, display: 'inline' }} />Enviando para Kafka...</>
                : <><Send size={15} style={{ marginRight: 8, display: 'inline' }} />Criar Pedido</>
              }
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
