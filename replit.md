# Көрші көмек · Помощь соседа

Гиперлокальная платформа взаимопомощи между соседями (Россия/Казахстан, ₸). Соседи публикуют мелкие задания (выгулять собаку, купить хлеб, забрать посылку, полить цветы), исполнители предлагают свою цену, опционально — «Безопасная сделка» с эскроу и комиссией 7%. Рейтинг учитывается только по эскроу-сделкам.

## Стек

Монорепо pnpm:
- `lib/api-spec` — OpenAPI 3.1 (`openapi.yaml`); orval генерирует TS-клиент и Zod-схемы.
- `lib/api-client-react` — сгенерированный TanStack Query клиент.
- `lib/api-zod` — сгенерированные Zod-схемы для валидации тела запросов.
- `lib/db` — Drizzle ORM схема и клиент (Postgres через DATABASE_URL).
- `artifacts/api-server` — Express 5, pino, статически бандлится esbuild. Доступен через `/api/...` (порт 8080).
- `artifacts/neighbor-helper` — React + Vite + wouter + TanStack Query + shadcn UI. Корень — `/`.
- `scripts/seed-neighbor-helper.ts` — сидер демо-данных (`pnpm --filter @workspace/scripts seed:neighbor-helper`).

## Telegram-бот

Бот `@KorshiKomekBot` (токен в секрете `TELEGRAM_BOT_TOKEN`). API-сервер при старте запускает long-polling и обрабатывает:
- `/start <код>` — привязывает текущий чат к пользователю по одноразовому коду из `users.telegram_link_token`.
- `/unlink` или `/stop` — отвязывает чат.

Уведомления и интерактивные кнопки в `artifacts/api-server/src/lib/telegram.ts`:
- `notifyNewOffer` — заказчику. Кнопки: «Принять отклик» (callback `accept:taskId:offerId`) + «Открыть в приложении».
- `notifyOfferAccepted` — исполнителю с кнопкой «Я закончил, ждёт проверки» (`ready:taskId`) и ссылкой на задание; заказчику с кнопками «Подтвердить выполнение» (`complete:taskId`) и «Отменить сделку» (`cancel:taskId`).
- `notifyTaskAwaitingReview` — заказчику, когда исполнитель нажал «Я закончил, ждёт проверки». Кнопки «Подтвердить выполнение»/«Отменить сделку».
- `notifyTaskCompleted` — исполнителю с суммой выплаты.
- `notifyTaskCancelled` — исполнителю.
- `notifyReview` — получателю отзыва, кнопка «Открыть профиль».

Callback-кнопки обрабатываются в `handleCallback` через общие сервисы из `artifacts/api-server/src/services/taskActions.ts` (`acceptOfferAction`, `completeTaskAction`, `cancelTaskAction`) — те же функции вызывают и REST-маршруты, чтобы поведение Telegram и веба было идентичным. Базовый URL для кнопок берётся из `PUBLIC_APP_URL` или `REPLIT_DEV_DOMAIN`.

Эндпоинты привязки (`/api/me/telegram`, GET/POST/DELETE) возвращают `TelegramStatus` с готовой `linkUrl` вида `https://t.me/KorshiKomekBot?start=<код>`. На странице профиля владелец видит карточку `TelegramLinkCard` со ссылкой и резервной командой `/start <код>`.

## Логика

- Аутентификация: signed-cookie сессия (`uid`, secret из `SESSION_SECRET`). Эндпоинты `/api/auth/register`, `/api/auth/login`, `/api/auth/demo`, `/api/auth/logout`. Регистрация: ФИО + телефон/email + пароль (≥6) + адрес дома. Распознавание формата идентификатора в `routes/auth.ts`. Все API-роуты, кроме `/api/healthz` и `/api/auth/*`, закрыты middleware `requireAuth`. На фронте `<AuthGate>` в `App.tsx` показывает `pages/auth.tsx`, пока `useGetMe` не вернёт пользователя; есть кнопка «Войти как демо-пользователь», подкладывающая cookie на seed-аккаунт `user_alia`. Логаут — кнопка с иконкой LogOut в шапке.
- Внутри роутов идентификатор берётся через `getActorId(req)` (`artifacts/api-server/src/lib/currentUser.ts`) — читает signed cookie `uid`, в крайнем случае подставляет `user_alia`.
- Категории: `walk_dog`, `groceries`, `parcel_pickup`, `plant_care`, `pet_sitting`, `errand`, `cleaning_help`, `other`.
- Статусы заданий: `open`, `in_progress`, `completed`, `cancelled`. Дополнительный флаг `awaiting_review` отмечает, что исполнитель сказал «я закончил» и ждёт подтверждения заказчика (статус остаётся `in_progress`, при `completed`/`cancelled` сбрасывается).
- Эскроу-флоу: при принятии отклика средства замораживаются у заказчика; при подтверждении выполнения — выплата исполнителю минус 7% комиссии; при отмене — возврат заказчику. Все движения денег фиксируются в `wallet_transactions`.
- Пометка готовности: `POST /api/tasks/:id/ready` (`markTaskReadyAction`) проставляет `awaiting_review=true`, добавляет событие `task_ready` в активность и шлёт заказчику Telegram-карточку с кнопками подтверждения/отмены.
- Рейтинг хранится как `ratingSum / reviewCount`; обновляется только через `POST /api/tasks/:id/reviews`, доступный после `completed`.
- Лента активности (`activity_events`) пополняется на ключевых событиях.

## Деньги и форматирование

Только целые тенге. Форматирование — `Intl.NumberFormat("ru-RU").format(value) + " ₸"`. Расстояние — `X м` либо `X.X км`. Все строки UI на русском, без эмодзи (вместо них — `lucide-react`).

## Команды

```
pnpm install
pnpm --filter @workspace/api-spec run codegen      # перегенерировать клиент после изменений openapi.yaml
pnpm --filter @workspace/db run db:push            # применить схему Drizzle к БД
pnpm --filter @workspace/scripts run seed:neighbor-helper  # засеять демо-данные
pnpm run typecheck                                 # тайпчек всего монорепо
```

Воркфлоу: `artifacts/api-server: API Server`, `artifacts/neighbor-helper: web`. Перезапускать после изменений в коде.
