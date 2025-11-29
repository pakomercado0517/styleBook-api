import dotenv from "dotenv";
import bcrypt from "bcrypt";
import { db } from "./src/config/db";
import {
  Users,
  Clients,
  Providers,
  Services,
  Employees,
} from "./src/models/index";

dotenv.config();

/**
 * Script de seeders para poblar la base de datos con datos de prueba
 * Ejecutar con: npx ts-node seed-database.ts
 */

async function seedDatabase(): Promise<void> {
  try {
    // Autenticar y sincronizar la base de datos
    await db.authenticate();
    console.log("✅ Database connection established\n");

    console.log("🌱 Starting database seeding...\n");
    const hashedPassword = await bcrypt.hash("Test123!", 10);
    const verifiedAt = new Date();
    console.log("📝 Creating users...");
    const usersData = [
      {
        name: "María",
        apellido: "González",
        email: "cliente@test.com",
        password: hashedPassword,
        phone: "5551234567",
        role: "client" as const,
        is_active: true,
        timezone: "America/Mexico_City",
        email_verified_at: verifiedAt,
      },
      {
        name: "Ana",
        apellido: "Martínez",
        email: "salon.elegance@test.com",
        password: hashedPassword,
        phone: "5559876543",
        role: "provider" as const,
        is_active: true,
        timezone: "America/Mexico_City",
        email_verified_at: verifiedAt,
      },
      {
        name: "Carlos",
        apellido: "Ramírez",
        email: "barberia.caballero@test.com",
        password: hashedPassword,
        phone: "5558765432",
        role: "provider" as const,
        is_active: true,
        timezone: "America/Mexico_City",
        email_verified_at: verifiedAt,
      },
      {
        name: "Laura",
        apellido: "Sánchez",
        email: "spa.zenrelax@test.com",
        password: hashedPassword,
        phone: "5557654321",
        role: "provider" as const,
        is_active: true,
        timezone: "America/Mexico_City",
        email_verified_at: verifiedAt,
      },
    ];
    const users = await Users.bulkCreate(usersData);
    console.log(`✅ Created ${users.length} users\n`);
    console.log("👤 Creating client profile...");
    const clientData = {
      user_id: users[0].id,
      address: "Av. Insurgentes Sur 1234, Col. Del Valle",
      city: "Ciudad de México",
      country: "México",
      preferences: JSON.parse(
        JSON.stringify({
          notifications: true,
          preferredPayment: "credit_card",
        })
      ),
    };
    await Clients.create(clientData);
    console.log("✅ Created 1 client profile\n");
    console.log("🏢 Creating provider profiles...");
    const providersData = [
      {
        user_id: users[1].id,
        business_name: "Salon de Belleza Elegance",
        description:
          "Salón de belleza premium en Polanco. Especialistas en cortes, tintes y tratamientos capilares de alta calidad.",
        business_type: "salon_de_belleza",
        opening_time: "09:00:00",
        closing_time: "20:00:00",
        working_days: JSON.parse(
          JSON.stringify({
            mon: true,
            tue: true,
            wed: true,
            thu: true,
            fri: true,
            sat: true,
            sun: false,
          })
        ),
        average_rating: null,
        latitude: 19.4326,
        longitude: -99.1332,
        address: "Av. Presidente Masaryk 123, Polanco",
        city: "Ciudad de México",
        country: "México",
        is_active: true,
      },
      {
        user_id: users[2].id,
        business_name: "Barbería El Caballero",
        description:
          "Barbería tradicional con estilo moderno. Expertos en cortes clásicos, barba y afeitado con navaja.",
        business_type: "barberia",
        opening_time: "10:00:00",
        closing_time: "21:00:00",
        working_days: JSON.parse(
          JSON.stringify({
            mon: true,
            tue: true,
            wed: true,
            thu: true,
            fri: true,
            sat: true,
            sun: true,
          })
        ),
        average_rating: null,
        latitude: 19.4145,
        longitude: -99.1635,
        address: "Calle Orizaba 45, Roma Norte",
        city: "Ciudad de México",
        country: "México",
        is_active: true,
      },
      {
        user_id: users[3].id,
        business_name: "Spa Zen Relax",
        description:
          "Spa de lujo especializado en masajes terapéuticos, faciales y tratamientos corporales. Ambiente de relajación total.",
        business_type: "spa_wellness",
        opening_time: "08:00:00",
        closing_time: "22:00:00",
        working_days: JSON.parse(
          JSON.stringify({
            mon: true,
            tue: true,
            wed: true,
            thu: true,
            fri: true,
            sat: true,
            sun: false,
          })
        ),
        average_rating: null,
        latitude: 19.3598,
        longitude: -99.2598,
        address: "Av. Santa Fe 482, Santa Fe",
        city: "Ciudad de México",
        country: "México",
        is_active: true,
      },
    ];
    const providers = await Providers.bulkCreate(providersData);
    console.log(`✅ Created ${providers.length} provider profiles\n`);
    console.log("💇 Creating services...");
    const servicesData = [
      {
        provider_id: providers[0].id,
        name: "Corte de Cabello Dama",
        description: "Corte personalizado con lavado y secado incluido",
        duration_minutes: 60,
        price: 450.0,
        category: "corte" as const,
        is_active: true,
      },
      {
        provider_id: providers[0].id,
        name: "Tinte Completo",
        description: "Tinte de raíz a puntas con productos profesionales",
        duration_minutes: 120,
        price: 1200.0,
        category: "tinte" as const,
        is_active: true,
      },
      {
        provider_id: providers[0].id,
        name: "Peinado Elegante",
        description: "Peinado para eventos especiales",
        duration_minutes: 45,
        price: 350.0,
        category: "peinado" as const,
        is_active: true,
      },
      {
        provider_id: providers[0].id,
        name: "Manicure Francesa",
        description: "Manicure clásica con esmaltado francés",
        duration_minutes: 45,
        price: 280.0,
        category: "manicure" as const,
        is_active: true,
      },
      {
        provider_id: providers[0].id,
        name: "Pedicure Spa",
        description: "Pedicure completo con exfoliación y masaje",
        duration_minutes: 60,
        price: 350.0,
        category: "pedicure" as const,
        is_active: true,
      },
      {
        provider_id: providers[0].id,
        name: "Tratamiento de Keratina",
        description: "Alisado brasileño con keratina premium",
        duration_minutes: 180,
        price: 1500.0,
        category: "tratamiento_capilar" as const,
        is_active: true,
      },
      {
        provider_id: providers[1].id,
        name: "Corte Clásico Caballero",
        description: "Corte tradicional con máquina y tijera",
        duration_minutes: 30,
        price: 200.0,
        category: "corte" as const,
        is_active: true,
      },
      {
        provider_id: providers[1].id,
        name: "Arreglo de Barba",
        description: "Perfilado y arreglo de barba con navaja",
        duration_minutes: 20,
        price: 150.0,
        category: "barba" as const,
        is_active: true,
      },
      {
        provider_id: providers[1].id,
        name: "Corte + Barba Combo",
        description: "Servicio completo de corte y arreglo de barba",
        duration_minutes: 45,
        price: 300.0,
        category: "corte" as const,
        is_active: true,
      },
      {
        provider_id: providers[1].id,
        name: "Afeitado Tradicional",
        description: "Afeitado clásico con navaja y toallas calientes",
        duration_minutes: 30,
        price: 180.0,
        category: "afeitado" as const,
        is_active: true,
      },
      {
        provider_id: providers[2].id,
        name: "Masaje Relajante",
        description: "Masaje de cuerpo completo con aceites esenciales",
        duration_minutes: 60,
        price: 800.0,
        category: "masaje" as const,
        is_active: true,
      },
      {
        provider_id: providers[2].id,
        name: "Facial Hidratante",
        description: "Limpieza facial profunda con hidratación intensiva",
        duration_minutes: 75,
        price: 650.0,
        category: "facial" as const,
        is_active: true,
      },
      {
        provider_id: providers[2].id,
        name: "Tratamiento Corporal",
        description: "Exfoliación y envoltura corporal con productos naturales",
        duration_minutes: 90,
        price: 950.0,
        category: "corporal" as const,
        is_active: true,
      },
      {
        provider_id: providers[2].id,
        name: "Aromaterapia",
        description: "Sesión de aromaterapia con masaje y aceites esenciales",
        duration_minutes: 60,
        price: 700.0,
        category: "aromaterapia" as const,
        is_active: true,
      },
    ];
    const services = await Services.bulkCreate(servicesData);
    console.log(`✅ Created ${services.length} services\n`);
    console.log("👨‍💼 Creating employees...");
    const employeesData = [
      {
        provider_id: providers[0].id,
        name: "Sofía Hernández",
        email: "sofia.hernandez@elegance.com",
        phone: "5551111111",
        specialty: "Colorista",
      },
      {
        provider_id: providers[0].id,
        name: "Daniela Torres",
        email: "daniela.torres@elegance.com",
        phone: "5552222222",
        specialty: "Estilista",
      },
      {
        provider_id: providers[0].id,
        name: "Gabriela Flores",
        email: "gabriela.flores@elegance.com",
        phone: "5553333333",
        specialty: "Manicurista",
      },
      {
        provider_id: providers[1].id,
        name: "Miguel Ángel López",
        email: "miguel.lopez@caballero.com",
        phone: "5554444444",
        specialty: "Barbero Master",
      },
      {
        provider_id: providers[1].id,
        name: "Ricardo Morales",
        email: "ricardo.morales@caballero.com",
        phone: "5555555555",
        specialty: "Barbero",
      },
      {
        provider_id: providers[2].id,
        name: "Patricia Ruiz",
        email: "patricia.ruiz@zenrelax.com",
        phone: "5556666666",
        specialty: "Masajista Terapéutica",
      },
      {
        provider_id: providers[2].id,
        name: "Alejandra Castro",
        email: "alejandra.castro@zenrelax.com",
        phone: "5557777777",
        specialty: "Esteticista",
      },
    ];
    const employees = await Employees.bulkCreate(employeesData);
    console.log(`✅ Created ${employees.length} employees\n`);
    console.log("✨ Database seeding completed successfully!\n");
    console.log("📊 Summary:");
    console.log(`   - Users: ${users.length}`);
    console.log(`   - Clients: 1`);
    console.log(`   - Providers: ${providers.length}`);
    console.log(`   - Services: ${services.length}`);
    console.log(`   - Employees: ${employees.length}\n`);
    console.log("🔑 Test Credentials:");
    console.log("   Email: cliente@test.com");
    console.log("   Password: Test123!\n");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

seedDatabase();
