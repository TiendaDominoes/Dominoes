export const formatearMoneda = (cantidad: number) => {
    if (typeof cantidad !== 'number' || isNaN(cantidad)) {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN',
        }).format(0);
    }
    
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
    }).format(cantidad);
};