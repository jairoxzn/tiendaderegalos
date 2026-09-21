import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

const CATEGORY_NAMES = [
  "Regalos",
  "Peluches",
  "Flores",
  "Globos",
  "Chocolates",
  "Tazas",
  "Accesorios",
  "Tarjetas",
  "Cajas de regalo",
  "Cumpleaños",
  "San Valentín",
  "Día de la Madre",
  "Día del Padre",
  "Graduaciones",
  "Navidad",
  "Personalizados",
  "Otros",
];

interface DemoProduct {
  sku: string;
  name: string;
  category: string;
  cost: number;
  price: number;
  stock: number;
  minStock: number;
  unit?: string;
  isCustomizable?: boolean;
}

const DEMO_PRODUCTS: DemoProduct[] = [
  { sku: "PEL-001", name: "Oso de peluche grande", category: "Peluches", cost: 28, price: 59.9, stock: 15, minStock: 4 },
  { sku: "PEL-002", name: "Oso de peluche mediano", category: "Peluches", cost: 18, price: 39.9, stock: 20, minStock: 5 },
  { sku: "PEL-003", name: "Conejo de peluche", category: "Peluches", cost: 15, price: 34.9, stock: 12, minStock: 3 },
  { sku: "FLO-001", name: "Ramo de 12 rosas rojas", category: "Flores", cost: 35, price: 79.9, stock: 10, minStock: 3 },
  { sku: "FLO-002", name: "Ramo mixto primaveral", category: "Flores", cost: 30, price: 69.9, stock: 8, minStock: 2 },
  { sku: "FLO-003", name: "Rosa individual con envoltura", category: "Flores", cost: 4, price: 12.9, stock: 40, minStock: 10 },
  { sku: "GLO-001", name: "Globo metálico corazón", category: "Globos", cost: 5, price: 14.9, stock: 30, minStock: 8 },
  { sku: "GLO-002", name: "Set de globos para cumpleaños", category: "Globos", cost: 12, price: 29.9, stock: 18, minStock: 5 },
  { sku: "GLO-003", name: "Globo gigante número", category: "Globos", cost: 15, price: 34.9, stock: 10, minStock: 3 },
  { sku: "CHO-001", name: "Caja de chocolates Ferrero", category: "Chocolates", cost: 22, price: 44.9, stock: 25, minStock: 6 },
  { sku: "CHO-002", name: "Chocolate artesanal surtido", category: "Chocolates", cost: 18, price: 39.9, stock: 20, minStock: 5 },
  { sku: "CHO-003", name: "Trufas de chocolate x12", category: "Chocolates", cost: 14, price: 29.9, stock: 22, minStock: 5 },
  { sku: "TAZ-001", name: "Taza personalizada con foto", category: "Tazas", cost: 9, price: 24.9, stock: 30, minStock: 6, isCustomizable: true },
  { sku: "TAZ-002", name: "Taza térmica acero inoxidable", category: "Tazas", cost: 16, price: 34.9, stock: 15, minStock: 4 },
  { sku: "TAZ-003", name: "Set de tazas pareja", category: "Tazas", cost: 20, price: 44.9, stock: 12, minStock: 3 },
  { sku: "ACC-001", name: "Llavero personalizado", category: "Accesorios", cost: 5, price: 14.9, stock: 35, minStock: 8, isCustomizable: true },
  { sku: "ACC-002", name: "Pulsera de regalo", category: "Accesorios", cost: 8, price: 19.9, stock: 25, minStock: 6 },
  { sku: "TAR-001", name: "Tarjeta de cumpleaños", category: "Tarjetas", cost: 2, price: 7.9, stock: 60, minStock: 15 },
  { sku: "TAR-002", name: "Tarjeta de San Valentín", category: "Tarjetas", cost: 2, price: 7.9, stock: 50, minStock: 15 },
  { sku: "TAR-003", name: "Tarjeta de agradecimiento", category: "Tarjetas", cost: 2, price: 6.9, stock: 45, minStock: 10 },
  { sku: "CAJ-001", name: "Caja sorpresa mediana", category: "Cajas de regalo", cost: 25, price: 54.9, stock: 14, minStock: 4 },
  { sku: "CAJ-002", name: "Caja desayuno sorpresa", category: "Cajas de regalo", cost: 32, price: 69.9, stock: 10, minStock: 3 },
  { sku: "CUM-001", name: "Kit de decoración de cumpleaños", category: "Cumpleaños", cost: 20, price: 44.9, stock: 15, minStock: 4 },
  { sku: "SVA-001", name: "Set enamorados San Valentín", category: "San Valentín", cost: 40, price: 89.9, stock: 8, minStock: 2 },
  { sku: "SVA-002", name: 'Oso "Te amo" con corazón', category: "San Valentín", cost: 22, price: 49.9, stock: 12, minStock: 3 },
  { sku: "MAD-001", name: "Set spa para mamá", category: "Día de la Madre", cost: 35, price: 74.9, stock: 10, minStock: 3 },
  { sku: "PAD-001", name: "Kit de regalo para papá", category: "Día del Padre", cost: 30, price: 64.9, stock: 10, minStock: 3 },
  { sku: "GRA-001", name: "Peluche con birrete de graduación", category: "Graduaciones", cost: 20, price: 44.9, stock: 8, minStock: 2 },
  { sku: "NAV-001", name: "Adorno navideño artesanal", category: "Navidad", cost: 10, price: 24.9, stock: 20, minStock: 5 },
  { sku: "PER-001", name: "Mug personalizado con foto", category: "Personalizados", cost: 10, price: 27.9, stock: 18, minStock: 4, isCustomizable: true },
];

const DEMO_CUSTOMERS = [
  { name: "María García", phone: "987111222", email: "maria.garcia@example.com" },
  { name: "Carlos Ramírez", phone: "987222333", email: "carlos.ramirez@example.com" },
  { name: "Ana Torres", phone: "987333444", email: "ana.torres@example.com" },
  { name: "Luis Mendoza", phone: "987444555", email: "luis.mendoza@example.com" },
  { name: "Sofía Chávez", phone: "987555666", email: "sofia.chavez@example.com" },
  { name: "Jorge Salazar", phone: "987666777", email: "jorge.salazar@example.com" },
  { name: "Valeria Flores", phone: "987777888", email: "valeria.flores@example.com" },
  { name: "Diego Quispe", phone: "987888999", email: "diego.quispe@example.com" },
  { name: "Camila Vargas", phone: "987999000", email: "camila.vargas@example.com" },
  { name: "Andrés Paredes", phone: "987000111", email: "andres.paredes@example.com" },
];

const DEMO_SUPPLIERS = [
  { company: "Distribuidora Arequipa Regalos SAC", ruc: "20456789012", contactName: "Rosa Delgado" },
  { company: "Importadora Peluches del Sur EIRL", ruc: "20456789013", contactName: "Miguel Ángel Cuadros" },
  { company: "Florería Mayorista Misti SRL", ruc: "20456789014", contactName: "Elena Rodríguez" },
  { company: "Chocolatería Andina SAC", ruc: "20456789015", contactName: "Fernando Vilca" },
  { company: "Globos & Fiestas Perú EIRL", ruc: "20456789016", contactName: "Patricia Núñez" },
];

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function daysAgo(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

async function main() {
  console.log("Sembrando usuarios...");
  const adminPassword = await bcrypt.hash("Admin123!", 10);
  const vendedorPassword = await bcrypt.hash("Vendedor123!", 10);

  const admin = await db.user.upsert({
    where: { email: "admin@giftflow.pe" },
    update: {},
    create: { name: "Administrador GiftFlow", email: "admin@giftflow.pe", passwordHash: adminPassword, role: "ADMIN" },
  });

  const vendedor = await db.user.upsert({
    where: { email: "vendedor@giftflow.pe" },
    update: {},
    create: { name: "Vendedor GiftFlow", email: "vendedor@giftflow.pe", passwordHash: vendedorPassword, role: "VENDEDOR" },
  });

  console.log("Sembrando categorías...");
  for (const [index, name] of CATEGORY_NAMES.entries()) {
    const slug = slugify(name);
    await db.category.upsert({ where: { slug }, update: {}, create: { name, slug, order: index } });
  }
  const categories = await db.category.findMany();
  const categoryByName = new Map(categories.map((c) => [c.name, c]));

  console.log("Sembrando configuración del negocio...");
  const existingSettings = await db.businessSettings.findFirst();
  if (!existingSettings) {
    await db.businessSettings.create({
      data: {
        storeName: "GiftFlow",
        address: "Arequipa, Perú",
        phone: "51900000000",
        whatsapp: "51900000000",
        currency: "PEN",
        timezone: "America/Lima",
      },
    });
  }

  console.log("Sembrando productos demo...");
  const products: Awaited<ReturnType<typeof db.product.upsert>>[] = [];
  for (const p of DEMO_PRODUCTS) {
    const category = categoryByName.get(p.category);
    if (!category) continue;
    const product = await db.product.upsert({
      where: { sku: p.sku },
      update: {},
      create: {
        sku: p.sku,
        name: p.name,
        slug: slugify(p.name),
        categoryId: category.id,
        cost: p.cost,
        price: p.price,
        stock: p.stock,
        minStock: p.minStock,
        unit: p.unit ?? "UNIDAD",
        isCustomizable: p.isCustomizable ?? false,
        status: "ACTIVO",
      },
    });
    products.push(product);
  }

  const demoDataExists = (await db.customer.count()) >= DEMO_CUSTOMERS.length;
  if (demoDataExists) {
    console.log("Los datos demo (clientes/proveedores/ventas/pedidos) ya existen. Omitiendo esa parte.");
  } else {
    console.log("Sembrando clientes demo...");
    const customers = [];
    for (const c of DEMO_CUSTOMERS) {
      customers.push(await db.customer.create({ data: c }));
    }

    console.log("Sembrando proveedores demo...");
    const suppliers = [];
    for (const s of DEMO_SUPPLIERS) {
      suppliers.push(await db.supplier.create({ data: s }));
    }

    console.log("Sembrando ventas demo...");
    for (let i = 0; i < 10; i++) {
      const customer = Math.random() > 0.2 ? customers[randomInt(0, customers.length - 1)] : null;
      const itemCount = randomInt(1, 3);
      const chosenProducts = Array.from({ length: itemCount }, () => products[randomInt(0, products.length - 1)]);
      let subtotal = 0;
      const items = chosenProducts.map((p) => {
        const quantity = randomInt(1, 2);
        const price = Number(p.price);
        subtotal += price * quantity;
        return { productId: p.id, quantity, price, total: price * quantity };
      });
      const total = subtotal;
      const createdAt = daysAgo(randomInt(0, 6));

      const sellerId = Math.random() > 0.5 ? admin.id : vendedor.id;
      await db.sale.create({
        data: {
          code: `V-DEMO-${String(i + 1).padStart(3, "0")}`,
          customerId: customer?.id,
          userId: sellerId,
          subtotal,
          discount: 0,
          total,
          status: "COMPLETADA",
          createdAt,
          items: { create: items },
          payments: { create: [{ method: "EFECTIVO", amount: total }] },
        },
      });

      for (const item of items) {
        const product = products.find((p) => p.id === item.productId)!;
        const stockBefore = product.stock;
        const stockAfter = Math.max(0, stockBefore - item.quantity);
        await db.product.update({ where: { id: product.id }, data: { stock: stockAfter } });
        await db.inventoryMovement.create({
          data: {
            productId: product.id,
            type: "SALIDA_VENTA",
            quantity: item.quantity,
            stockBefore,
            stockAfter,
            referenceType: "SALE",
            userId: sellerId,
            createdAt,
          },
        });
        product.stock = stockAfter;
      }
    }

    console.log("Sembrando pedidos demo...");
    const orderStatuses = ["PENDIENTE", "CONFIRMADO", "EN_PREPARACION", "LISTO", "ENTREGADO"] as const;
    for (let i = 0; i < 5; i++) {
      const customer = customers[randomInt(0, customers.length - 1)];
      const product = products[randomInt(0, products.length - 1)];
      const quantity = randomInt(1, 3);
      const price = Number(product.price);
      const total = price * quantity;
      const deposit = Math.round(total * 0.3 * 100) / 100;

      await db.order.create({
        data: {
          code: `P-DEMO-${String(i + 1).padStart(3, "0")}`,
          customerId: customer.id,
          userId: admin.id,
          total,
          deposit,
          balance: total - deposit,
          status: orderStatuses[i % orderStatuses.length],
          deliveryDate: daysAgo(-randomInt(1, 10)),
          address: "Av. Ejemplo 123, Arequipa",
          items: { create: [{ productId: product.id, name: product.name, quantity, price, total }] },
        },
      });
    }

    console.log("Sembrando movimientos de caja y gastos demo...");
    const existingOpenRegister = await db.cashRegister.findFirst({ where: { status: "ABIERTA" } });
    if (!existingOpenRegister) {
      const register = await db.cashRegister.create({
        data: { openedById: admin.id, openingAmount: 100, status: "ABIERTA" },
      });
      await db.cashMovement.create({
        data: { cashRegisterId: register.id, type: "INGRESO", amount: 50, description: "Fondo adicional", userId: admin.id },
      });
    } else {
      console.log("Ya existe una caja abierta; se omite la apertura demo.");
    }

    const expenseCategories = ["Alquiler", "Servicios", "Insumos", "Transporte", "Marketing"];
    for (let i = 0; i < 5; i++) {
      await db.expense.create({
        data: {
          category: expenseCategories[i],
          description: `Gasto demo de ${expenseCategories[i].toLowerCase()}`,
          amount: randomInt(30, 300),
          date: daysAgo(randomInt(0, 10)),
          paymentMethod: "EFECTIVO",
          userId: admin.id,
        },
      });
    }
  }

  console.log("\nListo. Usuarios de acceso:");
  console.log("  admin@giftflow.pe / Admin123!");
  console.log("  vendedor@giftflow.pe / Vendedor123!");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
