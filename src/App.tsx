import { useState, useEffect, useRef, useMemo } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "motion/react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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
  Navigation,
  X,
  MessageCircle,
  Search,
  Trash2,
  AlertCircle
} from "lucide-react";
import { cn } from "./lib/utils";
import LoginPage from "./components/LoginPage";
import AdminDashboard from "./components/AdminDashboard";
import { db } from "./firebase";
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  updateDoc, 
  doc, 
  serverTimestamp 
} from "firebase/firestore";

// --- Components ---

const Section = ({ children, className, id }: { children: React.ReactNode; className?: string; id?: string }) => (
  <section id={id} className={cn("min-h-screen relative flex flex-col items-center justify-center px-6 py-20", className)}>
    {children}
  </section>
);

const HotelCard = ({ name, description, image, price, onClick }: { name: string; description: string; image: string; price: string; onClick?: () => void }) => (
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
      <button onClick={onClick} className="mt-4 text-stone-800 font-semibold text-sm flex items-center gap-2 hover:gap-3 transition-all">
        <MapPin className="w-4 h-4" /> Ver más
      </button>
    </div>
  </motion.div>
);

const hotelsData = [
  {
    name: "Hotel Boutique El Santuario",
    description: "Vistas espectaculares al lago y spa de clase mundial.",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800",
    price: "$$$",
    whatsapp: "521234567890",
    mapsUrl: "https://maps.app.goo.gl/QDRvATSPmPvQ7K7AA",
    images: [
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=800"
    ]
  },
  {
    name: "Posada del Sol",
    description: "Estilo rústico encantador en el corazón del pueblo.",
    image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&q=80&w=800",
    price: "$$",
    whatsapp: "521234567890",
    mapsUrl: "https://maps.app.goo.gl/QDRvATSPmPvQ7K7AA",
    images: [
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&q=80&w=800"
    ]
  },
  {
    name: "Cabañas Bosque Azul",
    description: "Privacidad total y contacto directo con la naturaleza.",
    image: "https://images.unsplash.com/photo-1449156001935-d28bc3972451?auto=format&fit=crop&q=80&w=800",
    price: "$$",
    whatsapp: "521234567890",
    mapsUrl: "https://maps.app.goo.gl/QDRvATSPmPvQ7K7AA",
    images: [
      "https://images.unsplash.com/photo-1449156001935-d28bc3972451?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1470165301023-58dab8118cc9?auto=format&fit=crop&q=80&w=800"
    ]
  }
];

const galleryImages = [
  "https://fileuk.netlify.app/f_1.png",
  "https://fileuk.netlify.app/f_2.png",
  "https://fileuk.netlify.app/f_3.png",
  "https://fileuk.netlify.app/f_4.png",
  "https://fileuk.netlify.app/f_5.png",
  "https://fileuk.netlify.app/f_6.png",
  "https://fileuk.netlify.app/f_7.png",
  "https://fileuk.netlify.app/f_8.png",
  "https://fileuk.netlify.app/f_9.png",
  "https://fileuk.netlify.app/f_10.png"
];

const PhotoPile = () => {
  const [state, setState] = useState({ count: 1, cycle: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      setState((prev) => {
        if (prev.count >= galleryImages.length) {
          return { count: 1, cycle: prev.cycle + 1 };
        }
        return { ...prev, count: prev.count + 1 };
      });
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  const transforms = useMemo(() => {
    return galleryImages.map(() => ({
      rotate: Math.random() * 40 - 20,
      x: Math.random() * 80 - 40,
      y: Math.random() * 80 - 40,
    }));
  }, []);

  return (
    <div className="relative w-full h-[450px] md:h-[600px] flex items-center justify-center">
      <AnimatePresence>
        {galleryImages.slice(0, state.count).map((img, index) => (
          <motion.div
            key={`${index}-${state.cycle}`}
            initial={{ opacity: 0, scale: 1.5, y: -100, rotate: transforms[index].rotate - 15 }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              x: transforms[index].x, 
              y: transforms[index].y, 
              rotate: transforms[index].rotate 
            }}
            exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.4 } }}
            transition={{ type: "spring", damping: 15, stiffness: 100 }}
            className="absolute w-48 md:w-64 bg-white p-2 pb-8 md:p-3 md:pb-12 shadow-2xl rounded-sm border border-stone-200"
            style={{ zIndex: index }}
          >
            <div className="w-full aspect-[3/4] overflow-hidden bg-stone-100">
              <img src={img} alt={`Gallery ${index}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

function InvitationPage() {
  const [hasEntered, setHasEntered] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState<typeof hotelsData[0] | null>(null);
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
  const [isCancelling, setIsCancelling] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isGoogleAuth, setIsGoogleAuth] = useState(false);
  const [generatedId, setGeneratedId] = useState("");
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelSearch, setCancelSearch] = useState("");
  const [cancelResults, setCancelResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  
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
    if (e) e.preventDefault();
    
    const shortId = `FAM-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    
    const payload = {
      familyName: formData.familyName,
      members: Number(formData.members),
      hotel: formData.hotel,
      message: formData.message,
      status: 'Confirmado',
      createdAt: serverTimestamp(),
      guestId: shortId
    };

    console.log("Guardando RSVP en Firebase:", payload);

    try {
      await addDoc(collection(db, "guests"), payload);
      setGeneratedId(shortId);
      setIsSubmitted(true);
    } catch (error) {
      console.error("Error saving RSVP:", error);
      alert("Hubo un error al guardar tu confirmación. Por favor intenta de nuevo.");
    }
  };

  const handleCancelSearch = async () => {
    if (!cancelSearch.trim()) return;
    
    setIsSearching(true);
    setSearchError("");
    setCancelResults([]);

    try {
      const guestsRef = collection(db, "guests");
      // Search by ID or Family Name
      let q = query(guestsRef, where("guestId", "==", cancelSearch.trim().toUpperCase()));
      let snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        // Try searching by family name (case sensitive in Firestore, so we might need to be careful)
        q = query(guestsRef, where("familyName", "==", cancelSearch.trim()));
        snapshot = await getDocs(q);
      }

      if (snapshot.empty) {
        setSearchError("No encontramos ninguna invitación con ese ID o nombre de familia.");
      } else {
        const results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCancelResults(results);
      }
    } catch (error) {
      console.error("Error searching for guest:", error);
      setSearchError("Error al buscar. Intenta de nuevo.");
    } finally {
      setIsSearching(false);
    }
  };

  const confirmCancellation = async (docId: string) => {
    try {
      const guestRef = doc(db, "guests", docId);
      await updateDoc(guestRef, {
        status: 'Cancelado'
      });
      setIsCancelling(true);
      setIsSubmitted(true);
      setShowCancelModal(false);
    } catch (error) {
      console.error("Error cancelling RSVP:", error);
      alert("Error al cancelar. Intenta de nuevo.");
    }
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
            {/* Scroll Indicator - Above the text */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5, duration: 1 }}
              className="flex flex-col items-center gap-2 text-white/50 mb-12 md:mb-16"
            >
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <ChevronDown className="w-8 h-8 md:w-10 md:h-10" />
              </motion.div>
              <span className="text-xs md:text-sm uppercase tracking-[0.4em] font-medium">Desliza</span>
            </motion.div>

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
                <span>Tecozautla, Hidalgo.</span>
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
      <section className="bg-stone-50 py-12 md:py-20 overflow-hidden">
        <PhotoPile />

        {/* Apple-style Text */}
        <div className="max-w-3xl mx-auto px-8 text-center mt-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-8 text-lg md:text-2xl text-stone-700 font-light leading-relaxed tracking-wide"
          >
            <p>
              Cumplir 62 años es un motivo de alegría y gratitud.
            </p>
            <p>
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
                href="https://waze.com/ul?q=Azucena%20%2334%20tecozautla&navigate=yes" 
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
            {hotelsData.map((hotel, index) => (
              <HotelCard 
                key={index}
                name={hotel.name}
                description={hotel.description}
                image={hotel.image}
                price={hotel.price}
                onClick={() => setSelectedHotel(hotel)}
              />
            ))}
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

                <div className="flex flex-col gap-4 pt-2">
                  <button 
                    type="submit"
                    className="w-full py-5 bg-[#d4af37] text-stone-900 rounded-xl font-bold uppercase tracking-widest text-sm hover:bg-[#c5a028] transition-all shadow-lg active:scale-95"
                  >
                    Confirmar Asistencia
                  </button>
                  
                  <button 
                    type="button"
                    onClick={() => setShowCancelModal(true)}
                    className="w-full py-4 bg-transparent text-stone-400 border border-stone-600 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-stone-700/50 hover:text-white transition-all"
                  >
                    No podré asistir / Cancelar
                  </button>
                </div>
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
                {isCancelling ? "Entendido" : "¡Muchas Gracias!"}
              </motion.h2>
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="space-y-6"
              >
                <p className="font-serif text-2xl md:text-3xl italic text-stone-200">
                  {isCancelling 
                    ? "Lamentamos que no puedas acompañarnos." 
                    : "¡Te esperamos con mucha alegría!"}
                </p>
                
                {!isCancelling && generatedId && (
                  <div className="bg-stone-700/50 p-6 rounded-2xl border border-[#d4af37]/30 inline-block">
                    <p className="text-xs uppercase tracking-widest text-stone-400 mb-2">Tu ID de Invitación</p>
                    <p className="text-3xl font-mono font-bold text-[#d4af37] tracking-tighter">{generatedId}</p>
                    <p className="text-[10px] text-stone-500 mt-2">Guarda este ID por si necesitas cancelar después.</p>
                  </div>
                )}

                <p className="text-stone-400 text-lg">
                  {isCancelling 
                    ? "Gracias por avisarnos, ¡nos vemos en la próxima!" 
                    : "Prepárate para disfrutar de la mejor fiesta del año."}
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

      {/* Cancel Modal */}
      <AnimatePresence>
        {showCancelModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            onClick={() => setShowCancelModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-stone-900 text-white rounded-3xl overflow-hidden shadow-2xl w-full max-w-md border border-stone-800"
            >
              <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-display text-2xl text-[#d4af37]">Cancelar Asistencia</h3>
                  <button onClick={() => setShowCancelModal(false)} className="text-stone-500 hover:text-white">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <p className="text-stone-400 text-sm mb-6">
                  Ingresa tu ID de invitación o el nombre de tu familia tal como lo registraste.
                </p>

                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                    <input 
                      type="text" 
                      value={cancelSearch}
                      onChange={(e) => setCancelSearch(e.target.value)}
                      placeholder="ID (FAM-XXXX) o Familia..."
                      className="w-full bg-stone-800 border-none rounded-xl pl-12 pr-4 py-4 focus:ring-2 focus:ring-[#d4af37]/50 transition-all outline-none"
                    />
                  </div>
                  
                  <button 
                    onClick={handleCancelSearch}
                    disabled={isSearching}
                    className="w-full py-4 bg-stone-700 hover:bg-stone-600 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                  >
                    {isSearching ? "Buscando..." : "Buscar Invitación"}
                  </button>

                  {searchError && (
                    <div className="flex items-center gap-2 text-red-400 text-xs bg-red-400/10 p-3 rounded-lg">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      {searchError}
                    </div>
                  )}

                  <div className="space-y-3 mt-6">
                    {cancelResults.map((guest) => (
                      <div key={guest.id} className="bg-stone-800/50 p-4 rounded-xl border border-stone-700 flex justify-between items-center">
                        <div>
                          <p className="font-bold text-stone-200">{guest.familyName}</p>
                          <p className="text-[10px] text-stone-500 uppercase tracking-widest">{guest.guestId}</p>
                        </div>
                        {guest.status === 'Cancelado' ? (
                          <span className="text-[10px] uppercase font-bold text-red-500 bg-red-500/10 px-2 py-1 rounded">Ya Cancelado</span>
                        ) : (
                          <button 
                            onClick={() => confirmCancellation(guest.id)}
                            className="p-2 bg-red-500/20 hover:bg-red-500 text-red-500 hover:text-white rounded-lg transition-all"
                            title="Confirmar Cancelación"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="py-12 bg-stone-900 text-stone-500 text-center border-t border-stone-800">
        <p className="font-serif italic text-lg mb-2">"La vida es mejor cuando la celebramos juntos"</p>
        <p className="text-xs uppercase tracking-widest">© 2026 • Invitación Creada con Amor</p>
      </footer>

      {/* Hotel Modal */}
      <AnimatePresence>
        {selectedHotel && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedHotel(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl overflow-hidden shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col"
            >
              <div className="relative h-64 shrink-0">
                <img src={selectedHotel.image} alt={selectedHotel.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                <button 
                  onClick={() => setSelectedHotel(null)}
                  className="absolute top-4 right-4 w-10 h-10 bg-black/50 hover:bg-black/70 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-bold text-stone-800">
                  {selectedHotel.price}
                </div>
              </div>
              
              <div className="p-6 md:p-8 overflow-y-auto">
                <h3 className="font-display text-3xl mb-2 text-stone-800">{selectedHotel.name}</h3>
                <p className="text-stone-600 mb-8 leading-relaxed">{selectedHotel.description}</p>
                
                <div className="grid gap-4">
                  <a 
                    href={`https://wa.me/${selectedHotel.whatsapp}?text=Hola,%20me%20interesa%20reservar%20una%20habitaci%C3%B3n.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-3 w-full py-4 bg-[#25D366] text-white rounded-xl font-bold hover:bg-[#20bd5a] transition-colors"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Contactar por WhatsApp
                  </a>
                  
                  <a 
                    href={selectedHotel.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-3 w-full py-4 bg-stone-100 text-stone-800 rounded-xl font-bold hover:bg-stone-200 transition-colors"
                  >
                    <MapPin className="w-5 h-5" />
                    Ver en Google Maps
                  </a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<InvitationPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<AdminDashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
