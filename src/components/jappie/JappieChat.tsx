import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Package, Clock, ShoppingCart, ArrowLeftRight, Shield, Loader2, Wifi, WifiOff } from 'lucide-react';
import { useJappie, ChatMessage } from '@/hooks/useJappie';
import { formatDistanceToNow } from 'date-fns';
import { nl } from 'date-fns/locale';

interface JappieChatProps {
  mode?: 'widget' | 'fullscreen';
  pageContext?: string;
}

const quickActions = [
  { label: 'Waar is mijn pakket?', icon: <Package size={14} />, msg: 'Waar is mijn pakket?' },
  { label: 'Bestelstatus', icon: <ShoppingCart size={14} />, msg: 'Wat is de status van mijn bestelling?' },
  { label: 'Openingstijden', icon: <Clock size={14} />, msg: 'Wat zijn de openingstijden?' },
  { label: 'Inruilen', icon: <ArrowLeftRight size={14} />, msg: 'Ik wil iets inruilen' },
  { label: 'Garantie', icon: <Shield size={14} />, msg: 'Ik heb een garantievraag' },
];

const JappieChat = ({ mode = 'widget', pageContext }: JappieChatProps) => {
  const { messages, sendMessage, isTyping, isConnected } = useJappie({
    channel: mode === 'fullscreen' ? 'fullscreen' : 'web_chat',
    pageContext,
  });
  const [input, setInput] = useState('');
  const [showQuickActions, setShowQuickActions] = useState(true);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    if (messages.some((m) => m.role === 'user')) setShowQuickActions(false);
  }, [messages]);

  const handleSend = (text?: string) => {
    const msg = text || input;
    if (!msg.trim()) return;
    sendMessage(msg);
    setInput('');
    inputRef.current?.focus();
  };

  const isFullscreen = mode === 'fullscreen';

  return (
    <div className={`flex flex-col bg-background ${isFullscreen ? 'h-screen' : 'h-full'}`}>
      {/* Header */}
      <div className="shrink-0 px-4 py-3 border-b border-border bg-card flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-toemen-green-dark flex items-center justify-center shadow-glow-green">
          <span className="text-white font-bold text-sm">J</span>
        </div>
        <div className="flex-1">
          <h2 className="font-bold text-foreground text-sm">Jappie</h2>
          <div className="flex items-center gap-1.5">
            {isConnected ? (
              <>
                <Wifi size={10} className="text-accent" />
                <span className="text-[10px] text-accent font-medium">Online</span>
              </>
            ) : (
              <>
                <WifiOff size={10} className="text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground">Verbinden...</span>
              </>
            )}
          </div>
        </div>
        {!isFullscreen && (
          <img
            src="https://mediaupload.toemen.nl/2023/01/logo-toemen.png"
            alt="Toemen"
            className="h-6 w-auto opacity-60"
          />
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div
            className="flex justify-start"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="bg-muted rounded-2xl rounded-bl-none px-4 py-3 flex items-center gap-2">
              <div className="flex gap-1">
                <motion.div className="w-2 h-2 bg-muted-foreground/40 rounded-full" animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} />
                <motion.div className="w-2 h-2 bg-muted-foreground/40 rounded-full" animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }} />
                <motion.div className="w-2 h-2 bg-muted-foreground/40 rounded-full" animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }} />
              </div>
              <span className="text-xs text-muted-foreground">Jappie denkt na...</span>
            </div>
          </motion.div>
        )}

        <div ref={endRef} />
      </div>

      {/* Quick Actions */}
      <AnimatePresence>
        {showQuickActions && messages.length <= 1 && (
          <motion.div
            className="px-4 pb-2"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <p className="text-xs text-muted-foreground mb-2 font-medium">Veelgestelde vragen:</p>
            <div className="flex flex-wrap gap-2">
              {quickActions.map((qa) => (
                <motion.button
                  key={qa.label}
                  onClick={() => handleSend(qa.msg)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-card border border-accent/20 text-accent rounded-full text-xs font-semibold hover:bg-accent/5 transition-colors"
                  whileTap={{ scale: 0.95 }}
                >
                  {qa.icon}
                  {qa.label}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input */}
      <div className="shrink-0 p-3 bg-card border-t border-border">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            className="flex-1 bg-muted border-none rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent placeholder:text-muted-foreground/60"
            placeholder="Stel een vraag aan Jappie..."
            disabled={isTyping}
          />
          <motion.button
            onClick={() => handleSend()}
            disabled={!input.trim() || isTyping}
            className="w-10 h-10 bg-accent text-accent-foreground rounded-xl flex items-center justify-center disabled:opacity-40"
            whileTap={{ scale: 0.9 }}
          >
            {isTyping ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </motion.button>
        </div>
        <p className="text-[10px] text-muted-foreground/50 text-center mt-1.5">
          Jappie is een AI-assistent en kan fouten maken.
        </p>
      </div>
    </div>
  );
};

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';
  return (
    <motion.div
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      <div className={`max-w-[85%]`}>
        <div
          className={`p-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
            isUser
              ? 'bg-primary text-primary-foreground rounded-br-sm'
              : 'bg-muted text-foreground rounded-bl-sm'
          }`}
        >
          {message.content}
        </div>
        <p className={`text-[10px] text-muted-foreground/50 mt-0.5 ${isUser ? 'text-right' : 'text-left'} px-1`}>
          {formatDistanceToNow(new Date(message.created_at), { addSuffix: true, locale: nl })}
        </p>
      </div>
    </motion.div>
  );
}

export default JappieChat;
