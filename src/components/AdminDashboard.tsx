import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Users, Hotel, MessageSquare, LogOut, RefreshCw, LayoutGrid } from "lucide-react";

interface Guest {
  familyName: string;
  members: number;
  hotel: string;
  message: string;
  date: string;
  status?: string;
}

export default function AdminDashboard() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const auth = localStorage.getItem("admin_auth");
    if (!auth) {
      navigate("/login");
    } else {
      fetchGuests();
    }
  }, [navigate]);

  const fetchGuests = async () => {
    setLoading(true);
    setError("");
    try {
      // We'll try to fetch from the backend which will proxy the Google Sheet
      const res = await fetch("/api/admin/guests");
      if (!res.ok) throw new Error("Error al obtener los datos");
      const data = await res.json();
      setGuests(data);
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar los invitados. Asegúrate de que el script de Google tenga la función doGet y esté publicado como 'Cualquier persona'.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_auth");
    navigate("/login");
  };

  const confirmedGuests = guests.filter(g => g.status !== 'Cancelado');
  const totalGuests = confirmedGuests.reduce((acc, guest) => acc + Number(guest.members), 0);
  const tablesNeeded = Math.ceil(totalGuests / 10); // Assuming 10 people per table

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#d4af37] rounded-xl flex items-center justify-center text-white">
            <LayoutGrid className="w-6 h-6" />
          </div>
          <h1 className="font-display text-2xl">Dashboard de Invitados</h1>
        </div>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 text-stone-500 hover:text-red-500 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="hidden md:inline">Cerrar Sesión</span>
        </button>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard 
            icon={<Users className="w-6 h-6 text-blue-500" />}
            label="Total Invitados"
            value={totalGuests.toString()}
            subtext={`${confirmedGuests.length} familias confirmadas`}
          />
          <StatCard 
            icon={<LayoutGrid className="w-6 h-6 text-emerald-500" />}
            label="Mesas Necesarias"
            value={tablesNeeded.toString()}
            subtext="Cálculo basado en 10 personas por mesa"
          />
          <StatCard 
            icon={<Hotel className="w-6 h-6 text-purple-500" />}
            label="Hoteles Solicitados"
            value={confirmedGuests.filter(g => g.hotel !== "Ninguno").length.toString()}
            subtext="Personas que requieren hospedaje"
          />
          <StatCard 
            icon={<LogOut className="w-6 h-6 text-red-400" />}
            label="Cancelaciones"
            value={guests.filter(g => g.status === 'Cancelado').length.toString()}
            subtext="Personas que no asistirán"
          />
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-3xl shadow-sm border border-stone-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-stone-200 flex justify-between items-center">
            <h2 className="font-bold text-stone-800">Lista de Confirmaciones</h2>
            <button 
              onClick={fetchGuests}
              className="p-2 hover:bg-stone-100 rounded-full transition-colors"
              disabled={loading}
            >
              <RefreshCw className={`w-5 h-5 text-stone-500 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-12 text-center text-stone-400 italic">Cargando invitados...</div>
            ) : error ? (
              <div className="p-12 text-center text-red-400">{error}</div>
            ) : guests.length === 0 ? (
              <div className="p-12 text-center text-stone-400 italic">Aún no hay confirmaciones.</div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-stone-50 text-stone-500 text-xs uppercase tracking-widest font-bold">
                    <th className="px-6 py-4">Familia</th>
                    <th className="px-6 py-4">Estado</th>
                    <th className="px-6 py-4">Integrantes</th>
                    <th className="px-6 py-4">Hotel</th>
                    <th className="px-6 py-4">Mensaje</th>
                    <th className="px-6 py-4">Fecha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {guests.map((guest, i) => (
                    <tr key={i} className={`hover:bg-stone-50 transition-colors ${guest.status === 'Cancelado' ? 'opacity-60 grayscale-[0.5]' : ''}`}>
                      <td className="px-6 py-4 font-medium text-stone-800">{guest.familyName}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          guest.status === 'Cancelado' 
                            ? 'bg-red-50 text-red-500' 
                            : 'bg-emerald-50 text-emerald-600'
                        }`}>
                          {guest.status || 'Confirmado'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-sm font-bold">
                          {guest.members}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {guest.hotel === "Ninguno" ? (
                          <span className="text-stone-400 text-sm">No requiere</span>
                        ) : (
                          <span className="bg-purple-50 text-purple-600 px-3 py-1 rounded-full text-sm">
                            {guest.hotel}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {guest.message ? (
                          <div className="flex items-center gap-2 text-stone-600 text-sm max-w-xs truncate" title={guest.message}>
                            <MessageSquare className="w-4 h-4 shrink-0" />
                            {guest.message}
                          </div>
                        ) : (
                          <span className="text-stone-300 italic text-sm">Sin mensaje</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-stone-400 text-xs">
                        {new Date(guest.date).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ icon, label, value, subtext }: { icon: React.ReactNode; label: string; value: string; subtext: string }) {
  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-stone-200">
      <div className="flex items-center gap-4 mb-4">
        <div className="p-3 bg-stone-50 rounded-2xl">
          {icon}
        </div>
        <span className="text-stone-500 text-sm font-medium">{label}</span>
      </div>
      <div className="text-4xl font-display text-stone-900 mb-1">{value}</div>
      <p className="text-stone-400 text-xs">{subtext}</p>
    </div>
  );
}
