"use client";

import { Trash } from "lucide-react";
import { AlertDialog } from "radix-ui";
import { toast } from "sonner";

interface RemoveDialogProps {
    onConfirm: () => Promise<void> | void;
    title?: string;
    description?: string;
}

const RemoveDialog = ({ 
    onConfirm
}: RemoveDialogProps) => {
    
    const handleConfirm = async () => {
        try {
            const promise = Promise.resolve(onConfirm());
            
            toast.promise(promise, {
                loading: 'Eliminando...',
                success: 'Eliminado correctamente',
                error: 'Error al eliminar'
            });
        } catch (error) {
            console.error("Error:", error);
        }
    };

    return (
        <AlertDialog.Root>
            <AlertDialog.Trigger asChild>
                <Trash className="size-6 cursor-pointer"/>
            </AlertDialog.Trigger>
            
            <AlertDialog.Portal>
                <AlertDialog.Overlay className="bg-neutral-900/70 fixed inset-0" />

                <AlertDialog.Content className="fixed left-1/2 top-1/2 max-h-[85vh] w-[90vw] max-w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-md bg-gray-100 p-[25px] shadow-(--shadow-6) focus:outline-none">
                    <AlertDialog.Title className="m-0 text-[17px] font-medium">
                        ¿Estás seguro?
                    </AlertDialog.Title>
                    
                    <AlertDialog.Description className="mb-5 mt-[15px] text-[15px] leading-normal">
                        Esta acción no puede deshacerse. Se eliminará el producto definitivamente.
                    </AlertDialog.Description>

                    <div className="flex justify-end gap-[25px]">
                        <AlertDialog.Cancel asChild>
                            <button className="inline-flex h-[35px] items-center justify-center rounded-md bg-neutral-200 px-[15px] font-medium hover:bg-neutral-300 cursor-pointer">
                                Cancelar
                            </button>
                        </AlertDialog.Cancel>
                        
                        <AlertDialog.Action asChild>
                            <button 
                                onClick={handleConfirm} 
                                className="inline-flex h-[35px] items-center justify-center rounded-md bg-black px-[15px] font-medium hover:bg-neutral-900 text-white cursor-pointer"
                            >
                                Sí, eliminar
                            </button>
                        </AlertDialog.Action>
                    </div>
                </AlertDialog.Content>
            </AlertDialog.Portal>
        </AlertDialog.Root>
    );
};

export default RemoveDialog;