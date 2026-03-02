// components/Admin/MigrationButton.tsx
"use client";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { toast } from "sonner";

export const MigrationButton = () => {
    const [isMigrating, setIsMigrating] = useState(false);
    const migrate = useMutation(api.migration.migrateCategoriesToArray);

    const handleMigrate = async () => {
        if (!confirm("¿Ejecutar migración de categorías? Esta acción actualizará todos los productos.")) {
            return;
        }

        try {
            setIsMigrating(true);
            const result = await migrate();
            toast.success(`Migración completada: ${result.migrated} productos actualizados`);
            console.log("Resultado:", result);
        } catch (error) {
            toast.error("Error en migración");
            console.error(error);
        } finally {
            setIsMigrating(false);
        }
    };

    return (
        <>
            <h2>Migración de categorías</h2>
            <button
                onClick={handleMigrate}
                disabled={isMigrating}
                className="bg-yellow-500 text-white px-4 py-2 rounded"
            >
                {isMigrating ? "Migrando..." : "Migrar categorías a array"}
            </button>
        </>
    );
};