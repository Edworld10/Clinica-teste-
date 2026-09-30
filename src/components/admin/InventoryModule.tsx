import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { InventoryItem } from '../../types';
import {
  Package,
  AlertTriangle,
  Plus,
  Minus,
  Search,
  CheckCircle2,
  Calendar,
  Layers,
} from 'lucide-react';

export const InventoryModule: React.FC = () => {
  const { inventory, updateInventoryQuantity } = useClinic();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const filteredItems = inventory.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.batchNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-bold text-[#17212B]">
            Estoque de Medicamentos & Insumos Clínicos
          </h2>
          <p className="text-xs text-[#52606D]">
            Rastreabilidade de lotes, datas de validade e alertas de estoque mínimo.
          </p>
        </div>
      </div>

      {/* Filter and Table */}
      <div className="bg-white rounded-[10px] border border-[#D9DFE5] shadow-xs overflow-hidden">
        <div className="p-4 bg-[#F5F9FD] border-b border-[#D9DFE5] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar insumo ou lote..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#D9DFE5] rounded-[8px] text-xs text-[#17212B] focus:outline-none"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="p-1.5 bg-white border border-[#D9DFE5] rounded-[8px] text-xs text-[#17212B]"
            >
              <option value="all">Todas as Categorias</option>
              <option value="medicamento">Medicamentos</option>
              <option value="material_descartavel">Descartáveis</option>
              <option value="epi">EPIs & Luvas</option>
            </select>
          </div>

          <span className="text-xs text-[#52606D]">
            Total de itens: <strong>{inventory.length}</strong>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-100 text-[#52606D] bg-gray-50/50">
                <th className="py-3 px-4 font-semibold">Produto / Apresentação</th>
                <th className="py-3 px-4 font-semibold">SKU</th>
                <th className="py-3 px-4 font-semibold">Lote</th>
                <th className="py-3 px-4 font-semibold">Validade</th>
                <th className="py-3 px-4 font-semibold">Estoque Atual</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Ajuste Rápido</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredItems.map((item) => {
                const isLow = item.currentQuantity <= item.minQuantity;

                return (
                  <tr key={item.id} className="hover:bg-gray-50/60 transition">
                    <td className="py-3 px-4 font-bold text-[#17212B]">{item.name}</td>
                    <td className="py-3 px-4 font-mono text-gray-500">{item.sku}</td>
                    <td className="py-3 px-4 font-mono text-gray-700">{item.batchNumber}</td>
                    <td className="py-3 px-4 text-gray-700">{item.expirationDate}</td>
                    <td className="py-3 px-4 font-bold text-[#17212B]">
                      {item.currentQuantity} {item.unit}
                    </td>
                    <td className="py-3 px-4">
                      {isLow ? (
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                          Estoque Crítico (&le; {item.minQuantity})
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          Regular
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => updateInventoryQuantity(item.id, -1)}
                          className="w-7 h-7 rounded border border-[#D9DFE5] flex items-center justify-center hover:bg-gray-100 text-gray-700 font-bold"
                          title="Baixar 1 unidade"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => updateInventoryQuantity(item.id, 10)}
                          className="w-7 h-7 rounded bg-[#185BA6] text-white flex items-center justify-center hover:bg-[#144b8a] font-bold"
                          title="Repor +10 unidades"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
