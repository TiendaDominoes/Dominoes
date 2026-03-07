// app/sitemap.ts
import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://www.mesasdejuego.com'
    
    let products: any[] = [];
    try {
        const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    } catch (error) {
        console.error("Error obteniendo productos:", error);
    }
    
    const staticUrls: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: `${baseUrl}/Mesas-De-Juego`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/Productos-Del-Hogar`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/Galeria`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/Contacto`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/Quienes-Somos`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.7,
        },
        {
            url: `${baseUrl}/Politica-De-Garantia`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.7,
        },
    ]
    
    const productUrls: MetadataRoute.Sitemap = products?.map((product) => ({
        url: `${baseUrl}/Productos/${product.url}`,
        lastModified: new Date(product._creationTime || Date.now()),
        changeFrequency: 'weekly',
        priority: 0.8,
    })) || []
    
    return [...staticUrls, ...productUrls]
}