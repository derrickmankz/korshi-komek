import {
  db,
  usersTable,
  tasksTable,
  offersTable,
  reviewsTable,
  activityTable,
  walletTransactionsTable,
} from "@workspace/db";
import { sql } from "drizzle-orm";

async function reset() {
  await db.execute(sql`TRUNCATE TABLE reviews, offers, wallet_transactions, activity_events, tasks, users RESTART IDENTITY CASCADE`);
}

async function main() {
  await reset();

  const now = new Date();
  const minutesAgo = (m: number) => new Date(now.getTime() - m * 60_000);

  await db.insert(usersTable).values([
    {
      id: "user_alia",
      name: "Алия Жумабай",
      avatarUrl: null,
      bio: "Живу у школы №25, всегда рада помочь соседям с мелочами.",
      city: "Алматы",
      district: "мкр. Самал-2",
      ratingSum: 19,
      reviewCount: 4,
      completedJobs: 7,
      walletBalanceTenge: 8400,
      walletHeldTenge: 0,
      joinedAt: new Date("2025-08-12T10:00:00Z"),
    },
    {
      id: "user_dmitry",
      name: "Дмитрий Власов",
      bio: "Свободный график, хожу пешком — всё в радиусе километра.",
      city: "Алматы",
      district: "мкр. Самал-2",
      ratingSum: 24,
      reviewCount: 5,
      completedJobs: 12,
      walletBalanceTenge: 21300,
      walletHeldTenge: 0,
      joinedAt: new Date("2025-06-02T10:00:00Z"),
    },
    {
      id: "user_madina",
      name: "Мадина Сатыбалды",
      bio: "Студентка, помогаю по выходным и вечерам.",
      city: "Алматы",
      district: "мкр. Самал-2",
      ratingSum: 14,
      reviewCount: 3,
      completedJobs: 5,
      walletBalanceTenge: 4200,
      walletHeldTenge: 0,
      joinedAt: new Date("2025-09-20T10:00:00Z"),
    },
    {
      id: "user_arman",
      name: "Арман Каримов",
      bio: "Люблю собак и спокойные прогулки.",
      city: "Алматы",
      district: "мкр. Самал-1",
      ratingSum: 28,
      reviewCount: 6,
      completedJobs: 14,
      walletBalanceTenge: 16700,
      walletHeldTenge: 0,
      joinedAt: new Date("2025-04-15T10:00:00Z"),
    },
    {
      id: "user_olga",
      name: "Ольга Никитина",
      bio: "Работаю из дома, могу присмотреть за цветами или кошкой.",
      city: "Алматы",
      district: "мкр. Самал-3",
      ratingSum: 9,
      reviewCount: 2,
      completedJobs: 3,
      walletBalanceTenge: 1800,
      walletHeldTenge: 0,
      joinedAt: new Date("2025-10-01T10:00:00Z"),
    },
  ]);

  await db.insert(tasksTable).values([
    {
      id: "task_bread",
      ownerId: "user_alia",
      title: "Купить хлеб и молоко в магазине у дома",
      description:
        "Нужна одна буханка серого хлеба и пакет молока 2,5%. Магазин «Маленький» в соседнем доме. Деньги наличными при встрече.",
      category: "groceries",
      status: "open",
      priceTenge: 1500,
      useEscrow: true,
      address: "ул. Мендикулова 80, у подъезда 2",
      latitude: 43.2275,
      longitude: 76.9491,
      distanceMeters: 120,
      escrowStatus: "none",
      createdAt: minutesAgo(8),
    },
    {
      id: "task_dog",
      ownerId: "user_olga",
      title: "Выгулять корги Бублика 30 минут",
      description:
        "Спокойный пёс, любит парк за домом. Обычная прогулка с поводком, обязательно вода с собой. Подойдёт сегодня после 18:00.",
      category: "walk_dog",
      status: "open",
      priceTenge: 2500,
      useEscrow: true,
      address: "ул. Жолдасбекова 28, подъезд 1",
      latitude: 43.2293,
      longitude: 76.9516,
      distanceMeters: 480,
      escrowStatus: "none",
      createdAt: minutesAgo(35),
    },
    {
      id: "task_parcel",
      ownerId: "user_dmitry",
      title: "Забрать посылку из ПВЗ Wildberries",
      description:
        "Маленькая коробка, код выдачи скину в чате после отклика. ПВЗ работает до 21:00.",
      category: "parcel_pickup",
      status: "open",
      priceTenge: 1200,
      useEscrow: false,
      address: "ул. Достык 240, ПВЗ Wildberries",
      latitude: 43.2204,
      longitude: 76.957,
      distanceMeters: 920,
      escrowStatus: null,
      createdAt: minutesAgo(75),
    },
    {
      id: "task_plants",
      ownerId: "user_arman",
      title: "Полить цветы пока я в отъезде (3 дня)",
      description:
        "Уезжаю на выходные, нужно зайти в субботу и воскресенье, полить шесть растений. Ключи передам сегодня.",
      category: "plant_care",
      status: "open",
      priceTenge: 4000,
      useEscrow: true,
      address: "ул. Бостандыкская 12, кв. 47",
      latitude: 43.2253,
      longitude: 76.9438,
      distanceMeters: 650,
      escrowStatus: "none",
      createdAt: minutesAgo(140),
    },
    {
      id: "task_pharmacy",
      ownerId: "user_madina",
      title: "Зайти в аптеку за лекарством",
      description:
        "Нужен Терафлю и витамины Магне В6. Аптека «Европа» в соседнем доме. Чек обязательно.",
      category: "errand",
      status: "open",
      priceTenge: 1000,
      useEscrow: true,
      address: "ул. Аль-Фараби 7, аптека Европа",
      latitude: 43.2231,
      longitude: 76.9462,
      distanceMeters: 220,
      escrowStatus: "none",
      createdAt: minutesAgo(180),
    },
    {
      id: "task_cat",
      ownerId: "user_alia",
      title: "Покормить кошку утром и вечером (выходные)",
      description:
        "Спокойная кошка Масяня, корм и инструкция на месте. Нужно зайти 2 раза в день, минут на 15.",
      category: "pet_sitting",
      status: "in_progress",
      executorId: "user_madina",
      priceTenge: 5000,
      useEscrow: true,
      address: "ул. Мендикулова 80, кв. 19",
      latitude: 43.2274,
      longitude: 76.9489,
      distanceMeters: 100,
      escrowStatus: "held",
      escrowAmountTenge: 5000,
      acceptedOfferId: "off_seeded_cat",
      createdAt: minutesAgo(60 * 24),
    },
    {
      id: "task_done",
      ownerId: "user_dmitry",
      title: "Помочь донести продукты на 5 этаж",
      description:
        "Лифт не работал, спасибо большое за помощь, прошлая неделя.",
      category: "cleaning_help",
      status: "completed",
      executorId: "user_arman",
      priceTenge: 2000,
      useEscrow: true,
      address: "ул. Жолдасбекова 30, подъезд 2",
      latitude: 43.2289,
      longitude: 76.9512,
      distanceMeters: 540,
      escrowStatus: "released",
      escrowAmountTenge: 2000,
      escrowCommissionTenge: 140,
      escrowPayoutTenge: 1860,
      acceptedOfferId: "off_seeded_done",
      createdAt: minutesAgo(60 * 96),
    },
  ]);

  await db.insert(offersTable).values([
    {
      id: "off_a",
      taskId: "task_bread",
      executorId: "user_dmitry",
      priceTenge: 1500,
      message: "Я в магазине через 5 минут — могу взять.",
      status: "pending",
      createdAt: minutesAgo(5),
    },
    {
      id: "off_b",
      taskId: "task_bread",
      executorId: "user_madina",
      priceTenge: 1700,
      message: "Могу зайти сейчас, плюс возьму с собой пакет.",
      status: "pending",
      createdAt: minutesAgo(3),
    },
    {
      id: "off_c",
      taskId: "task_dog",
      executorId: "user_arman",
      priceTenge: 2500,
      message: "Гуляю со своим псом в это же время — присоединюсь к Бублику.",
      status: "pending",
      createdAt: minutesAgo(20),
    },
    {
      id: "off_d",
      taskId: "task_plants",
      executorId: "user_olga",
      priceTenge: 4000,
      message: "Я дома все выходные, без проблем зайду оба дня.",
      status: "pending",
      createdAt: minutesAgo(120),
    },
    {
      id: "off_seeded_cat",
      taskId: "task_cat",
      executorId: "user_madina",
      priceTenge: 5000,
      message: "Готова кормить оба дня, живу в соседнем подъезде.",
      status: "accepted",
      createdAt: minutesAgo(60 * 25),
    },
    {
      id: "off_seeded_done",
      taskId: "task_done",
      executorId: "user_arman",
      priceTenge: 2000,
      message: "Я рядом, помогу через 10 минут.",
      status: "accepted",
      createdAt: minutesAgo(60 * 97),
    },
  ]);

  await db.insert(reviewsTable).values([
    {
      id: "rev_1",
      taskId: "task_done",
      fromUserId: "user_dmitry",
      toUserId: "user_arman",
      rating: 5,
      comment:
        "Арман пришёл за десять минут, перенёс четыре пакета на пятый этаж. Спасибо большое!",
      createdAt: minutesAgo(60 * 95),
    },
    {
      id: "rev_2",
      taskId: "task_done",
      fromUserId: "user_arman",
      toUserId: "user_dmitry",
      rating: 5,
      comment: "Приятный сосед, всё чётко и по делу.",
      createdAt: minutesAgo(60 * 95),
    },
  ]);

  await db.insert(walletTransactionsTable).values([
    {
      id: "wtx_1",
      userId: "user_alia",
      taskId: "task_cat",
      kind: "hold",
      amountTenge: -5000,
      description: "Заморозка по сделке: Покормить кошку Масяню",
      createdAt: minutesAgo(60 * 24),
    },
    {
      id: "wtx_2",
      userId: "user_alia",
      taskId: null,
      kind: "deposit",
      amountTenge: 10000,
      description: "Пополнение кошелька картой",
      createdAt: minutesAgo(60 * 28),
    },
    {
      id: "wtx_3",
      userId: "user_alia",
      taskId: null,
      kind: "deposit",
      amountTenge: 5000,
      description: "Пополнение кошелька картой",
      createdAt: minutesAgo(60 * 50),
    },
  ]);

  await db.insert(activityTable).values([
    {
      id: "act_1",
      kind: "task_created",
      message: "Алия опубликовала: Купить хлеб и молоко",
      taskId: "task_bread",
      userName: "Алия",
      createdAt: minutesAgo(8),
    },
    {
      id: "act_2",
      kind: "task_created",
      message: "Ольга опубликовала: Выгулять корги Бублика",
      taskId: "task_dog",
      userName: "Ольга",
      createdAt: minutesAgo(35),
    },
    {
      id: "act_3",
      kind: "task_accepted",
      message: "Мадина взялась за: Покормить кошку Масяню",
      taskId: "task_cat",
      userName: "Мадина",
      createdAt: minutesAgo(60 * 24),
    },
    {
      id: "act_4",
      kind: "task_completed",
      message: "Арман завершил: Помочь донести продукты",
      taskId: "task_done",
      userName: "Арман",
      createdAt: minutesAgo(60 * 96),
    },
    {
      id: "act_5",
      kind: "review_posted",
      message: "Дмитрий поставил Арману 5 звёзд",
      taskId: "task_done",
      userName: "Дмитрий",
      createdAt: minutesAgo(60 * 95),
    },
  ]);

  console.log("Seed complete.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
