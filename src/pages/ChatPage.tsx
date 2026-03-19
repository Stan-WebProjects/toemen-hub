import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X } from 'lucide-react';
import JappieChat from '@/components/jappie/JappieChat';

const ChatPage = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/50">
      {/* Demo page content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex items-center gap-4 mb-8">
          <img src="https://mediaupload.toemen.nl/2023/01/logo-toemen.png" alt="Toemen" className="h-10" />
          <div className="h-6 w-px bg-border" />
          <span className="text-sm text-muted-foreground font-medium">Toemen Hub Demo</span>
        </div>

        <h1 className="text-4xl font-bold text-foreground mb-4">
          Hallo, ik ben <span className="text-accent">Jappie</span>
        </h1>
        <p className="text-lg text-muted-foreground mb-8 max-w-2xl">
          De AI-assistent van Toemen Modelsport. Ik kan je helpen met bestelstatus, 
          tracking, productadvies, voorraad, en meer. Klik op de chat-knop rechtsonder 
          om me te proberen.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          {[
            { icon: '📦', title: 'Tracking & Bestelstatus', desc: 'Geef je ordernummer en ik zoek direct de status op' },
            { icon: '🏎️', title: 'Productadvies', desc: 'Ik help je het perfecte RC-model te vinden' },
            { icon: '📧', title: 'Mail Intelligence', desc: 'Jappie leest mails en zet conceptantwoorden klaar' },
          ].map((card) => (
            <div key={card.title} className="bg-card border border-border rounded-2xl p-5">
              <span className="text-2xl">{card.icon}</span>
              <h3 className="font-bold text-foreground mt-3 mb-1">{card.title}</h3>
              <p className="text-sm text-muted-foreground">{card.desc}</p>
            </div>
          ))}
        </div>

        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="font-bold text-foreground mb-2">Developer Info</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Supabase project: <code className="bg-muted px-2 py-0.5 rounded text-xs">ugnofmpeovnvwiaqapee</code>
          </p>
          <div className="flex gap-3">
            <a href="/chat" className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:opacity-90 transition-opacity">
              Jappie Fullscreen
            </a>
            <a href="/dashboard" className="px-4 py-2 bg-muted text-foreground rounded-xl text-sm font-medium hover:bg-muted/80 transition-colors">
              Dashboard
            </a>
            <a href="/auth" className="px-4 py-2 bg-muted text-foreground rounded-xl text-sm font-medium hover:bg-muted/80 transition-colors">
              Login
            </a>
          </div>
        </div>
      </div>

      {/* Floating Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 w-14 h-14 bg-accent text-accent-foreground rounded-full shadow-lg flex items-center justify-center z-50 hover:scale-105 transition-transform"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            whileTap={{ scale: 0.9 }}
          >
            <MessageSquare size={24} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Widget */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed bottom-6 right-6 w-[400px] z-50"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <button
              onClick={() => setIsOpen(false)}
              className="absolute -top-3 -right-3 w-8 h-8 bg-card border border-border rounded-full flex items-center justify-center shadow-md z-10 hover:bg-muted transition-colors"
            >
              <X size={16} />
            </button>
            <JappieChat variant="widget" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatPage;
