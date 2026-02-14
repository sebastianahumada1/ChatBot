export default function Team() {
  const members = [
    {
      name: "Dr. Albeiro García",
      role: "Especialista en Rehabilitación Oral",
      image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=2070"
    },
    {
      name: "Dra. Angela García",
      role: "Especialista en Ortodoncia",
      image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?q=80&w=2070"
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-4xl font-bold mb-4">Nuestro Equipo</h2>
        <p className="text-gray-600 mb-12 max-w-2xl mx-auto">Profesionales apasionados por la salud y estética dental.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
          {members.map((m, i) => (
            <div key={i} className="bg-white rounded-3xl overflow-hidden shadow-sm">
              <div className="h-80 overflow-hidden">
                <img src={m.image} alt={m.name} className="w-full h-full object-cover" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold">{m.name}</h3>
                <p className="text-blue-600">{m.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
