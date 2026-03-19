import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Package, Search, Mail, Shield, ArrowLeftRight, Wrench, BarChart3, ChevronRight, Zap, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import JappieChat from '@/components/jappie/JappieChat';

export default function ChatPage() {
  const [chatOpen, setChatOpen] = useState(false);

  const modules = [
    { icon: <MessageSquare size={22} />, title: 'Jappie Chat', desc: 'AI-assistent op de website. Beantwoordt vragen over bestellingen, tracking, producten en meer.', color: 'bg-emerald-500', active: true },
    { icon: <Package size={22} />, title: 'Tracking & Bestelstatus', desc: 'Klanten zoeken hun bestelling op met ordernummer. PostNL en DHL tracking in de chat.', color: 'bg-blue-500', active: true },
    { icon: <Mail size={22} />, title: 'Mail Intelligence', desc: 'Jappie leest mails, classificeert ze, en zet conceptantwoorden klaar of verstuurt automatisch.', color: 'bg-violet-500', active: true },
    { icon: <Search size={22} />, title: 'Product Engine', desc: '50.000+ producten doorzoekbaar met AI. Product Finder, voorraadcheck, cross-sell.', color: 'bg-amber-500', active: false },
    { icon: <ArrowLeftRight size={22} />, title: 'Inruil Portal', desc: 'Klanten uploaden foto\'s, AI analyseert conditie en waarde. Team beoordeelt via dashboard.', color: 'bg-purple-500', active: false },
    { icon: <Shield size={22} />, title: 'Garantie Portal', desc: 'Garantieclaims indienen, statustracking, RMA bij leveranciers. Alles gestructureerd.', color: 'bg-red-500', active: false },
    { icon: <Wrench size={22} />, title: 'Reparatie Module', desc: 'Monteurs volgen reparaties: diagnose, onderdelen, foto\'s, kosten. Klant volgt status.', color: 'bg-cyan-500', active: false },
    { icon: <BarChart3 size={22} />, title: 'Analytics', desc: 'Gesprekken analyse, conversie tracking, Jappie performance metrics.', color: 'bg-pink-500', active: false },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="bg-primary text-primary-foreground">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="flex items-center gap-4 mb-8">
            <img src="https://mediaupload.toemen.nl/2023/01/logo-toemen.png" alt="Toemen" className="h-10" />
            <div className="h-8 w-px bg-primary-foreground/20" />
            <span className="text-sm font-medium text-primary-foreground/60">Hub Demo</span>
          </div>

          <div className="max-w-2xl">
            <motion.h1
              className="text-4xl md:text-5xl font-black mb-4"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            >
              Hallo, ik ben <span className="text-accent">Jappie</span>
            </motion.h1>
            <motion.p
              className="text-lg text-primary-foreground/70 mb-8 leading-relaxed"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            >
              De AI-assistent van Toemen Modelsport. Ik help klanten met bestelstatus,
              tracking, productadvies, voorraad, inruil, garantie en meer — op de website,
              via e-mail en via WhatsApp.
            </motion.p>

            <motion.div
              className="flex flex-wrap gap-3"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            >
              <button
                onClick={() => setChatOpen(true)}
                className="flex items-center gap-2 px-5 py-3 bg-accent text-white rounded-xl font-bold text-sm hover:bg-accent/90 transition-colors shadow-lg shadow-accent/20"
              >
                <MessageSquare size={18} />
                Chat met Jappie
              </button>
              <Link
                to="/chat"
                className="flex items-center gap-2 px-5 py-3 bg-primary-foreground/10 text-primary-foreground rounded-xl font-bold text-sm hover:bg-primary-foreground/20 transition-colors"
              >
                Fullscreen Chat
                <ExternalLink size={14} />
              </Link>
              <Link
                to="/auth"
                className="flex items-center gap-2 px-5 py-3 bg-primary-foreground/10 text-primary-foreground rounded-xl font-bold text-sm hover:bg-primary-foreground/20 transition-colors"
              >
                Dashboard Login
                <ChevronRight size={14} />
              </Link>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Modules */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-bold text-foreground mb-2">Platform Modules</h2>
        <p className="text-muted-foreground mb-8">Toemen Hub groeit in fasen. Actieve modules zijn live, de rest wordt binnenkort gebouwd.</p>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {modules.map((m, i) => (
            <motion.div
              key={m.title}
              className={`relative p-5 bg-card border rounded-2xl transition-all ${m.active ? 'border-accent/20 shadow-sm hover:shadow-md' : 'border-border opacity-60'}`}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }}
            >
              {m.active && (
                <span className="absolute top-3 right-3 text-[9px] font-bold bg-accent/10 text-accent px-2 py-0.5 rounded-full">ACTIEF</span>
              )}
              {!m.active && (
                <span className="absolute top-3 right-3 text-[9px] font-bold bg-muted text-muted-foreground px-2 py-0.5 rounded-full">BINNENKORT</span>
              )}
              <div className={`w-10 h-10 ${m.color} rounded-xl flex items-center justify-center text-white mb-3`}>
                {m.icon}
              </div>
              <h3 className="font-bold text-foreground text-sm mb-1">{m.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{m.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-6xl mx-auto px-6 pb-12">
        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="font-bold text-foreground mb-4">Technische Details</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-black text-accent">17</p>
              <p className="text-xs text-muted-foreground">Database tabellen</p>
            </div>
            <div>
              <p className="text-2xl font-black text-foreground">6</p>
              <p className="text-xs text-muted-foreground">User rollen</p>
            </div>
            <div>
              <p className="text-2xl font-black text-foreground">33</p>
              <p className="text-xs text-muted-foreground">RLS policies</p>
            </div>
            <div>
              <p className="text-2xl font-black text-foreground">8</p>
              <p className="text-xs text-muted-foreground">Modules</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-border flex flex-wrap gap-4 text-xs text-muted-foreground">
            <span>Supabase: <code className="bg-muted px-1.5 py-0.5 rounded text-foreground">ugnofmpeovnvwiaqapee</code></span>
            <span>AI: Gemini 2.0 Flash</span>
            <span>Frontend: React + Vite + Tailwind</span>
            <span>Rollen: superadmin, admin, agent, monteur, customer, readonly</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-border py-6 text-center">
        <p className="text-xs text-muted-foreground">Toemen Hub — Built by <span className="font-medium text-foreground">Web Projects</span> © 2026</p>
      </div>

      {/* Chat Widget FAB */}
      <AnimatePresence>
        {!chatOpen && (
          <motion.button
            onClick={() => setChatOpen(true)}
            className="fixed bottom-6 right-6 w-14 h-14 bg-accent text-white rounded-full shadow-lg shadow-accent/30 flex items-center justify-center z-50 hover:scale-105 transition-transform"
            initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
            whileTap={{ scale: 0.9 }}
          >
            <MessageSquare size={24} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Widget Drawer */}
      <AnimatePresence>
        {chatOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/20 z-40 md:hidden"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setChatOpen(false)}
            />
            <motion.div
              className="fixed bottom-0 right-0 md:bottom-6 md:right-6 w-full md:w-[400px] h-[85vh] md:h-[600px] md:rounded-2xl overflow-hidden shadow-2xl border border-border z-50 bg-background"
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              <button
                onClick={() => setChatOpen(false)}
                className="absolute top-3 right-3 z-10 w-8 h-8 bg-muted/80 backdrop-blur rounded-full flex items-center justify-center hover:bg-muted transition-colors"
              >
                <X size={16} />
              </button>
              <JappieChat mode="widget" />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
