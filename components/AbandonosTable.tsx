
import React from 'react';
import { UserX, Clock } from 'lucide-react';

const AbandonosTable: React.FC = () => {
  return (
    <div className="bg-slate-900/80 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-2xl shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500 mt-8">
      <div className="p-6 border-b border-white/5 bg-gradient-to-r from-red-500/10 to-transparent flex items-center justify-between">
        <h2 className="text-xl font-black text-white italic uppercase tracking-tighter flex items-center gap-2">
          <UserX className="text-red-500 w-5 h-5" />
          Muro de los <span className="text-red-500">Lamentaciones</span>
        </h2>
        <div className="px-3 py-1 rounded-full bg-red-500/20 border border-red-500/30 text-[10px] font-black text-red-500 uppercase tracking-widest flex items-center gap-1.5">
          <Clock className="w-3 h-3" />
          Pendiente
        </div>
      </div>
      
      <div className="p-12 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-800 border border-white/5 mb-4">
          <UserX className="w-8 h-8 text-slate-600" />
        </div>
        <h3 className="text-white font-black uppercase italic tracking-tight text-lg">Sin bajas confirmadas</h3>
        <p className="text-slate-500 text-xs font-medium mt-2 max-w-sm mx-auto uppercase tracking-wider leading-relaxed">
          Esta sección se actualizará automáticamente conforme los corredores decidan que el sofá es mejor que el pedal.
        </p>
        <div className="mt-6 inline-block px-4 py-2 bg-white/5 rounded-xl border border-white/5 text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">
          Waiting for the next crash...
        </div>
      </div>

      <div className="overflow-x-auto opacity-20 grayscale pointer-events-none">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-950/50">
              <th className="px-6 py-3 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Ciclista</th>
              <th className="px-6 py-3 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Carrera</th>
              <th className="px-6 py-3 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Motivo</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="px-6 py-4 text-slate-600 font-bold uppercase text-xs italic">---</td>
              <td className="px-6 py-4 text-slate-600 font-bold uppercase text-xs italic">---</td>
              <td className="px-6 py-4 text-slate-600 font-bold uppercase text-xs italic">---</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AbandonosTable;
