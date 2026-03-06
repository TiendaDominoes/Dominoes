"use client";

import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Search, X } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";

interface ProductSearchProps {
    onSearchResults: (results: any[]) => void;
    initialProducts?: any[];
}

export const ProductSearch = ({ onSearchResults, initialProducts = [] }: ProductSearchProps) => {
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [isSearching, setIsSearching] = useState<boolean>(false);
    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    const searchResults = useQuery(
        api.products.searchProducts,
        debouncedSearchTerm ? { name: debouncedSearchTerm } : "skip"
    );

    useEffect(() => {
        if (debouncedSearchTerm) {
            setIsSearching(true);
            if (searchResults) {
                onSearchResults(searchResults);
                setIsSearching(false);
            }
        } else {
            onSearchResults(initialProducts);
        }
    }, [searchResults, debouncedSearchTerm, initialProducts, onSearchResults]);

    const handleClearSearch = () => {
        setSearchTerm("");
    };

    return (
        <div className="relative mb-4">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 size-5" />
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar productos"
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
            
            {isSearching && (
                <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#B86112]"></div>
                </div>
            )}
        </div>
    );
};