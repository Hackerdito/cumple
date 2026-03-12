import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "motion/react";
import { 
  MapPin, 
  Calendar, 
  Clock, 
  Hotel, 
  Users, 
  CheckCircle2, 
  ChevronDown,
  Sparkles,
  Heart,
  Gift,
  Music,
  VolumeX,
  Navigation
} from "lucide-react";
import { cn } from "./lib/utils";

// --- Components ---

const Section = ({ children, className, id }: { children: React.ReactNode; className?: string; id?: string }) => (
  <section id={id} className={cn("min-h-screen relative flex flex-col items-center justify-center px-6 py-20", className)}>
    {children}
  </section>
);

const HotelCard = ({ name, description, image, price }: { name: string; description: string; image: string; price: string }) => (
  <motion.div 
    whileHover={{ y: -10 }}
    className="bg-white rounded-2xl overflow-hidden shadow-lg border border-stone-100 group"
  >
    <div className="h-48 overflow-hidden relative">
      <img src={image} alt={name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" referrerPolicy="no-referrer" />
      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-stone-800">
        {price}
      </div>
    </div>
    <div className="p-6">
      <h3 className="font-display text-xl mb-2 text-stone-800">{name}</h3>
      <p className="text-stone-600 text-sm leading-relaxed">{description}</p>
      <button className="mt-4 text-stone-800 font-semibold text-sm flex items-center gap-2 hover:gap-3 transition-all">
        <MapPin className="w-4 h-4" /> Ver ubicación
      </button>
    </div>
  </motion.div>
);

export default function App() {
  const [hasEntered, setHasEntered] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (hasEntered && audioRef.current) {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(e => console.error("Audio play failed", e));
    }
  }, [hasEntered]);

  const toggleAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isGoogleAuth, setIsGoogleAuth] = useState(false);
  
  const [formData, setFormData] = useState({
    familyName: "",
    members: "1",
    hotel: "Ninguno",
    message: ""
  });

  const [showCalendarOptions, setShowCalendarOptions] = useState(false);
  
  const event = {
    title: "Mi Fiesta de 62 Años",
    description: "¡Te espero para celebrar mis 62 años!",
    location: "Hacienda Los Olivos, Valle de Bravo",
    startTime: "20260718T150000",
    endTime: "20260718T210000"
  };

  const googleCalendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${event.startTime}/${event.endTime}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.location)}&sf=true&output=xml`;

  const downloadIcs = () => {
    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "BEGIN:VEVENT",
      `DTSTART:${event.startTime}`,
      `DTEND:${event.endTime}`,
      `SUMMARY:${event.title}`,
      `DESCRIPTION:${event.description}`,
      `LOCATION:${event.location}`,
      "END:VEVENT",
      "END:VCALENDAR"
    ].join("\n");

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "evento-cumpleaños.ics");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const { scrollYProgress } = useScroll({
    offset: ["start start", "end end"]
  });

  const y1 = useTransform(scrollYProgress, [0, 0.5], [0, -100]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 1.1]);
  const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  useEffect(() => {
    checkAuthStatus();
    
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        setIsGoogleAuth(true);
        setIsAuthenticating(false);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  useEffect(() => {
    if (!hasEntered) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [hasEntered]);

  const checkAuthStatus = async () => {
    try {
      const res = await fetch("/api/auth/status");
      const data = await res.json();
      setIsGoogleAuth(data.authenticated);
    } catch (e) {
      console.error(e);
    }
  };

  const handleGoogleAuth = async () => {
    setIsAuthenticating(true);
    try {
      const res = await fetch("/api/auth/url");
      const { url } = await res.json();
      window.open(url, 'google_auth', 'width=600,height=700');
    } catch (e) {
      console.error(e);
      setIsAuthenticating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const scriptUrl = import.meta.env.VITE_GOOGLE_SHEET_URL;

    if (scriptUrl) {
      try {
        await fetch(scriptUrl, {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "text/plain" },
          body: JSON.stringify(formData)
        });
      } catch (e) {
        console.error("Error sending to Google Sheets:", e);
      }
    }
    
    // Show success message
    setIsSubmitted(true);
  };

  return (
    <div className="relative">
      {/* Audio Element */}
      <audio ref={audioRef} loop>
        <source src="https://fileuk.netlify.app/song.mp3" type="audio/mpeg" />
      </audio>

      {/* Floating Music Button */}
      <AnimatePresence>
        {hasEntered && (
          <motion.button
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed top-6 right-6 z-50 w-12 h-12 bg-black/40 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center shadow-lg hover:bg-black/60 transition-colors"
            onClick={toggleAudio}
          >
            {isPlaying ? (
              <Music className="w-5 h-5 text-white animate-[spin_3s_linear_infinite]" />
            ) : (
              <VolumeX className="w-5 h-5 text-white/50" />
            )}
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!hasEntered && (
          <motion.div 
            key="intro-screen"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, filter: "blur(10px)", scale: 1.05 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-end pb-12 md:pb-16 bg-stone-900 h-[100dvh] w-full overflow-hidden"
          >
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-90 scale-110"
              style={{ backgroundImage: "url('https://fileuk.netlify.app/f_v1.png')" }}
            />
            <div className="absolute inset-0 bg-black/20" />
            
            <motion.button 
              onClick={() => setHasEntered(true)}
              whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.2)" }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="relative z-10 px-12 py-4 bg-white/10 backdrop-blur-md border border-white/30 rounded-2xl text-white font-sans uppercase tracking-[0.2em] text-sm shadow-2xl"
            >
              Abrir Invitación
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Hero Section with Parallax */}
      <Section className="relative bg-black pb-12 overflow-hidden">
        <motion.div 
          style={{ y: y1, scale }}
          className="absolute top-0 left-0 w-full h-[80vh] md:h-[85vh] z-0"
        >
          <img 
            src="https://fileuk.netlify.app/62.png" 
            className="w-full h-full object-cover object-top"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black" />
        </motion.div>
        
        <div className="relative z-10 text-center w-full px-4 pt-[75vh] md:pt-[80vh]">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col items-center"
          >
            <span className="text-lg md:text-xl text-white/90 font-light mb-2">
              Estás invitado a celebrar
            </span>
            <h1 className="font-display text-[5.5rem] leading-[0.9] md:text-9xl text-white mb-10">
              <span className="italic">Mis</span> 62<br/>Años
            </h1>
            
            <div className="flex flex-col items-center gap-2.5 md:gap-3 mb-10 text-white/90 text-sm md:text-lg font-light whitespace-nowrap">
              <div className="flex items-center justify-center">
                <div className="flex items-center gap-1.5 md:gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>18 de Julio, 2026</span>
                </div>
                <div className="w-px h-4 md:h-6 bg-white/40 mx-3 md:mx-6"></div>
                <div className="flex items-center gap-1.5 md:gap-2">
                  <Clock className="w-4 h-4" />
                  <span>15:00 Horas</span>
                </div>
              </div>
              <div className="flex items-center justify-center gap-1.5 md:gap-2 text-white/80">
                <MapPin className="w-4 h-4" />
                <span>Tecozautla Hgo</span>
              </div>
            </div>

            <div className="relative inline-block mb-12">
              <button 
                onClick={() => setShowCalendarOptions(!showCalendarOptions)}
                className="flex items-center gap-2 px-8 py-4 bg-[#2A2A2A] text-white rounded-full text-sm font-medium hover:bg-[#3A3A3A] transition-all"
              >
                <Calendar className="w-4 h-4" />
                Añadir al calendario
              </button>

              <AnimatePresence>
                {showCalendarOptions && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-[#2A2A2A] rounded-2xl shadow-xl border border-white/10 overflow-hidden z-50"
                  >
                    <a 
                      href={googleCalendarUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 text-white text-sm transition-colors border-b border-white/10"
                    >
                      <img src="https://www.gstatic.com/calendar/images/dynamiclogo_2020q4/calendar_31_2x.png" className="w-5 h-5" alt="Google" />
                      Google (Android)
                    </a>
                    <button 
                      onClick={downloadIcs}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 text-white text-sm transition-colors"
                    >
                      <div className="w-5 h-5 bg-white rounded-md flex items-center justify-center">
                        <Calendar className="w-3 h-3 text-black" />
                      </div>
                      Apple / iCal (iPhone)
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </Section>

      {/* Gallery & Message Section */}
      <section className="bg-stone-50 py-12 md:py-20">
        {/* Carousel */}
        <div className="w-full overflow-x-auto snap-x snap-mandatory flex gap-4 px-6 pb-16 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {[
            "https://fileuk.netlify.app/f_1.png",
            "https://fileuk.netlify.app/f_2.png",
            "https://fileuk.netlify.app/f_3.png"
          ].map((img, i) => (
            <div key={i} className="snap-center shrink-0 w-[80vw] md:w-[40vw] max-w-[350px] aspect-[3/4] rounded-2xl overflow-hidden relative">
              <img src={img} alt={`Gallery ${i}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
          ))}
        </div>

        {/* Apple-style Text */}
        <div className="max-w-3xl mx-auto px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-8 text-lg md:text-2xl text-stone-700 font-light leading-relaxed tracking-wide"
          >
            <p>
              Cumplir 62 años es un motivo de alegría y gratitud.<br className="hidden md:block" />
              Ha sido un camino lleno de experiencias, retos y sueños que siguen vivos.
            </p>
            <p>
              Hoy quiero agradecer a mi familia, amigos y seres queridos por acompañarme en cada etapa de la vida.
            </p>
            <p>
              Nada me haría más feliz que celebrar este momento especial junto a ustedes.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Location Section */}
      <Section className="bg-white">
        <div className="max-w-6xl w-full grid md:grid-rows-1 md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1">
            <div className="inline-flex items-center gap-2 text-stone-500 mb-4">
              <MapPin className="w-4 h-4" />
              <span className="uppercase tracking-widest text-xs font-bold">Lugar del Evento</span>
            </div>
            <h2 className="font-display text-4xl md:text-5xl mb-6 text-stone-800">Salón Hacienda Tecozautla</h2>
            <div className="flex flex-col gap-4 text-stone-600 mb-8 font-serif text-lg italic">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 mt-1 shrink-0" />
                <div className="space-y-4">
                  <p>La recepción dará inicio a partir de las 14:30 horas. Será un gusto compartir una tarde llena de alegría,</p>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-4">
              <a 
                href="https://maps.app.goo.gl/QDRvATSPmPvQ7K7AA" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-3 border border-stone-800 text-stone-800 rounded-full hover:bg-stone-800 hover:text-white transition-all"
              >
                <MapPin className="w-4 h-4" />
                Ver en Google Maps
              </a>
              <a 
                href="https://waze.com/ul?q=Azucena%203%20Sur%2035%20Morelos,%20Tecozautla,%20Hgo." 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-3 border border-stone-800 text-stone-800 rounded-full hover:bg-stone-800 hover:text-white transition-all"
              >
                <Navigation className="w-4 h-4" />
                Ver en Waze
              </a>
            </div>
          </div>
          <div className="order-1 md:order-2 rounded-3xl overflow-hidden shadow-2xl h-[400px] bg-stone-200">
            <img 
              src="https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80" 
              alt="Salón Hacienda Tecozautla" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </Section>

      {/* Hotels Section */}
      <Section>
        <div className="max-w-6xl w-full">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 text-stone-500 mb-4">
              <Hotel className="w-4 h-4" />
              <span className="uppercase tracking-widest text-xs font-bold">Hospedaje</span>
            </div>
            <h2 className="font-display text-4xl md:text-5xl text-stone-800">Dónde Quedarse</h2>
            <p className="text-stone-500 mt-4 max-w-2xl mx-auto">
              Hemos seleccionado las mejores opciones cercanas para que disfrutes la fiesta sin preocupaciones.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <HotelCard 
              name="Hotel Boutique El Santuario"
              description="Vistas espectaculares al lago y spa de clase mundial."
              image="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800"
              price="$$$"
            />
            <HotelCard 
              name="Posada del Sol"
              description="Estilo rústico encantador en el corazón del pueblo."
              image="https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&q=80&w=800"
              price="$$"
            />
            <HotelCard 
              name="Cabañas Bosque Azul"
              description="Privacidad total y contacto directo con la naturaleza."
              image="https://images.unsplash.com/photo-1449156001935-d28bc3972451?auto=format&fit=crop&q=80&w=800"
              price="$$"
            />
          </div>
        </div>
      </Section>

      {/* RSVP Section */}
      <Section id="rsvp" className="bg-stone-800 text-white">
        <div className="max-w-2xl w-full">
          {!isSubmitted ? (
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              <div className="text-center mb-12">
                <h2 className="font-display text-4xl md:text-5xl mb-4">Confirma tu Asistencia</h2>
                <p className="text-stone-400">Por favor, confirma antes del 4 de julio.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-xs uppercase tracking-widest font-bold mb-2 text-stone-400">Nombre de la Familia</label>
                  <input 
                    required
                    type="text" 
                    value={formData.familyName}
                    onChange={(e) => setFormData({...formData, familyName: e.target.value})}
                    placeholder="Ej. Familia García"
                    className="w-full bg-stone-700 border-none rounded-xl px-6 py-4 focus:ring-2 focus:ring-stone-500 transition-all outline-none"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs uppercase tracking-widest font-bold mb-2 text-stone-400">Integrantes</label>
                    <div className="relative">
                      <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                      <select 
                        value={formData.members}
                        onChange={(e) => setFormData({...formData, members: e.target.value})}
                        className="w-full bg-stone-700 border-none rounded-xl pl-12 pr-6 py-4 appearance-none focus:ring-2 focus:ring-stone-500 transition-all outline-none"
                      >
                        {[1,2,3,4,5,6,7,8,9,10,11,12].map(n => <option key={n} value={n}>{n} {n === 1 ? 'Persona' : 'Personas'}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-widest font-bold mb-2 text-stone-400">Hotel de Interés</label>
                    <select 
                      value={formData.hotel}
                      onChange={(e) => setFormData({...formData, hotel: e.target.value})}
                      className="w-full bg-stone-700 border-none rounded-xl px-6 py-4 appearance-none focus:ring-2 focus:ring-stone-500 transition-all outline-none"
                    >
                      <option value="Ninguno">No necesito hotel</option>
                      <option value="El Santuario">El Santuario</option>
                      <option value="Posada del Sol">Posada del Sol</option>
                      <option value="Bosque Azul">Bosque Azul</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-widest font-bold mb-2 text-stone-400">Mensaje Especial (Opcional)</label>
                  <textarea 
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    rows={3}
                    placeholder="Alguna alergia o comentario..."
                    className="w-full bg-stone-700 border-none rounded-xl px-6 py-4 focus:ring-2 focus:ring-stone-500 transition-all outline-none resize-none"
                  ></textarea>
                </div>

                <button 
                  type="submit"
                  className="w-full py-5 bg-[#d4af37] text-stone-900 rounded-xl font-bold uppercase tracking-widest text-sm hover:bg-[#c5a028] transition-all shadow-lg active:scale-95"
                >
                  Confirmar Asistencia
                </button>
              </form>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-center py-12"
            >
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                className="w-24 h-24 bg-[#d4af37]/20 rounded-full flex items-center justify-center mx-auto mb-8 border border-[#d4af37]/30"
              >
                <CheckCircle2 className="w-12 h-12 text-[#d4af37]" />
              </motion.div>
              
              <motion.h2 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="font-display text-5xl md:text-6xl mb-6 text-[#d4af37]"
              >
                ¡Muchas Gracias!
              </motion.h2>
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="space-y-4"
              >
                <p className="font-serif text-2xl md:text-3xl italic text-stone-200">
                  "¡Te esperamos con mucha alegría!"
                </p>
                <p className="text-stone-400 text-lg">
                  Prepárate para disfrutar de la mejor fiesta del año.
                </p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="flex justify-center gap-6 mt-12"
              >
                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
                  <Heart className="w-8 h-8 text-red-500 fill-red-500" />
                </motion.div>
                <motion.div animate={{ rotate: [0, 15, -15, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                  <Sparkles className="w-8 h-8 text-yellow-400" />
                </motion.div>
                <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 2.5 }}>
                  <Gift className="w-8 h-8 text-blue-400" />
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </div>
      </Section>

      {/* Footer */}
      <footer className="py-12 bg-stone-900 text-stone-500 text-center border-t border-stone-800">
        <p className="font-serif italic text-lg mb-2">"La vida es mejor cuando la celebramos juntos"</p>
        <p className="text-xs uppercase tracking-widest">© 2026 • Invitación Creada con Amor</p>
      </footer>
    </div>
  );
}
