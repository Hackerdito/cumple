import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Lock, User } from "lucide-react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === "Admin" && password === "cumpleuribe") {
      localStorage.setItem("admin_auth", "true");
      navigate("/dashboard");
    } else {
      setError("Usuario o contraseña incorrectos");
    }
  };

  return (
    <div className="min-h-screen bg-stone-900 flex items-center justify-center px-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-stone-800 p-8 rounded-3xl shadow-2xl border border-stone-700"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#d4af37]/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#d4af37]/30">
            <Lock className="w-8 h-8 text-[#d4af37]" />
          </div>
          <h1 className="font-display text-3xl text-white">Panel de Control</h1>
          <p className="text-stone-400 mt-2">Ingresa tus credenciales</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-xs uppercase tracking-widest font-bold mb-2 text-stone-400">Usuario</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-stone-700 border-none rounded-xl pl-12 pr-6 py-4 text-white focus:ring-2 focus:ring-[#d4af37] transition-all outline-none"
                placeholder="Admin"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest font-bold mb-2 text-stone-400">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-stone-700 border-none rounded-xl pl-12 pr-6 py-4 text-white focus:ring-2 focus:ring-[#d4af37] transition-all outline-none"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          <button 
            type="submit"
            className="w-full py-4 bg-[#d4af37] text-stone-900 rounded-xl font-bold uppercase tracking-widest text-sm hover:bg-[#c5a028] transition-all shadow-lg"
          >
            Entrar
          </button>
        </form>
      </motion.div>
    </div>
  );
}
