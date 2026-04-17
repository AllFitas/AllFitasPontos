import React from 'react';
import { motion } from 'framer-motion';
import { Settings, User, Bell, Shield, Database, Trash2, Save } from 'lucide-react';

const SettingsPage = () => {
  const settingsSections = [
    {
      title: 'Configurações do Perfil',
      icon: User,
      fields: [
        { label: 'Nome da Empresa', value: 'All Fitas Manufatura', type: 'text' },
        { label: 'E-mail Administrador', value: 'admin@allfitas.com.br', type: 'email' }
      ]
    },
    {
      title: 'Sistema de Fidelidade',
      icon: Database,
      fields: [
        { label: 'Validade dos Pontos (dias)', value: '30', type: 'number' },
        { label: 'Valor da Conversão (1 R$ = X Pontos)', value: '1', type: 'number' }
      ]
    },
    {
      title: 'Segurança & Dados',
      icon: Shield,
      actions: [
        { label: 'Exportar Banco de Dados (Backup)', variant: 'ghost', icon: Database },
        { label: 'Limpar Cache do Navegador', variant: 'error', icon: Trash2 }
      ]
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="space-y-12 pb-20"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 no-print">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-2 h-8 bg-primary rounded-full shadow-[0_0_20px_var(--primary-glow)]" />
            <h2 className="text-5xl font-black tracking-[-0.05em] text-white">Configurações</h2>
          </div>
          <p className="text-xs text-text-muted font-bold uppercase tracking-[0.3em] opacity-80 flex items-center gap-2">
            <div className="w-1 h-1 rounded-full bg-primary" />
            Gerenciamento de Preferências e Sistema
          </p>
        </div>
        <button className="btn btn-primary px-10 py-4 h-fit shadow-2xl shadow-primary/10">
          <Save size={18} className="mr-2" /> Salvar Alterações
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {settingsSections.map((section, idx) => (
          <div key={idx} className="glass-card !p-10 space-y-8 group">
            <div className="flex items-center gap-4 border-b border-white/5 pb-6">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/20 group-hover:text-primary group-hover:bg-primary/10 transition-all duration-500">
                <section.icon size={24} />
              </div>
              <h3 className="text-lg font-black text-white">{section.title}</h3>
            </div>

            {section.fields && (
              <div className="space-y-6">
                {section.fields.map((field, fIdx) => (
                  <div key={fIdx} className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.25em] text-text-muted">{field.label}</label>
                    <input 
                      type={field.type} 
                      defaultValue={field.value}
                      className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-6 py-4 text-sm font-bold text-white focus:outline-none focus:border-primary focus:bg-white/[0.06] transition-all"
                    />
                  </div>
                ))}
              </div>
            )}

            {section.actions && (
              <div className="flex flex-col gap-4 pt-4">
                {section.actions.map((action, aIdx) => (
                  <button 
                    key={aIdx} 
                    className={`btn w-full justify-start px-6 py-4 rounded-2xl text-[12px] font-black uppercase tracking-widest transition-all ${
                      action.variant === 'error' 
                        ? 'border-error/20 text-error hover:bg-error/10' 
                        : 'border-white/5 text-text-muted hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <action.icon size={18} className="mr-3" /> {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default SettingsPage;
