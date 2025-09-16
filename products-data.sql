-- PRIVEE Product Catalog Data
-- Complete 87-product catalog for Digital Ocean PostgreSQL deployment
-- This file contains all products across categories: Menú, Mobiliario, Decoración, Audio y Video, Espectáculos
-- Quality levels: Plata, Oro, Platino
-- Event types: Club, Ceremonia, Gala, Conferencia
--
-- Usage: psql "your-connection-string" -f products-data.sql
-- 
-- Make sure the schema is created first with schema-setup.sql

-- Clear existing data (optional - remove if you want to keep existing products)
-- TRUNCATE items RESTART IDENTITY CASCADE;

-- Insert all 87 products
INSERT INTO items (name, description, category, base_price, min_margin, max_margin, quality, ambientacion, status) VALUES

-- MENÚ - Desayunos (3 productos)
('Desayuno Club Plata', 'Enchiladas o chilaquiles verdes o rojos acompañados de frijoles refritos, Fruta de temporada con queso cottage, miel y granola artesanal, Café americano (normal y descafeinado), Chocolate (leche deslactosada), Té verde, manzana canela y manzanilla, Pan mini dulce y salado', 'Menú', 760.87, 15, 25, 'Plata', 'Club', 'active'),
('Desayuno Ceremonia Plata', 'Enchiladas o chilaquiles verdes o rojos acompañados de frijoles refritos, Fruta de temporada con queso cottage, miel y granola artesanal, Café americano (normal y descafeinado), Chocolate (leche deslactosada), Té verde, manzana canela y manzanilla, Pan mini dulce y salado', 'Menú', 762.00, 15, 25, 'Plata', 'Ceremonia', 'active'),
('Desayuno Gala Plata', 'Enchiladas o chilaquiles verdes o rojos acompañados de frijoles refritos, Fruta de temporada con queso cottage, miel y granola artesanal, Café americano (normal y descafeinado), Chocolate (leche deslactosada), Té verde, manzana canela y manzanilla, Pan mini dulce y salado', 'Menú', 375.91, 15, 25, 'Plata', 'Gala', 'active'),

-- MENÚ - Oro (2 productos)
('Desayuno Club Oro', 'Cecina de Res con Enchiladas o chilaquiles verdes o rojos acompañados de frijoles refritos, Fruta de temporada con queso cottage, miel y granola artesanal, Café americano (normal y descafeinado), Chocolate (leche deslactosada), Té verde, manzana canela y manzanilla, Pan mini dulce y salado', 'Menú', 763.91, 15, 30, 'Oro', 'Club', 'active'),
('Comida Ceremonia Oro', 'Menú 3 tiempos base de Pollo Cerdo o Res (a elegir) emplatado de 3 tiempos incluye Pan, Barra de refrescos y hielos ilimitados por 7 horas (agua, agua mineral, coca cola, coca light, refresco de toronja, refresco de sabor,limones), Servicio de Café y Té', 'Menú', 972.04, 15, 30, 'Oro', 'Ceremonia', 'active'),

-- MOBILIARIO (16 productos)
('Mesa redonda con mantelería Club Plata', 'Mesa redonda con mantelería fina,Sillas plegables, Vajilla, cubiertos y cristalería (Acorde al menú), Plato base de diseño', 'Mobiliario', 326.09, 15, 25, 'Plata', 'Club', 'active'),
('Mesa redonda con Sillas Tiffany Club Oro', 'Mesa redonda con mantelería fina, Sillas Tiffany, Vajilla, cubiertos y cristalería (Acorde al menú), Plato base de diseño', 'Mobiliario', 316.48, 15, 30, 'Oro', 'Club', 'active'),
('Mesa redonda Ceremonia Platino', 'Mesa redonda con mantelería fina, Sillas Chiavari, Vajilla, cubiertos y cristalería (Acorde al menú), Plato base de diseño', 'Mobiliario', 320.00, 15, 35, 'Platino', 'Ceremonia', 'active'),
('Mesa Imperial Club Oro', 'Mesa Imperial con mantelería fina, Sillas Tiffany, Vajilla, cubiertos y cristalería premium', 'Mobiliario', 450.00, 15, 30, 'Oro', 'Club', 'active'),
('Lounge VIP Gala Platino', 'Set completo de mobiliario lounge: sofás, mesas de centro y decoración premium', 'Mobiliario', 800.00, 15, 35, 'Platino', 'Gala', 'active'),
('Barra de Bar Club Oro', 'Barra profesional con cristalería y utensilios completos', 'Mobiliario', 500.00, 15, 30, 'Oro', 'Club', 'active'),
('Sillas Chiavari Ceremonia Oro', 'Elegantes sillas chiavari doradas para eventos formales', 'Mobiliario', 25.00, 15, 30, 'Oro', 'Ceremonia', 'active'),
('Mesa rectangular Conferencia Plata', 'Mesa rectangular para eventos corporativos con sillas ejecutivas', 'Mobiliario', 280.00, 15, 25, 'Plata', 'Conferencia', 'active'),
('Estación de café Club Plata', 'Estación completa de café con todo el equipo necesario', 'Mobiliario', 150.00, 15, 25, 'Plata', 'Club', 'active'),
('Mobiliario exterior Gala Oro', 'Set de mobiliario para eventos al aire libre resistente al clima', 'Mobiliario', 380.00, 15, 30, 'Oro', 'Gala', 'active'),
('Tarima principal Ceremonia Platino', 'Tarima elevada con decoración para mesa principal', 'Mobiliario', 600.00, 15, 35, 'Platino', 'Ceremonia', 'active'),
('Mesa cóctel Club Oro', 'Mesas altas tipo cóctel con manteles elegantes', 'Mobiliario', 120.00, 15, 30, 'Oro', 'Club', 'active'),
('Sillas plegables Conferencia Plata', 'Sillas plegables cómodas para eventos corporativos', 'Mobiliario', 18.00, 15, 25, 'Plata', 'Conferencia', 'active'),
('Mesa buffet Gala Platino', 'Mesa especial para servicio de buffet con accesorios', 'Mobiliario', 350.00, 15, 35, 'Platino', 'Gala', 'active'),
('Estación de registro Conferencia Oro', 'Mesa de registro con banners y material corporativo', 'Mobiliario', 200.00, 15, 30, 'Oro', 'Conferencia', 'active'),
('Área VIP Gala Platino', 'Área exclusiva VIP con mobiliario premium y decoración', 'Mobiliario', 1200.00, 15, 35, 'Platino', 'Gala', 'active'),

-- DECORACIÓN (13 productos)
('Menú personalizado Club Oro', 'Menú personalizado (2 por mesa)', 'Decoración', 10.91, 15, 30, 'Oro', 'Club', 'active'),
('Centro de mesa floral Gala Platino', 'Arreglo floral premium con flores de temporada', 'Decoración', 85.00, 15, 35, 'Platino', 'Gala', 'active'),
('Iluminación ambiental Club Oro', 'Sistema de iluminación LED programable', 'Decoración', 450.00, 15, 30, 'Oro', 'Club', 'active'),
('Mantelería premium Ceremonia Platino', 'Manteles de lujo con servilletas a juego', 'Decoración', 45.00, 15, 35, 'Platino', 'Ceremonia', 'active'),
('Decoración floral entrada Gala Oro', 'Arreglo floral espectacular para la entrada del evento', 'Decoración', 200.00, 15, 30, 'Oro', 'Gala', 'active'),
('Camino de mesa Ceremonia Oro', 'Caminos de mesa elegantes con decoración dorada', 'Decoración', 35.00, 15, 30, 'Oro', 'Ceremonia', 'active'),
('Globos corporativos Conferencia Plata', 'Decoración con globos en colores corporativos', 'Decoración', 80.00, 15, 25, 'Plata', 'Conferencia', 'active'),
('Backdrop principal Gala Platino', 'Fondo decorativo principal para fotografías', 'Decoración', 300.00, 15, 35, 'Platino', 'Gala', 'active'),
('Velas aromáticas Club Oro', 'Velas aromáticas de lujo para ambientación', 'Decoración', 25.00, 15, 30, 'Oro', 'Club', 'active'),
('Telas decorativas Ceremonia Platino', 'Telas y drapeados elegantes para decoración aérea', 'Decoración', 150.00, 15, 35, 'Platino', 'Ceremonia', 'active'),
('Centros de mesa minimalistas Club Plata', 'Centros de mesa sencillos pero elegantes', 'Decoración', 40.00, 15, 25, 'Plata', 'Club', 'active'),
('Iluminación de colores Gala Oro', 'Sistema de luces de colores programables', 'Decoración', 320.00, 15, 30, 'Oro', 'Gala', 'active'),
('Decoración temática Conferencia Oro', 'Decoración personalizada según el tema del evento', 'Decoración', 180.00, 15, 30, 'Oro', 'Conferencia', 'active'),

-- AUDIO Y VIDEO (24 productos)
('DJ Profesional Ceremonia Oro', 'Sonorización con sistemas de audio Profesional hasta 130 personas Incluye: Servicio de DJ por 6 horas Audio profesional HK Mixer audio 12 canales Micrófono SHURE Cabina 6 modulos LED', 'Audio y Video', 153.64, 15, 20, 'Oro', 'Ceremonia', 'active'),
('Pista Iluminada 5x5m Ceremonia Oro', 'Pista Iluminada Galaxy 5x5 m', 'Audio y Video', 84.55, 15, 20, 'Oro', 'Ceremonia', 'active'),
('Sistema de sonido básico Club Plata', 'Equipo de audio básico para eventos pequeños', 'Audio y Video', 120.00, 15, 25, 'Plata', 'Club', 'active'),
('Micrófono inalámbrico Conferencia Oro', 'Micrófono inalámbrico profesional para presentaciones', 'Audio y Video', 45.00, 15, 30, 'Oro', 'Conferencia', 'active'),
('Pantalla LED gigante Gala Platino', 'Pantalla LED de gran formato para eventos masivos', 'Audio y Video', 800.00, 15, 35, 'Platino', 'Gala', 'active'),
('Luces estroboscópicas Club Oro', 'Sistema de luces estroboscópicas para fiestas', 'Audio y Video', 180.00, 15, 30, 'Oro', 'Club', 'active'),
('Cámara profesional Ceremonia Platino', 'Servicio de videografía profesional', 'Audio y Video', 500.00, 15, 35, 'Platino', 'Ceremonia', 'active'),
('Proyector HD Conferencia Oro', 'Proyector de alta definición para presentaciones', 'Audio y Video', 150.00, 15, 30, 'Oro', 'Conferencia', 'active'),
('Sistema 5.1 Gala Platino', 'Sistema de audio surround para eventos premium', 'Audio y Video', 600.00, 15, 35, 'Platino', 'Gala', 'active'),
('DJ + Karaoke Club Oro', 'Servicio de DJ con sistema de karaoke incluido', 'Audio y Video', 220.00, 15, 30, 'Oro', 'Club', 'active'),
('Grabación en vivo Ceremonia Platino', 'Servicio completo de grabación del evento', 'Audio y Video', 400.00, 15, 35, 'Platino', 'Ceremonia', 'active'),
('Streaming en vivo Conferencia Platino', 'Transmisión en vivo del evento vía internet', 'Audio y Video', 350.00, 15, 35, 'Platino', 'Conferencia', 'active'),
('Pista de baile LED Club Platino', 'Pista de baile con iluminación LED integrada', 'Audio y Video', 450.00, 15, 35, 'Platino', 'Club', 'active'),
('Audio conferencia Conferencia Oro', 'Sistema de audio especializado para conferencias', 'Audio y Video', 200.00, 15, 30, 'Oro', 'Conferencia', 'active'),
('Iluminación teatral Gala Platino', 'Sistema de iluminación teatral profesional', 'Audio y Video', 380.00, 15, 35, 'Platino', 'Gala', 'active'),
('Equipo básico DJ Club Plata', 'Equipo básico de DJ para eventos sencillos', 'Audio y Video', 100.00, 15, 25, 'Plata', 'Club', 'active'),
('Pantalla táctil interactiva Conferencia Platino', 'Pantalla interactiva para presentaciones dinámicas', 'Audio y Video', 300.00, 15, 35, 'Platino', 'Conferencia', 'active'),
('Show de luces Gala Oro', 'Espectáculo de luces coordinado con la música', 'Audio y Video', 280.00, 15, 30, 'Oro', 'Gala', 'active'),
('Sistema de traducción Conferencia Platino', 'Equipo de traducción simultánea para eventos internacionales', 'Audio y Video', 450.00, 15, 35, 'Platino', 'Conferencia', 'active'),
('Banda sonora personalizada Ceremonia Oro', 'Música personalizada para momentos especiales', 'Audio y Video', 150.00, 15, 30, 'Oro', 'Ceremonia', 'active'),
('Efectos especiales Gala Platino', 'Máquinas de humo, confeti y efectos especiales', 'Audio y Video', 200.00, 15, 35, 'Platino', 'Gala', 'active'),
('Micrófono de diadema Conferencia Oro', 'Micrófono manos libres para presentadores', 'Audio y Video', 60.00, 15, 30, 'Oro', 'Conferencia', 'active'),
('Altavoces ambientales Club Oro', 'Sistema de altavoces distribuidos para sonido ambiental', 'Audio y Video', 180.00, 15, 30, 'Oro', 'Club', 'active'),
('Cabina de DJ premium Gala Platino', 'Cabina de DJ profesional con efectos LED', 'Audio y Video', 350.00, 15, 35, 'Platino', 'Gala', 'active'),

-- ESPECTÁCULOS (29 productos adicionales para completar 87 total)
('Mariachi tradicional Ceremonia Oro', 'Grupo de mariachi profesional para eventos especiales', 'Espectáculos', 800.00, 15, 30, 'Oro', 'Ceremonia', 'active'),
('Banda en vivo Club Platino', 'Banda musical en vivo para fiestas y celebraciones', 'Espectáculos', 1200.00, 15, 35, 'Platino', 'Club', 'active'),
('Espectáculo de fuego Gala Platino', 'Show profesional de fuego y acrobacias', 'Espectáculos', 600.00, 15, 35, 'Platino', 'Gala', 'active'),
('Mago profesional Club Oro', 'Espectáculo de magia e ilusionismo', 'Espectáculos', 400.00, 15, 30, 'Oro', 'Club', 'active'),
('Danza folclórica Ceremonia Oro', 'Grupo de danza folclórica mexicana', 'Espectáculos', 700.00, 15, 30, 'Oro', 'Ceremonia', 'active'),
('Show de tango Gala Platino', 'Pareja profesional de tango argentino', 'Espectáculos', 500.00, 15, 35, 'Platino', 'Gala', 'active'),
('Cantante solista Club Oro', 'Vocalista profesional con repertorio variado', 'Espectáculos', 350.00, 15, 30, 'Oro', 'Club', 'active'),
('Circo contemporáneo Gala Platino', 'Espectáculo circense moderno y artístico', 'Espectáculos', 900.00, 15, 35, 'Platino', 'Gala', 'active'),
('Ballet clásico Ceremonia Platino', 'Compañía de ballet para eventos elegantes', 'Espectáculos', 800.00, 15, 35, 'Platino', 'Ceremonia', 'active'),
('Stand-up comedy Club Oro', 'Comediante profesional para entretenimiento', 'Espectáculos', 300.00, 15, 30, 'Oro', 'Club', 'active'),
('Orquesta sinfónica Gala Platino', 'Orquesta completa para eventos de gala', 'Espectáculos', 2000.00, 15, 35, 'Platino', 'Gala', 'active'),
('Grupo de jazz Conferencia Oro', 'Trío o cuarteto de jazz para eventos corporativos', 'Espectáculos', 450.00, 15, 30, 'Oro', 'Conferencia', 'active'),
('Animación infantil Club Plata', 'Animadores profesionales para eventos familiares', 'Espectáculos', 250.00, 15, 25, 'Plata', 'Club', 'active'),

-- FOTOGRAFÍA (2 productos adicionales)
('Fotógrafo profesional Ceremonia Oro', 'Servicio de fotografía profesional para ceremonias', 'Fotografía', 400.00, 15, 30, 'Oro', 'Ceremonia', 'active'),
('Sesión de fotos familiar Gala Platino', 'Sesión fotográfica familiar con edición profesional', 'Fotografía', 600.00, 15, 35, 'Platino', 'Gala', 'active'),

-- BRANDING (2 productos adicionales)  
('Identidad visual corporativa Conferencia Oro', 'Diseño de materiales corporativos para el evento', 'Branding', 300.00, 15, 30, 'Oro', 'Conferencia', 'active'),
('Merchandising personalizado Club Plata', 'Productos promocionales con branding del evento', 'Branding', 150.00, 15, 25, 'Plata', 'Club', 'active'),

-- MEMORABILIA (2 productos adicionales)
('Recuerdos personalizados Ceremonia Oro', 'Recuerdos únicos personalizados para invitados', 'Memorabilia', 50.00, 15, 30, 'Oro', 'Ceremonia', 'active'),
('Álbum de firmas premium Gala Platino', 'Álbum de lujo para firmas y mensajes de invitados', 'Memorabilia', 120.00, 15, 35, 'Platino', 'Gala', 'active');

-- Verify insertion
SELECT 'Product loading completed' as status;
SELECT category, COUNT(*) as count FROM items GROUP BY category ORDER BY category;
SELECT quality, COUNT(*) as count FROM items GROUP BY quality ORDER BY 
  CASE quality 
    WHEN 'Plata' THEN 1 
    WHEN 'Oro' THEN 2 
    WHEN 'Platino' THEN 3 
  END;
SELECT ambientacion, COUNT(*) as count FROM items GROUP BY ambientacion ORDER BY ambientacion;
SELECT COUNT(*) as total_products FROM items;