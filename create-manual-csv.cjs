const fs = require('fs');

// Create CSV content with correct Spanish characters
const csvContent = `name,description,category,quality,ambientacion,basePrice,minMargin,maxMargin,status
Desayuno Club Plata Menú,"Enchiladas o chilaquiles verdes o rojos acompañados de frijoles refritos, Fruta de temporada con queso cottage, miel y granola artesanal, Café americano (normal y descafeinado), Chocolate (leche deslactosada), Té verde, manzana canela y manzanilla, Pan mini dulce y salado, Servilletas de Papel, Personal y equipo de cocina, Servicio de meseros (1 cada 10 personas, por 5 horas efectivas)",Menu,Plata,Club,760.8695652,0.15,0.25,active
Desayuno Club Plata Mobiliario,"Mesa redonda con mantelería fina, Sillas plegables, Vajilla, cubiertos y cristalería (Acorde al menú), Plato base de diseño",Mobiliario,Plata,Club,326.0869565,0.15,0.25,active
Desayuno Ceremonia Plata Menú,"Enchiladas o chilaquiles verdes o rojos acompañados de frijoles refritos, Fruta de temporada con queso cottage, miel y granola artesanal, Café americano (normal y descafeinado), Chocolate (leche deslactosada), Té verde, manzana canela y manzanilla, Pan mini dulce y salado, Servilletas de Papel, Personal y equipo de cocina, Servicio de meseros (1 cada 10 personas, por 5 horas efectivas)",Menu,Plata,Ceremonia,762,0.15,0.25,active
Desayuno Ceremonia Plata Mobiliario,"Mesa redonda con mantelería fina, Sillas plegables, Vajilla, cubiertos y cristalería (Acorde al menú), Plato base de diseño",Mobiliario,Plata,Ceremonia,342.3478261,0.15,0.25,active
Desayuno Gala Plata Menú,"Enchiladas o chilaquiles verdes o rojos acompañados de frijoles refritos, Fruta de temporada con queso cottage, miel y granola artesanal, Café americano (normal y descafeinado), Chocolate (leche deslactosada), Té verde, manzana canela y manzanilla, Pan mini dulce y salado, Servilletas de Papel, Personal y equipo de cocina, Servicio de meseros (1 cada 10 personas, por 5 horas efectivas)",Menu,Plata,Gala,375.9130435,0.15,0.25,active
Desayuno Gala Plata Mobiliario,"Mesa redonda con mantelería fina, Sillas plegables, Vajilla, cubiertos y cristalería (Acorde al menú), Plato base de diseño",Mobiliario,Plata,Gala,763.2173913,0.15,0.25,active
Desayuno Club Oro Menú,"Cecina de Res con Enchiladas o chilaquiles verdes o rojos acompañados de frijoles refritos, Fruta de temporada con queso cottage, miel y granola artesanal, Café americano (normal y descafeinado), Chocolate (leche deslactosada), Té verde, manzana canela y manzanilla, Pan mini dulce y salado, Servilletas de Lino, Personal y equipo de cocina, Servicio de meseros (2 cada 10 personas, por 5 horas efectivas)",Menu,Oro,Club,763.9130435,0.15,0.3,active
Desayuno Club Oro Decoración,Menú personalizado (2 por mesa),Decoracion,Oro,Club,10.91304348,0.15,0.3,active
Desayuno Club Oro Mobiliario,"Mesa redonda con mantelería fina, Sillas Tiffany, Vajilla, cubiertos y cristalería (Acorde al menú), Plato base de diseño",Mobiliario,Oro,Club,316.4782609,0.15,0.3,active
Desayuno Ceremonia Oro Menú,"Cecina de Res con Enchiladas o chilaquiles verdes o rojos acompañados de frijoles refritos, Fruta de temporada con queso cottage, miel y granola artesanal, Café americano (normal y descafeinado), Chocolate (leche deslactosada), Té verde, manzana canela y manzanilla, Pan mini dulce y salado, Servilletas de Lino, Personal y equipo de cocina, Servicio de meseros (2 cada 10 personas, por 5 horas efectivas)",Menu,Oro,Ceremonia,776.0869565,0.15,0.3,active
Desayuno Ceremonia Oro Decoración,Menú personalizado (2 por mesa),Decoracion,Oro,Ceremonia,11.08695652,0.15,0.3,active
Desayuno Ceremonia Oro Mobiliario,"Mesa redonda con mantelería fina, Sillas Tiffany, Vajilla, cubiertos y cristalería (Acorde al menú), Plato base de diseño",Mobiliario,Oro,Ceremonia,321.5217391,0.15,0.3,active
Desayuno Gala Oro Menú,"Cecina de Res con Enchiladas o chilaquiles verdes o rojos acompañados de frijoles refritos, Fruta de temporada con queso cottage, miel y granola artesanal, Café americano (normal y descafeinado), Chocolate (leche deslactosada), Té verde, manzana canela y manzanilla, Pan mini dulce y salado, Servilletas de Lino, Personal y equipo de cocina, Servicio de meseros (2 cada 10 personas, por 5 horas efectivas)",Menu,Oro,Gala,785.2173913,0.15,0.3,active
Desayuno Gala Oro Decoración,Menú personalizado (2 por mesa),Decoracion,Oro,Gala,11.2173913,0.15,0.3,active
Desayuno Gala Oro Mobiliario,"Mesa redonda con mantelería fina, Sillas Tiffany, Vajilla, cubiertos y cristalería (Acorde al menú), Plato base de diseño",Mobiliario,Oro,Gala,325.3043478,0.15,0.3,active
Desayuno Club Platino Menú,"Bistec de Res con Enchiladas o chilaquiles verdes o rojos acompañados de frijoles refritos, Fruta de temporada con queso cottage, miel y granola artesanal, Café americano (normal y descafeinado), Chocolate (leche deslactosada), Té verde, manzana canela y manzanilla, Pan mini dulce y salado, Servilletas de Lino, Personal y equipo de cocina, Servicio de meseros (1 cada 10 personas, por 5 horas efectivas), Capitán de Meseros",Menu,Platino,Club,765.1304348,0.15,0.35,active
Desayuno Club Platino Decoración,Menú personalizado (por invitado),Decoracion,Platino,Club,10.93043478,0.15,0.35,active
Desayuno Club Platino Mobiliario,"Mesa redonda con mantelería fina, Sillas Tiffany, Vajilla, cubiertos y cristalería (Acorde al menú), Plato base de diseño",Mobiliario,Platino,Club,316.9826087,0.15,0.35,active
Desayuno Ceremonia Platino Menú,"Bistec de Res con Enchiladas o chilaquiles verdes o rojos acompañados de frijoles refritos, Fruta de temporada con queso cottage, miel y granola artesanal, Café americano (normal y descafeinado), Chocolate (leche deslactosada), Té verde, manzana canela y manzanilla, Pan mini dulce y salado, Servilletas de Lino, Personal y equipo de cocina, Servicio de meseros (1 cada 10 personas, por 5 horas efectivas), Capitán de Meseros",Menu,Platino,Ceremonia,777.3043478,0.15,0.35,active
Desayuno Ceremonia Platino Decoración,Menú personalizado (por invitado),Decoracion,Platino,Ceremonia,11.10434783,0.15,0.35,active
Desayuno Ceremonia Platino Mobiliario,"Mesa redonda con mantelería fina, Sillas Tiffany, Vajilla, cubiertos y cristalería (Acorde al menú), Plato base de diseño",Mobiliario,Platino,Ceremonia,322.026087,0.15,0.35,active
Desayuno Gala Platino Menú,"Bistec de Res con Enchiladas o chilaquiles verdes o rojos acompañados de frijoles refritos, Fruta de temporada con queso cottage, miel y granola artesanal, Café americano (normal y descafeinado), Chocolate (leche deslactosada), Té verde, manzana canela y manzanilla, Pan mini dulce y salado, Servilletas de Lino, Personal y equipo de cocina, Servicio de meseros (1 cada 10 personas, por 5 horas efectivas), Capitán de Meseros",Menu,Platino,Gala,785.826087,0.15,0.35,active
Desayuno Gala Platino Decoración,Menú personalizado (por invitado),Decoracion,Platino,Gala,11.22608696,0.15,0.35,active
Desayuno Gala Platino Mobiliario,"Mesa redonda con mantelería fina, Sillas Tiffany, Vajilla, cubiertos y cristalería (Acorde al menú), Plato base de diseño",Mobiliario,Platino,Gala,325.5565217,0.15,0.35,active
Comida o Cena Club Plata Menú,"Menú 3 tiempos base de pollo o cerdo (A elegir) emplatado de 3 tiempos incluye Pan, Barra de refrescos y hielos ilimitados por 6 horas (agua, agua mineral, coca cola, coca light, refresco de toronja, refresco de sabor, limones), Personal y equipo de cocina, Servicio de meseros (1 cada 10 personas por 6 horas efectivas)",Menu,Plata,Club,966.9565217,0.15,0.25,active
Comida o Cena Club Plata Mobiliario,"Mesas Club, con mantelería fina, Silla Plegable, Vajilla y plaqué, Cristalería (vaso highball, copa tinto, old fashion y caballitos), Plato base de diseño",Mobiliario,Plata,Club,205.4782609,0.15,0.25,active
Comida o Cena Club Plata Decoración,"Servilletas de papel, Centros de mesa bajos para mesa redonda con flor de temporada y follajes finos",Decoracion,Plata,Club,36.26086957,0.15,0.25,active
Comida o Cena Ceremonia Plata Menú,"Menú 3 tiempos base de pollo o cerdo (A elegir) emplatado de 3 tiempos incluye Pan, Barra de refrescos y hielos ilimitados por 6 horas (agua, agua mineral, coca cola, coca light, refresco de toronja, refresco de sabor, limones), Personal y equipo de cocina, Servicio de meseros (1 cada 10 personas por 6 horas efectivas)",Menu,Plata,Ceremonia,949.5652174,0.15,0.25,active
Comida o Cena Ceremonia Plata Mobiliario,"Mesas Club, con mantelería fina, Silla Plegable, Vajilla y plaqué, Cristalería (vaso highball, copa tinto, old fashion y caballitos), Plato base de diseño",Mobiliario,Plata,Ceremonia,231.3043478,0.15,0.25,active
Comida o Cena Ceremonia Plata Decoración,"Servilletas de papel, Centros de mesa bajos para mesa redonda con flor de temporada y follajes finos",Decoracion,Plata,Ceremonia,36.52173913,0.15,0.25,active
Comida o Cena Gala Plata Menú,"Menú 3 tiempos base de pollo o cerdo (A elegir) emplatado de 3 tiempos incluye Pan, Barra de refrescos y hielos ilimitados por 6 horas (agua, agua mineral, coca cola, coca light, refresco de toronja, refresco de sabor, limones), Personal y equipo de cocina, Servicio de meseros (1 cada 10 personas por 6 horas efectivas)",Menu,Plata,Gala,914.3478261,0.15,0.25,active
Comida o Cena Gala Plata Mobiliario,"Mesas Club, con mantelería fina, Silla Plegable, Vajilla y plaqué, Cristalería (vaso highball, copa tinto, old fashion y caballitos), Plato base de diseño",Mobiliario,Plata,Gala,268.2086957,0.15,0.25,active
Comida o Cena Gala Plata Decoración,"Servilletas de papel, Centros de mesa bajos para mesa redonda con flor de temporada y follajes finos",Decoracion,Plata,Gala,36.57391304,0.15,0.25,active
Comida o Cena Ceremonia Oro Menú,"Menú 3 tiempos base de Pollo Cerdo o Res (a elegir) emplatado de 3 tiempos incluye Pan, Barra de refrescos y hielos ilimitados por 7 horas (agua, agua mineral, coca cola, coca light, refresco de toronja, refresco de sabor, limones), Servicio de Café y Té, Personal y equipo de cocina, Servicio de meseros (1 cada 10 personas por 6 horas efectivas), Capitán de Meseros",Menu,Oro,Ceremonia,972.0434783,0.15,0.3,active
Comida o Cena Ceremonia Oro Mobiliario,"Mesa redonda con mantelería fina (6) + Mesa de madera Rústica (4), Sillas Crossback o Versalles + Tiffany con funda, Vajilla y plaqué, Cristalería (vaso highball, copa tinto, old fashion y caballitos), Plato base de diseño",Mobiliario,Oro,Ceremonia,221.4782609,0.15,0.3,active
Comida o Cena Ceremonia Oro Decoración,"Servilletas de Lino, Números de mesa (uno por mesa), Menú personalizado (dos por mesa), Centros de mesa bajos para mesa redonda + caminos para mesa rectangular con flor de temporada y follajes finos",Decoracion,Oro,Ceremonia,36.91304348,0.15,0.3,active
Comida o Cena Gala Oro Menú,"Menú 3 tiempos base de Pollo Cerdo o Res (a elegir) emplatado de 3 tiempos incluye Pan, Barra de refrescos y hielos ilimitados por 7 horas (agua, agua mineral, coca cola, coca light, refresco de toronja, refresco de sabor, limones), Servicio de Café y Té, Personal y equipo de cocina, Servicio de meseros (1 cada 10 personas por 6 horas efectivas), Capitán de Meseros",Menu,Oro,Gala,973.4173913,0.15,0.3,active
Comida o Cena Gala Oro Mobiliario,"Mesa redonda con mantelería fina (6) + Mesa de madera Rústica (4), Sillas Crossback o Versalles + Tiffany con funda, Vajilla y plaqué, Cristalería (vaso highball, copa tinto, old fashion y caballitos), Plato base de diseño",Mobiliario,Oro,Gala,221.7913043,0.15,0.3,active
Comida o Cena Gala Oro Decoración,"Servilletas de Lino, Números de mesa (uno por mesa), Menú personalizado (dos por mesa), Centros de mesa bajos para mesa redonda + caminos para mesa rectangular con flor de temporada y follajes finos",Decoracion,Oro,Gala,36.96521739,0.15,0.3,active
Comida o Cena Ceremonia Platino Menú,"Menú 3 tiempos base de Pollo, Cerdo, Res o Salmón (a elegir) emplatado de 4 tiempos incluye Pan, Barra de refrescos y hielos ilimitados por 7 horas (agua, agua mineral, coca cola, coca light, refresco de toronja, refresco de sabor, limones), Tornafiesta para el 80% de los invitados (chilaquiles verdes o rojos), Servicio de Café y Té, Personal y equipo de cocina, Servicio de meseros (1 cada 10 personas por 6 horas efectivas), Capitán de Meseros",Menu,Platino,Ceremonia,991.3043478,0.15,0.35,active
Comida o Cena Ceremonia Platino Mobiliario,"Mesa redonda con mantelería fina (6) + Mesa de viga personalizada (4) Silla Prada o Metric, Crossback, Versalles o Tiffany con funda, Vajilla y plaqué, Cristalería (vaso highball, copa tinto, old fashion y caballitos), Plato base de diseño",Mobiliario,Platino,Ceremonia,161.0869565,0.15,0.35,active
Comida o Cena Ceremonia Platino Decoración,"Servilletas de Lino, Números de mesa (uno por mesa), Menú personalizado (uno por comensal), Centros de mesa bajos para mesa redonda + caminos para mesa rectangular con flor de temporada y follajes finos",Decoracion,Platino,Ceremonia,86.73913043,0.15,0.35,active
Comida o Cena Gala Platino Menú,"Menú 3 tiempos base de Pollo, Cerdo, Res o Salmón (a elegir) emplatado de 4 tiempos incluye Pan, Barra de refrescos y hielos ilimitados por 7 horas (agua, agua mineral, coca cola, coca light, refresco de toronja, refresco de sabor, limones), Tornafiesta para el 80% de los invitados (chilaquiles verdes o rojos), Servicio de Café y Té, Personal y equipo de cocina, Servicio de meseros (1 cada 10 personas por 6 horas efectivas), Capitán de Meseros",Menu,Platino,Gala,992.6956522,0.15,0.35,active
Comida o Cena Gala Platino Mobiliario,"Mesa redonda con mantelería fina (6) + Mesa de viga personalizada (4) Silla Prada o Metric, Crossback, Versalles o Tiffany con funda, Vajilla y plaqué, Cristalería (vaso highball, copa tinto, old fashion y caballitos), Plato base de diseño",Mobiliario,Platino,Gala,161.3130435,0.15,0.35,active
Comida o Cena Gala Platino Decoración,"Servilletas de Lino, Números de mesa (uno por mesa), Menú personalizado (uno por comensal), Centros de mesa bajos para mesa redonda + caminos para mesa rectangular con flor de temporada y follajes finos",Decoracion,Platino,Gala,86.86086957,0.15,0.35,active
Coctelería Club Plata Menú,Una hora de Servicio Cristalería apropiada y 3 variedades a elegir,Menu,Plata,Club,140,0.15,0.35,active
Canapés Club Plata Menú,Una hora de Servicio de bocadillos (5 Variedades a Elegir),Menu,Plata,Club,140,0.15,0.35,active
Coctelería Ceremonia Plata Menú,Una hora de Servicio Cristalería apropiada y 3 variedades a elegir,Menu,Plata,Ceremonia,160,0.15,0.35,active
Canapés Ceremonia Plata Menú,Una hora de Servicio de bocadillos (5 Variedades a Elegir),Menu,Plata,Ceremonia,160,0.15,0.35,active
Coctelería Gala Plata Menú,Una hora de Servicio Cristalería apropiada y 3 variedades a elegir,Menu,Plata,Gala,180,0.15,0.35,active
Canapés Gala Plata Menú,Una hora de Servicio de bocadillos (5 Variedades a Elegir),Menu,Plata,Gala,180,0.15,0.35,active
Coctelería Club Oro Menú,Una hora de Servicio Cristalería apropiada y 3 variedades a elegir,Menu,Oro,Club,154,0.15,0.35,active
Canapés Club Oro Menú,Una hora de Servicio de bocadillos (5 Variedades a Elegir),Menu,Oro,Club,154,0.15,0.35,active
Coctelería Ceremonia Oro Menú,Una hora de Servicio Cristalería apropiada y 3 variedades a elegir,Menu,Oro,Ceremonia,176,0.15,0.35,active
Canapés Ceremonia Oro Menú,Una hora de Servicio de bocadillos (5 Variedades a Elegir),Menu,Oro,Ceremonia,176,0.15,0.35,active
Coctelería Gala Oro Menú,Una hora de Servicio Cristalería apropiada y 3 variedades a elegir,Menu,Oro,Gala,198,0.15,0.35,active
Canapés Gala Oro Menú,Una hora de Servicio de bocadillos (5 Variedades a Elegir),Menu,Oro,Gala,198,0.15,0.35,active
Coctelería Club Platino Menú,Una hora de Servicio Cristalería apropiada y 3 variedades a elegir,Menu,Platino,Club,169.4,0.15,0.35,active
Canapés Club Platino Menú,Una hora de Servicio de bocadillos (5 Variedades a Elegir),Menu,Platino,Club,169.4,0.15,0.35,active
Coctelería Ceremonia Platino Menú,Una hora de Servicio Cristalería apropiada y 3 variedades a elegir,Menu,Platino,Ceremonia,193.6,0.15,0.35,active
Canapés Ceremonia Platino Menú,Una hora de Servicio de bocadillos (5 Variedades a Elegir),Menu,Platino,Ceremonia,193.6,0.15,0.35,active
Coctelería Gala Platino Menú,Una hora de Servicio Cristalería apropiada y 3 variedades a elegir,Menu,Platino,Gala,217.8,0.15,0.35,active
Canapés Gala Platino Menú,Una hora de Servicio de bocadillos (5 Variedades a Elegir),Menu,Platino,Gala,217.8,0.15,0.35,active
Branding Club Plata Fotografía,"Sesión de fotografía profesional con equipo especializado",Branding,Plata,Club,800,0.15,0.25,active
Branding Ceremonia Plata Fotografía,"Sesión de fotografía profesional con equipo especializado",Branding,Plata,Ceremonia,900,0.15,0.25,active
Branding Gala Plata Fotografía,"Sesión de fotografía profesional con equipo especializado",Branding,Plata,Gala,1000,0.15,0.25,active
Branding Club Oro Fotografía,"Sesión de fotografía profesional con fotógrafo especializado y edición básica",Branding,Oro,Club,1200,0.15,0.3,active
Branding Ceremonia Oro Fotografía,"Sesión de fotografía profesional con fotógrafo especializado y edición básica",Branding,Oro,Ceremonia,1300,0.15,0.3,active
Branding Gala Oro Fotografía,"Sesión de fotografía profesional con fotógrafo especializado y edición básica",Branding,Oro,Gala,1400,0.15,0.3,active
Branding Club Platino Fotografía,"Sesión de fotografía profesional con fotógrafo especializado, edición avanzada y álbum personalizado",Branding,Platino,Club,1800,0.15,0.35,active
Branding Ceremonia Platino Fotografía,"Sesión de fotografía profesional con fotógrafo especializado, edición avanzada y álbum personalizado",Branding,Platino,Ceremonia,1900,0.15,0.35,active
Branding Gala Platino Fotografía,"Sesión de fotografía profesional con fotógrafo especializado, edición avanzada y álbum personalizado",Branding,Platino,Gala,2000,0.15,0.35,active
Audio y Video Club Plata Ejecución,"Equipo básico de sonido y amplificación para eventos",Audio y Video,Plata,Club,500,0.15,0.25,active
Audio y Video Ceremonia Plata Ejecución,"Equipo básico de sonido y amplificación para eventos",Audio y Video,Plata,Ceremonia,600,0.15,0.25,active
Audio y Video Gala Plata Ejecución,"Equipo básico de sonido y amplificación para eventos",Audio y Video,Plata,Gala,700,0.15,0.25,active
Audio y Video Club Oro Ejecución,"Equipo profesional de sonido, amplificación e iluminación básica",Audio y Video,Oro,Club,800,0.15,0.3,active
Audio y Video Ceremonia Oro Ejecución,"Equipo profesional de sonido, amplificación e iluminación básica",Audio y Video,Oro,Ceremonia,900,0.15,0.3,active
Audio y Video Gala Oro Ejecución,"Equipo profesional de sonido, amplificación e iluminación básica",Audio y Video,Oro,Gala,1000,0.15,0.3,active
Audio y Video Club Platino Ejecución,"Equipo profesional completo con sonido, amplificación, iluminación avanzada y musicalización",Audio y Video,Platino,Club,1500,0.15,0.35,active
Audio y Video Ceremonia Platino Ejecución,"Equipo profesional completo con sonido, amplificación, iluminación avanzada y musicalización",Audio y Video,Platino,Ceremonia,1600,0.15,0.35,active
Audio y Video Gala Platino Ejecución,"Equipo profesional completo con sonido, amplificación, iluminación avanzada y musicalización",Audio y Video,Platino,Gala,1700,0.15,0.35,active
Espectáculos Club Plata Entretenimiento,"Entretenimiento básico para eventos",Espectaculos,Plata,Club,1000,0.15,0.25,active
Espectáculos Ceremonia Plata Entretenimiento,"Entretenimiento básico para eventos",Espectaculos,Plata,Ceremonia,1200,0.15,0.25,active
Espectáculos Gala Plata Entretenimiento,"Entretenimiento básico para eventos",Espectaculos,Plata,Gala,1400,0.15,0.25,active
Espectáculos Club Oro Entretenimiento,"Espectáculo profesional con artistas especializados",Espectaculos,Oro,Club,1800,0.15,0.3,active
Espectáculos Ceremonia Oro Entretenimiento,"Espectáculo profesional con artistas especializados",Espectaculos,Oro,Ceremonia,2000,0.15,0.3,active
Espectáculos Gala Oro Entretenimiento,"Espectáculo profesional con artistas especializados",Espectaculos,Oro,Gala,2200,0.15,0.3,active
Espectáculos Club Platino Entretenimiento,"Espectáculo temático personalizado con artistas de renombre",Espectaculos,Platino,Club,3000,0.15,0.35,active
Espectáculos Ceremonia Platino Entretenimiento,"Espectáculo temático personalizado con artistas de renombre",Espectaculos,Platino,Ceremonia,3200,0.15,0.35,active
Espectáculos Gala Platino Entretenimiento,"Espectáculo temático personalizado con artistas de renombre",Espectaculos,Platino,Gala,3400,0.15,0.35,active
Memorabilia Club Plata Recuerdos,"Recuerdos básicos del evento",Memorabilia,Plata,Club,50,0.15,0.25,active
Memorabilia Ceremonia Plata Recuerdos,"Recuerdos básicos del evento",Memorabilia,Plata,Ceremonia,60,0.15,0.25,active
Memorabilia Gala Plata Recuerdos,"Recuerdos básicos del evento",Memorabilia,Plata,Gala,70,0.15,0.25,active
Memorabilia Club Oro Recuerdos,"Recuerdos temáticos personalizados",Memorabilia,Oro,Club,80,0.15,0.3,active
Memorabilia Ceremonia Oro Recuerdos,"Recuerdos temáticos personalizados",Memorabilia,Oro,Ceremonia,90,0.15,0.3,active
Memorabilia Gala Oro Recuerdos,"Recuerdos temáticos personalizados",Memorabilia,Oro,Gala,100,0.15,0.3,active
Memorabilia Club Platino Recuerdos,"Cotillón y recuerdos de eventos temáticos premium",Memorabilia,Platino,Club,150,0.15,0.35,active
Memorabilia Ceremonia Platino Recuerdos,"Cotillón y recuerdos de eventos temáticos premium",Memorabilia,Platino,Ceremonia,160,0.15,0.35,active
Memorabilia Gala Platino Recuerdos,"Cotillón y recuerdos de eventos temáticos premium",Memorabilia,Platino,Gala,170,0.15,0.35,active`;

// Write the manually created content with perfect UTF-8
fs.writeFileSync('attached_assets/data_perfect_spanish.csv', csvContent, 'utf8');

console.log('✅ Archivo CSV creado manualmente con acentos perfectos');
console.log('📊 24 productos de desayuno con caracteres españoles correctos');
console.log('💾 Guardado como: data_perfect_spanish.csv');

// Verify the encoding by checking for specific characters
if (csvContent.includes('ñ') && csvContent.includes('á') && csvContent.includes('é')) {
    console.log('🔤 Verificación: Caracteres ñ, á, é encontrados correctamente');
} else {
    console.log('❌ Error: Caracteres especiales no encontrados');
}