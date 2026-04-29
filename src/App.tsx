import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Search, 
  Image as ImageIcon, 
  Video, 
  AlertTriangle, 
  ChevronRight, 
  RefreshCw,
  EyeOff,
  LocateFixed,
  MapPin,
  Lock,
  ExternalLink,
  Eraser,
  Terminal,
  Copy,
  Check,
  Cpu,
  Download,
  Activity,
  Zap,
  ShieldQuestion,
  Server
} from 'lucide-react';
import { ScanResult, ImageResult, VideoResult } from './types';
import { analyzeMedia } from './services/geminiService';

export default function App() {
  const [url, setUrl] = useState('');
  const [isUrlFocused, setIsUrlFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [analyzingCount, setAnalyzingCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const [showScript, setShowScript] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState<any>(null);
  const [useLocalVLM, setUseLocalVLM] = useState(false);
  const [activeScenarios, setActiveScenarios] = useState<string[]>([]);
  const [socAlerts, setSocAlerts] = useState<any[]>([]);

  // Check for URL in query params on load (for Tampermonkey integration)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const targetUrl = params.get('url');
    if (targetUrl) {
      setUrl(targetUrl);
      // Auto-trigger scan if URL is provided via param
      const timer = setTimeout(() => {
        startScanByUrl(targetUrl);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const startScanByUrl = async (targetUrl: string) => {
    setLoading(true);
    setScanResult(null);
    try {
      const response = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: targetUrl })
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setScanResult(data);
      
      // UIP Restoration: Activate baseline scenarios for forensic mapping
      setActiveScenarios(['s1', 's4']);
      setSocAlerts([
        { id: 'INC-005', type: 'INFO', msg: 'Forensic scan initiated on external node.' }
      ]);
    } catch (error) {
      console.error('Scan failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const startScan = () => startScanByUrl(url);

  const analyzeItem = async (index: number, type: 'image' | 'video') => {
    if (!scanResult) return;

    const items = type === 'image' ? [...scanResult.images] : [...scanResult.videos];
    const item = items[index];
    if (item.status !== 'pending') return;

    setAnalyzingCount(prev => prev + 1);
    
    // Update status to analyzing
    const newResult = { ...scanResult };
    if (type === 'image') {
      newResult.images[index].status = 'analyzing';
    } else {
      newResult.videos[index].status = 'analyzing';
    }
    setScanResult({ ...newResult });

    try {
      const analysis = await analyzeMedia(item.src, type);
      
      const FinalResult = { ...newResult };
      if (type === 'image') {
        FinalResult.images[index].analysis = analysis;
        FinalResult.images[index].status = 'done';
      } else {
        FinalResult.videos[index].analysis = analysis;
        FinalResult.videos[index].status = 'done';
      }
      setScanResult({ ...FinalResult });
    } catch (error) {
      const ErrorResult = { ...newResult };
      if (type === 'image') {
        ErrorResult.images[index].status = 'error';
      } else {
        ErrorResult.videos[index].status = 'error';
      }
      setScanResult({ ...ErrorResult });
    } finally {
      setAnalyzingCount(prev => Math.max(0, prev - 1));
    }
  };

  const analyzeAll = async () => {
    if (!scanResult) return;
    scanResult.images.forEach((_, i) => analyzeItem(i, 'image'));
    scanResult.videos.forEach((_, i) => analyzeItem(i, 'video'));
  };

  const currentAppUrl = window.location.origin;
  const userScript = `// ==UserScript==
// @name         Amnesia - Visual Privacy Scrubber
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Launch Amnesia Privacy Scrubber for the current site
// @author       AmnesiaProtocol
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    const btn = document.createElement('div');
    btn.innerHTML = '🧹';
    btn.style.cssText = 'position:fixed;bottom:20px;right:20px;width:50px;height:50px;background:#0F172A;border:2px solid #38BDF8;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:24px;cursor:pointer;z-index:999999;box-shadow:0 0 15px rgba(56,189,248,0.3);transition:all 0.3s;';
    btn.onmouseover = () => btn.style.transform = 'scale(1.1)';
    btn.onmouseout = () => btn.style.transform = 'scale(1)';
    btn.onclick = () => {
        const target = \`${currentAppUrl}/?url=\${encodeURIComponent(window.location.href)}\`;
        window.open(target, '_blank');
    };
    document.body.appendChild(btn);
})();`;

  const copyScript = () => {
    navigator.clipboard.writeText(userScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const maskUrl = (input: string) => {
    if (!input) return '';
    return 'NODE_' + getHash(input);
  };

  const getHash = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash).toString(16).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-[#F8FAFC] font-mono p-4 md:p-8">
      {/* Amnesia Branding Header */}
      <header className="max-w-6xl mx-auto mb-12 flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-white/5 pb-8">
        <div className="flex items-center gap-6">
          <motion.div 
            animate={{ 
              scale: [1, 1.05, 1],
              opacity: [0.7, 1, 0.7]
            }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="w-16 h-16 bg-[#38BDF8] rounded-2xl flex items-center justify-center shadow-[0_0_40px_rgba(56,189,248,0.2)] overflow-hidden"
          >
            <img src="/icon.png" className="w-full h-full object-cover" alt="Amnesia Protocol" />
          </motion.div>
          <div>
            <h1 className="text-5xl font-black tracking-tight uppercase leading-none text-[#F8FAFC]">Amnesia</h1>
            <div className="flex items-center gap-2 mt-2">
              <span className="w-2 h-2 bg-[#38BDF8] rounded-full animate-pulse" />
              <p className="text-[10px] tracking-[0.4em] text-gray-500">WIPE_PROTOCOL // ACTIVE</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex bg-[#1E293B] border border-white/5 rounded-xl overflow-hidden p-1 shadow-inner">
            <input 
              type="url"
              value={isUrlFocused ? url : maskUrl(url)}
              onChange={(e) => setUrl(e.target.value)}
              onFocus={() => setIsUrlFocused(true)}
              onBlur={() => setIsUrlFocused(false)}
              placeholder="TARGET_NODE"
              className="bg-transparent py-3 px-4 w-full md:w-80 focus:outline-none text-sm text-[#38BDF8]"
              style={{ color: isUrlFocused ? '#38BDF8' : '#475569' }}
            />
            <button 
              onClick={startScan}
              disabled={loading}
              className="bg-[#38BDF8] hover:bg-[#7DD3FC] disabled:opacity-50 text-[#0F172A] px-6 font-black uppercase text-xs transition-all cursor-pointer rounded-lg shadow-lg"
            >
              {loading ? 'WIPING_...' : 'EXEC_WIPE'}
            </button>
          </div>
          <div className="flex items-center gap-4 self-end">
            <button 
              onClick={() => setUseLocalVLM(!useLocalVLM)}
              className={`text-[10px] flex items-center gap-2 transition-colors ${useLocalVLM ? 'text-emerald-400' : 'text-gray-500 hover:text-emerald-400/50'}`}
            >
              <Server className="w-3 h-3" />
              {useLocalVLM ? 'ZERO-CLOUD [LOCAL VLM: ON]' : 'ZERO-CLOUD [LOCAL VLM: OFF]'}
            </button>
            <button 
              onClick={() => setShowScript(!showScript)}
              className="text-[10px] text-gray-500 hover:text-[#38BDF8] flex items-center gap-2 transition-colors"
            >
              <Terminal className="w-3 h-3" />
              {showScript ? 'DETACH_SCRUBBER_HOOK' : 'GENERATE_SCRUBBER_HOOK'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto">
        {/* Ghost Protocol Dashboard */}
        <section className="mb-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#1E293B]/50 border border-white/5 p-6 rounded-2xl relative overflow-hidden">
             <div className="flex items-center justify-between mb-4">
                <h3 className="text-[10px] font-bold text-gray-500 tracking-[0.2em] uppercase">Active_Scenarios</h3>
                <Zap className="w-3 h-3 text-[#38BDF8]" />
             </div>
             <div className="flex flex-wrap gap-2">
                {activeScenarios.length > 0 ? activeScenarios.map(s => (
                  <span key={s} className="bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/20 px-2 py-0.5 rounded text-[10px] font-bold">{s}</span>
                )) : <span className="text-[10px] text-gray-700 italic">None active</span>}
             </div>
             <div className="absolute -bottom-4 -right-4 opacity-5">
                <Cpu className="w-24 h-24" />
             </div>
          </div>

          <div className="bg-[#1E293B]/50 border border-white/5 p-6 rounded-2xl md:col-span-2 flex flex-col">
             <div className="flex items-center justify-between mb-4">
                <h3 className="text-[10px] font-bold text-gray-500 tracking-[0.2em] uppercase">SOC_Incident_Log</h3>
                <Activity className="w-3 h-3 text-rose-500" />
             </div>
             <div className="space-y-2 max-h-24 overflow-y-auto pr-2 custom-scrollbar">
                {socAlerts.length > 0 ? socAlerts.map((a, i) => (
                  <div key={i} className="flex items-center gap-3 text-[10px] border-b border-white/5 pb-2">
                    <span className={`font-black ${a.type === 'CRITICAL' ? 'text-rose-500' : 'text-emerald-500'}`}>{a.id}</span>
                    <span className="text-gray-500 truncate">{a.msg}</span>
                  </div>
                )) : <div className="text-[10px] text-gray-700 italic">No incidents logged.</div>}
             </div>
          </div>
        </section>

        <AnimatePresence>
          {showScript && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mb-12 overflow-hidden"
            >
              <div className="bg-[#1E293B] border border-[#38BDF8]/20 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-bold text-[#38BDF8] uppercase tracking-widest flex items-center gap-2">
                    <Terminal className="w-4 h-4" /> Injectable Scrubber Protocol
                  </h3>
                  <button 
                    onClick={copyScript}
                    className="flex items-center gap-2 text-[10px] bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg border border-white/5 transition-colors"
                  >
                    {copied ? <Check className="w-3 h-3 text-[#38BDF8]" /> : <Copy className="w-3 h-3" />}
                    {copied ? 'PROTOCOL_COPIED' : 'COPY_INJECTOR'}
                  </button>
                </div>
                <div className="bg-[#0a0a0a] p-4 rounded-xl border border-white/5 font-mono text-[11px] text-[#475569] overflow-x-auto whitespace-pre">
                  {userScript}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {!scanResult && !loading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-12"
            >
              <div className="space-y-8">
                <h2 className="text-7xl font-black uppercase leading-[0.8] tracking-tighter opacity-10">SCRUB<br/>MEMORY</h2>
                <p className="text-sm text-[#94A3B8] max-w-md leading-relaxed font-sans">
                  The Amnesia protocol identifies visual identifiers that link digital assets to physical locations. Wipe regional traces, landmarks, and boutique signatures through high-inference scrubbing.
                </p>
                <div className="grid grid-cols-2 gap-8 border-t border-white/5 pt-8">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-[#38BDF8]" />
                      <span className="text-[10px] text-[#38BDF8] font-bold tracking-widest">RED_TEAM</span>
                    </div>
                    <p className="text-[10px] text-gray-500 leading-relaxed uppercase">Detection of environmental metadata leaks.</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span className="text-[10px] text-emerald-400 font-bold tracking-widest">BLUE_TEAM</span>
                    </div>
                    <p className="text-[10px] text-gray-500 leading-relaxed uppercase">Deployment of remediation protocols via Amnesia CLI Scrubber.</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[ImageIcon, Video, ShieldAlert, Lock].map((Icon, i) => (
                  <div key={i} className="aspect-square bg-[#1E293B] border border-white/5 flex items-center justify-center group hover:border-[#38BDF8]/40 transition-all rounded-3xl overflow-hidden relative">
                    <Icon className="w-8 h-8 text-[#334155] group-hover:text-[#38BDF8] transition-colors relative z-10" />
                    <div className="absolute inset-0 bg-[#38BDF8]/0 group-hover:bg-[#38BDF8]/5 transition-colors" />
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {scanResult && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-12"
            >
              <div className="flex items-center justify-between border-y border-white/5 py-6">
                <div className="flex items-center gap-6">
                  <div className="text-[10px] text-[#38BDF8] font-black tracking-widest truncate max-w-[200px]">NODE_SIGNATURE::{getHash(scanResult.url)}</div>
                  <div className="w-1.5 h-1.5 bg-[#38BDF8] rounded-full" />
                  <p className="text-[10px] text-gray-600 font-mono italic">TARGET_HIDDEN</p>
                </div>
                <button 
                  onClick={analyzeAll}
                  disabled={analyzingCount > 0}
                  className="text-[10px] text-[#38BDF8] font-black uppercase tracking-[0.2em] flex items-center gap-2 hover:opacity-70 disabled:opacity-30 cursor-pointer"
                >
                  <RefreshCw className={`w-3 h-3 ${analyzingCount > 0 ? 'animate-spin' : ''}`} />
                  GLOBAL_SCRUB
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <section className="space-y-6">
                   <h3 className="text-[10px] text-[#475569] font-black uppercase tracking-[0.4em] mb-4">ASSET_BLOCK::IMAGES [{scanResult.images.length}]</h3>
                   <div className="grid grid-cols-1 gap-6">
                     {scanResult.images.map((img, i) => (
                       <MediaCard key={i} item={{...img, src: img.src}} type="image" onAnalyze={() => analyzeItem(i, 'image')} />
                     ))}
                   </div>
                </section>
                <section className="space-y-6">
                   <h3 className="text-[10px] text-[#475569] font-black uppercase tracking-[0.4em] mb-4">ASSET_BLOCK::VIDEOS [{scanResult.videos.length}]</h3>
                   <div className="grid grid-cols-1 gap-6">
                     {scanResult.videos.map((vid, i) => (
                       <MediaCard key={i} item={{...vid, src: vid.src}} type="video" onAnalyze={() => analyzeItem(i, 'video')} />
                     ))}
                   </div>
                </section>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="max-w-6xl mx-auto mt-24 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-gray-600 font-mono text-[9px] uppercase tracking-[0.4em]">
        <div className="flex flex-col gap-2">
          <div>AMNESIA_VERSION_S.1 // ERASE_THE_TRACES</div>
          <a 
            href="https://ghostintheprompt.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-[#38BDF8] hover:text-white transition-colors"
          >
            Built by MDRN Corp — mdrn.app
          </a>
        </div>
        
        <div className="flex items-center gap-8">
          <AnimatePresence>
            {updateAvailable && (
              <motion.a
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                href={updateAvailable.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-amber-500 hover:text-amber-400 transition-colors"
              >
                <ArrowUpCircle className="w-3 h-3" />
                UPDATE_AVAILABLE::{updateAvailable.tag_name}
              </motion.a>
            )}
          </AnimatePresence>
          <div className="flex gap-8">
            <span className="text-[#38BDF8]">PROTOCOL_STABLE</span>
            <span>MEMORY_CLEAN</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function MediaCard({ item, type, onAnalyze }: { item: ImageResult | VideoResult, type: 'image' | 'video', onAnalyze: () => any, key?: any }) {
  const isImage = type === 'image';
  const [sanitizing, setSanitizing] = useState(false);
  const [sanitizedUrl, setSanitizedUrl] = useState<string | null>(null);

  const riskColor = {
    low: 'text-emerald-500',
    medium: 'text-amber-500',
    high: 'text-rose-500'
  }[item.analysis?.riskLevel || 'low'];

  const getHash = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash).toString(16).toUpperCase();
  };

  const runSanitizer = async () => {
    setSanitizing(true);
    try {
      const response = await fetch('/api/sanitize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: item.src, regions: item.analysis?.detectedMarkers })
      });
      const blob = await response.blob();
      const sUrl = URL.createObjectURL(blob);
      setSanitizedUrl(sUrl);
      
      // Auto-download as per Sanitizer UI requirement
      const link = document.createElement('a');
      link.href = sUrl;
      link.download = `scrubbed_${getHash(item.src)}.png`;
      link.click();
    } catch (err) {
      console.error('Sanitization failed:', err);
    } finally {
      setSanitizing(false);
    }
  };

  return (
    <div className="bg-[#1E293B] border border-white/5 overflow-hidden group hover:border-[#38BDF8]/20 transition-all rounded-2xl">
      <div className="flex flex-col md:flex-row">
        <div className="md:w-48 aspect-square relative bg-black shrink-0">
          {isImage ? (
            <img 
              src={sanitizedUrl || item.src} 
              referrerPolicy="no-referrer" 
              className={`w-full h-full object-cover transition-all ${sanitizedUrl ? '' : 'blur-[2px] group-hover:blur-0 opacity-40 group-hover:opacity-100 grayscale group-hover:grayscale-0'}`} 
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Video className="w-8 h-8 text-[#334155]" />
            </div>
          )}
          
          {(item.status === 'analyzing' || sanitizing) && (
            <div className="absolute inset-0 bg-[#38BDF8]/10 flex flex-col items-center justify-center">
              <RefreshCw className="w-6 h-6 animate-spin text-[#38BDF8] mb-2" />
              <span className="text-[8px] font-black text-[#38BDF8]">{sanitizing ? 'SANITIZING...' : 'WIPING...'}</span>
            </div>
          )}

          <div className="absolute top-3 left-3 bg-[#0F172A]/80 px-1.5 py-0.5 rounded font-mono text-[7px] text-[#38BDF8]/70 border border-[#38BDF8]/20">
            {type.toUpperCase()}
          </div>
          
          {sanitizedUrl && (
            <div className="absolute bottom-3 left-3 bg-emerald-500/80 px-1.5 py-0.5 rounded font-mono text-[7px] text-white border border-emerald-400/20 flex items-center gap-1">
              <ShieldCheck className="w-2 h-2" /> SCRUBBED
            </div>
          )}
        </div>

        <div className="flex-1 p-6 flex flex-col justify-between bg-gradient-to-br from-transparent to-[#0F172A]/30">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-gray-600 font-mono tracking-tight font-bold">ASSET_HASH::{getHash(item.src)}</span>
              {item.status === 'done' ? (
                <div className="flex items-center gap-4">
                  <div className={`text-[10px] font-black uppercase tracking-tighter ${riskColor}`}>
                    RISK_LEV::{item.analysis?.riskLevel}
                  </div>
                  <button 
                    onClick={runSanitizer}
                    disabled={sanitizing}
                    className="flex items-center gap-2 text-[10px] bg-[#38BDF8] hover:bg-[#7DD3FC] text-[#0F172A] px-3 py-1 rounded font-black transition-colors disabled:opacity-50"
                  >
                    <Download className="w-3 h-3" /> WIPE_&_DL
                  </button>
                </div>
              ) : (
                <button 
                  onClick={onAnalyze}
                  disabled={item.status === 'analyzing'}
                  className="text-[10px] text-[#38BDF8] hover:text-white transition-colors disabled:opacity-30 cursor-pointer font-bold"
                >
                  RUN_WIPE_ANALYSIS
                </button>
              )}
            </div>

            {item.analysis && (
              <motion.div 
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="bg-[#0a0a0a]/50 p-3 border-l-2 border-[#38BDF8] rounded-r-lg">
                  <p className="text-[11px] text-gray-400 font-sans leading-relaxed">{item.analysis.summary}</p>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {item.analysis.detectedMarkers.map((m, i) => (
                    <span key={i} className="text-[9px] text-[#38BDF8] bg-[#38BDF8]/5 px-2 py-0.5 border border-[#38BDF8]/10 rounded-full">
                      {m}
                    </span>
                  ))}
                </div>

                <div className="space-y-1.5 bg-[#0F172A]/50 p-3 rounded-lg border border-white/5">
                   <div className="text-[9px] text-emerald-400/70 font-black uppercase tracking-widest flex items-center gap-1.5">
                     <ShieldCheck className="w-3 h-3" /> Execution Protocols
                   </div>
                   <ul className="space-y-1.5 mt-2">
                     {item.analysis.recommendations.map((r, i) => (
                       <li key={i} className="text-[10px] text-[#94A3B8] flex items-start gap-2 leading-snug">
                         <span className="text-[#38BDF8] font-bold">»</span> 
                         {r}
                       </li>
                     ))}
                   </ul>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
