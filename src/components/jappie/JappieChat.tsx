import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Package, Clock, ShoppingCart, ArrowLeftRight, Shield, Loader2, Wifi, WifiOff, MapPin, Phone, ExternalLink, Search, ChevronRight, Truck, CheckCircle2, Circle } from 'lucide-react';
import { useJappie, ChatMessage } from '@/hooks/useJappie';

interface JappieChatProps {
  mode?: 'widget' | 'fullscreen';
  pageContext?: string;
}

const JappieChat = ({ mode = 'widget', pageContext }: JappieChatProps) => {
  const { messages, sendMessage, isTyping, isConnected } = useJappie({
    channel: mode === 'fullscreen' ? 'fullscreen' : 'web_chat', pageContext,
  });
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = (text?: string) => {
    const msg = text || input;
    if (!msg.trim()) return;
    sendMessage(msg);
    setInput('');
    inputRef.current?.focus();
  };

  return (
    <div className="flex flex-col h-full max-h-screen bg-background overflow-hidden">
      {/* Header */}
      <div className="shrink-0 px-4 py-3 border-b border-border bg-card flex items-center gap-3 z-10">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-emerald-700 flex items-center justify-center shadow-lg">
          <span className="text-white font-bold text-sm">J</span>
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-bold text-foreground text-sm">Jappie</h2>
          <div className="flex items-center gap-1.5">
            {isConnected ? (
              <><span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" /><span className="text-[10px] text-accent font-medium">Online</span></>
            ) : (
              <><WifiOff size={10} className="text-muted-foreground" /><span className="text-[10px] text-muted-foreground">Verbinden...</span></>
            )}
          </div>
        </div>
        <img src="https://mediaupload.toemen.nl/2023/01/logo-toemen.png" alt="Toemen" className="h-5 w-auto opacity-40" />
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} onAction={handleSend} />
          ))}
        </AnimatePresence>

        {isTyping && <TypingIndicator />}
        <div className="h-1" />
      </div>

      {/* Input */}
      <div className="shrink-0 p-3 bg-card border-t border-border">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            className="flex-1 bg-muted rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 placeholder:text-muted-foreground/50"
            placeholder="Stel een vraag aan Jappie..."
            disabled={isTyping}
          />
          <motion.button
            onClick={() => handleSend()}
            disabled={!input.trim() || isTyping}
            className="w-10 h-10 bg-accent text-white rounded-xl flex items-center justify-center disabled:opacity-30 shrink-0"
            whileTap={{ scale: 0.9 }}
          >
            {isTyping ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </motion.button>
        </div>
        <p className="text-[10px] text-muted-foreground/40 text-center mt-1.5">Jappie is een AI-assistent van Toemen Modelsport</p>
      </div>
    </div>
  );
};

/* ─── Message Bubble ─── */
function MessageBubble({ message, onAction }: { message: ChatMessage; onAction: (text: string) => void }) {
  const isUser = message.role === 'user';
  const meta = message.metadata as Record<string, any> | undefined;
  const metaType = meta?.type as string | undefined;

  if (isUser) {
    return (
      <motion.div className="flex justify-end" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
        <div className="max-w-[80%] bg-primary text-primary-foreground px-4 py-2.5 rounded-2xl rounded-br-sm text-sm">{message.content}</div>
      </motion.div>
    );
  }

  return (
    <motion.div className="flex flex-col gap-2" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
      <div className="max-w-[85%] bg-muted text-foreground px-4 py-2.5 rounded-2xl rounded-bl-sm text-sm leading-relaxed">{message.content}</div>

      {/* Action Cards */}
      {(metaType === 'welcome' || metaType === 'actions') && <ActionCards onAction={onAction} />}

      {/* Tracking Result */}
      {metaType === 'tracking_result' && meta?.tracking && <TrackingWidget data={meta.tracking as any} />}

      {/* Hours Card */}
      {metaType === 'hours' && meta?.hours && <HoursCard data={meta.hours as any} />}

      {/* Product Cards */}
      {metaType === 'products' && meta?.products && <ProductCards products={meta.products as any[]} />}
    </motion.div>
  );
}

/* ─── Action Cards ─── */
function ActionCards({ onAction }: { onAction: (text: string) => void }) {
  const actions = [
    { icon: <Package size={18} />, label: 'Tracking & Bestelstatus', desc: 'Waar is mijn pakket?', msg: 'Waar is mijn pakket?', color: 'text-blue-500 bg-blue-50' },
    { icon: <Clock size={18} />, label: 'Openingstijden', desc: 'Wanneer zijn jullie open?', msg: 'Wat zijn de openingstijden?', color: 'text-orange-500 bg-orange-50' },
    { icon: <Search size={18} />, label: 'Product zoeken', desc: 'Voorraad & advies', msg: 'Ik zoek een product', color: 'text-emerald-500 bg-emerald-50' },
    { icon: <ArrowLeftRight size={18} />, label: 'Inruilen', desc: 'Wat is mijn product waard?', msg: 'Ik wil iets inruilen', color: 'text-purple-500 bg-purple-50' },
    { icon: <Shield size={18} />, label: 'Garantie', desc: 'Defect of RMA melden', msg: 'Ik heb een garantievraag', color: 'text-red-500 bg-red-50' },
  ];
  return (
    <div className="grid grid-cols-2 gap-2 max-w-[340px]">
      {actions.map((a) => (
        <motion.button
          key={a.label}
          onClick={() => onAction(a.msg)}
          className="flex items-start gap-2.5 p-3 bg-card border border-border rounded-xl text-left hover:border-accent/30 hover:shadow-sm transition-all"
          whileTap={{ scale: 0.97 }}
        >
          <div className={`w-8 h-8 rounded-lg ${a.color} flex items-center justify-center shrink-0`}>{a.icon}</div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-foreground leading-tight">{a.label}</p>
            <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">{a.desc}</p>
          </div>
        </motion.button>
      ))}
    </div>
  );
}

/* ─── Tracking Widget ─── */
function TrackingWidget({ data }: { data: { code: string; carrier: string; status: string; estimatedDelivery: string; steps: { label: string; done: boolean; time: string }[] } }) {
  return (
    <motion.div
      className="max-w-[320px] bg-card border border-border rounded-2xl overflow-hidden shadow-sm"
      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}
    >
      <div className="bg-gradient-to-r from-accent to-emerald-700 px-4 py-3 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck size={16} />
            <span className="text-xs font-bold">{data.carrier}</span>
          </div>
          <span className="text-[10px] font-mono bg-white/20 px-2 py-0.5 rounded">{data.code}</span>
        </div>
        <p className="text-sm font-bold mt-1">{data.status}</p>
        <p className="text-[10px] opacity-80">Verwacht: {data.estimatedDelivery}</p>
      </div>
      <div className="p-4">
        {data.steps.map((step, i) => (
          <div key={step.label} className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              {step.done ? (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.15 }}>
                  <CheckCircle2 size={18} className="text-accent" />
                </motion.div>
              ) : (
                <Circle size={18} className="text-muted-foreground/30" />
              )}
              {i < data.steps.length - 1 && (
                <div className={`w-0.5 h-6 ${step.done ? 'bg-accent' : 'bg-muted'}`} />
              )}
            </div>
            <div className="pb-4">
              <p className={`text-xs font-medium ${step.done ? 'text-foreground' : 'text-muted-foreground/50'}`}>{step.label}</p>
              <p className="text-[10px] text-muted-foreground">{step.time}</p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

/* ─── Hours Card ─── */
function HoursCard({ data }: { data: { address: string; phone: string; schedule: { day: string; time: string; open: boolean }[] } }) {
  const today = new Date().toLocaleDateString('nl-NL', { weekday: 'long' });
  return (
    <motion.div
      className="max-w-[300px] bg-card border border-border rounded-2xl overflow-hidden shadow-sm"
      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
    >
      <div className="px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2 text-foreground">
          <MapPin size={14} className="text-accent" />
          <span className="text-xs font-medium">{data.address}</span>
        </div>
        <div className="flex items-center gap-2 mt-1 text-muted-foreground">
          <Phone size={12} />
          <span className="text-[11px]">{data.phone}</span>
        </div>
      </div>
      <div className="p-3 space-y-1">
        {data.schedule.map((s) => {
          const isToday = today.toLowerCase() === s.day.toLowerCase();
          return (
            <div key={s.day} className={`flex justify-between items-center px-2 py-1 rounded-lg text-xs ${isToday ? 'bg-accent/10 font-bold' : ''}`}>
              <span className={isToday ? 'text-accent' : 'text-foreground'}>{s.day}{isToday ? ' (vandaag)' : ''}</span>
              <span className={s.open ? 'text-foreground' : 'text-muted-foreground'}>{s.time}</span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

/* ─── Product Cards ─── */
function ProductCards({ products }: { products: { name: string; price: number; stock: boolean; image: string; url: string }[] }) {
  return (
    <div className="space-y-2 max-w-[320px]">
      {products.map((p) => (
        <motion.a
          key={p.name} href={p.url} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-3 p-2.5 bg-card border border-border rounded-xl hover:border-accent/30 transition-all"
          whileTap={{ scale: 0.98 }}
        >
          <img src={p.image} alt={p.name} className="w-12 h-12 rounded-lg object-cover bg-muted" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-foreground truncate">{p.name}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-sm font-bold text-foreground">€{p.price.toFixed(2).replace('.', ',')}</span>
              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${p.stock ? 'bg-accent/10 text-accent' : 'bg-red-50 text-red-500'}`}>
                {p.stock ? 'Op voorraad' : 'Niet op voorraad'}
              </span>
            </div>
          </div>
          <ExternalLink size={14} className="text-muted-foreground shrink-0" />
        </motion.a>
      ))}
    </div>
  );
}

/* ─── Typing Indicator ─── */
function TypingIndicator() {
  return (
    <motion.div className="flex justify-start" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-2">
        <div className="flex gap-1">
          {[0, 0.15, 0.3].map((d) => (
            <motion.div key={d} className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full"
              animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: d }} />
          ))}
        </div>
        <span className="text-[10px] text-muted-foreground">Jappie denkt na...</span>
      </div>
    </motion.div>
  );
}

export default JappieChat;
