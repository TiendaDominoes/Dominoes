"use client";

import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Search, X, Calendar, Filter } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";

interface OrderFilterProps {
    onFilterResults: (results: any[]) => void;
    initialOrders?: any[];
}

const MONTHS = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 2 }, (_, i) => 2026 + i);

export const OrderFilter = ({ onFilterResults, initialOrders = [] }: OrderFilterProps) => {
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [selectedMonth, setSelectedMonth] = useState<number | "">("");
    const [selectedYear, setSelectedYear] = useState<number | "">(currentYear);
    const [isSearching, setIsSearching] = useState<boolean>(false);
    const [showFilters, setShowFilters] = useState<boolean>(false);
    
    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    
    const filterResults = useQuery(
        api.orders.searchByCustomer,
        (debouncedSearchTerm || selectedMonth || selectedYear) 
            ? { 
                name: debouncedSearchTerm,
                month: selectedMonth || undefined,
                year: selectedYear || undefined,
              }
            : "skip"
    );

    useEffect(() => {
        if (debouncedSearchTerm || selectedMonth || selectedYear) {
            setIsSearching(true);
            if (filterResults) {
                onFilterResults(filterResults);
                setIsSearching(false);
            }
        } else {
            onFilterResults(initialOrders);
        }
    }, [filterResults, debouncedSearchTerm, selectedMonth, selectedYear, initialOrders, onFilterResults]);

    const handleClearSearch = () => {
        setSearchTerm("");
    };

    const handleClearFilters = () => {
        setSelectedMonth("");
        setSelectedYear(currentYear);
    };

    const handleClearAll = () => {
        setSearchTerm("");
        setSelectedMonth("");
        setSelectedYear(currentYear);
    };

    const hasActiveFilters = searchTerm || selectedMonth;

    return (
        <div className="space-y-4 mb-6">
            <div className="relative">
                <div className="relative flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 size-5" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Buscar por Cliente..."
                            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg"
                        />
                        {searchTerm && (
                            <button
                                onClick={handleClearSearch}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <X className="size-5" />
                            </button>
                        )}
                    </div>
                    
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`px-4 py-2 border rounded-lg flex items-center gap-2 transition-colors ${
                            showFilters || selectedMonth 
                                ? "bg-[#B86112] text-white border-[#B86112]" 
                                : "border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                    >
                        <Filter className="size-5" />
                        <span className="hidden sm:inline">Filtros</span>
                        {selectedMonth && (
                            <span className="bg-white text-[#B86112] rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                                1
                            </span>
                        )}
                    </button>
                </div>
                
                {isSearching && (
                    <div className="absolute right-24 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#B86112]"></div>
                    </div>
                )}
            </div>

            {showFilters && (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium flex items-center gap-2">
                            <Calendar className="size-4" />
                            Filtrar por fecha
                        </h3>
                        {selectedMonth && (
                            <button
                                onClick={handleClearFilters}
                                className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
                            >
                                <X className="size-4" />
                                Limpiar filtros
                            </button>
                        )}
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3">
                        <select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value ? parseInt(e.target.value) : "")}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B86112] focus:border-transparent"
                        >
                            <option value="">Todos los meses</option>
                            {MONTHS.map((month, index) => (
                                <option key={month} value={index + 1}>
                                    {month}
                                </option>
                            ))}
                        </select>
                        
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value ? parseInt(e.target.value) : "")}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B86112] focus:border-transparent"
                        >
                            {YEARS.map((year) => (
                                <option key={year} value={year}>
                                    {year}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            )}

            {hasActiveFilters && (
                <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-2">
                        {searchTerm && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                                Cliente: "{searchTerm}"
                                <button onClick={() => setSearchTerm("")} className="hover:text-blue-900">
                                    <X className="size-4" />
                                </button>
                            </span>
                        )}
                        {selectedMonth && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                                {MONTHS[selectedMonth - 1]} {selectedYear}
                                <button onClick={() => setSelectedMonth("")} className="hover:text-green-900">
                                    <X className="size-4" />
                                </button>
                            </span>
                        )}
                    </div>
                    
                    <button
                        onClick={handleClearAll}
                        className="text-sm text-gray-500 hover:text-gray-700"
                    >
                        Limpiar todo
                    </button>
                </div>
            )}
        </div>
    );
};