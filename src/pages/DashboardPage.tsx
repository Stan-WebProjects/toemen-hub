import { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Mail, Package, ArrowLeftRight, Shield, Wrench, Settings, LogOut, Sparkles } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

type DashTab = 'conversations' | 'mail' | 'products' | 'trade-ins' | 'warranty' | 'repairs' | 'settings';

const DashboardPage = () => {
  const [tab, setTab] = useState<DashTab>('conversations');
  const { profile, signOut, isSuperAdmin } = useAuth();
  const navigate = useNavigate();

  const tabs = [
    { id: 'conversations' as const, label: 'Gesprekken', icon: <MessageSquare size={18} /> },
    { id: 'mail' as const, label: 'Mail Drafts', icon: <Mail size={18} /> },
    { id: 'products' as const, label: 'Producten', icon: <Package size={18} /> },
    { id: 'trade-ins' as const, label: 'Inruil', icon: <ArrowLeftRight size={18} /> },
    { id: 'warranty' as const, label: 'Garantie', icon: <Shield size={18} /> },
    { id: 'repairs' as const, label: 'Reparaties', icon: <Wrench size={18} /> },
    { id: 'settings' as const, label: 'Instellingen', icon: <Settings size={18} /> },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 bg-primary text-primary-foreground p-4 flex flex-col shrink-0">
        <div className="flex items-center gap-3 mb-8 px-2">
          <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
            <Sparkles size={20} className="text-accent" />
          </div>
          <div>
            <h1 className="font-bold text-sm">Toemen Hub</h1>
            <p className="text-xs text-primary-foreground/50">{profile?.display_name || 'Dashboard'}</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          {tabs.map((t) => (
            <motion.button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                tab === t.id
                  ? 'bg-primary-foreground/15 text-primary-foreground'
                  : 'text-primary-foreground/50 hover:text-primary-foreground/80 hover:bg-primary-foreground/5'
              }`}
              whileTap={{ scale: 0.98 }}
            >
              {t.icon}
              {t.label}
            </motion.button>
          ))}
        </nav>

        <button
          onClick={async () => { await signOut(); navigate('/auth'); }}
          className="flex items-center gap-3 px-3 py-2.5 text-sm text-primary-foreground/40 hover:text-primary-foreground/70 mt-4"
        >
          <LogOut size={18} />
          Uitloggen
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="max-w-5xl">
          <h2 className="text-2xl font-bold text-foreground mb-1">
            {tabs.find(t => t.id === tab)?.label}
          </h2>
          <p className="text-muted-foreground text-sm mb-8">
            {tab === 'conversations' && 'Alle Jappie-gesprekken over alle kanalen.'}
            {tab === 'mail' && 'Door Jappie klaargezette e-mail concepten.'}
            {tab === 'products' && 'Productcatalogus met AI-verrijking.'}
            {tab === 'trade-ins' && 'Inruil aanvragen beoordelen.'}
            {tab === 'warranty' && 'Garantieclaims en RMA tracking.'}
            {tab === 'repairs' && 'Reparatie tickets voor monteurs.'}
            {tab === 'settings' && 'Hub instellingen en module configuratie.'}
          </p>

          {/* Placeholder content */}
          <div className="bg-card border border-border rounded-2xl p-12 text-center">
            <div className="text-4xl mb-4">🚧</div>
            <h3 className="font-bold text-foreground mb-2">Module: {tabs.find(t => t.id === tab)?.label}</h3>
            <p className="text-muted-foreground text-sm">
              Deze module wordt in de volgende sprint gebouwd. Het schema staat klaar in Supabase.
            </p>
            {isSuperAdmin && (
              <p className="text-xs text-accent mt-4 font-medium">
                Je bent ingelogd als superadmin. Alle modules zijn zichtbaar.
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
