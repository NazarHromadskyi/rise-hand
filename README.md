# Rise Hand - Foundry VTT Module

Модуль для ввічливого підняття руки в Foundry VTT сесіях.

## Функціональність (поточна версія v1.0)

### ✅ Реалізовано:

- 🤚 **Підняття руки** з пріоритетами (звичайна/терміново)
- 📋 **Черга з автоматичним сортуванням** (терміново → звичайна)
- 🎤 **GM управління** (дати слово, видалити, очистити все)
- 🔄 **Real-time синхронізація** між всіма клієнтами
- 💬 **Повідомлення в чаті** про всі дії
- 🌍 **Локалізація** (українська/англійська)
- 🛠️ **API для інтеграції** з іншими модулями

### 🔄 Планується:

- UI кнопки для гравців
- Панель керування для GM
- Візуальні індикатори над токенами
- Звукові сповіщення

## Вимоги

- **Foundry VTT v13.345+** (beta)
- Підтримка ES2022 модулів

## Встановлення

1. Розмістіть папку модуля в `Data/modules/rise-hand`
2. Активуйте модуль в налаштуваннях Foundry VTT
3. Перезапустіть світ

## Використання

### API команди (через консоль)

```javascript
// Підняти руку
game.riseHand.raiseHand("normal"); // звичайний пріоритет
game.riseHand.raiseHand("urgent"); // терміновий пріоритет

// Опустити руку
game.riseHand.lowerHand();

// Переглянути чергу
game.riseHand.getQueue();

// GM: дати слово користувачу
game.riseHand.giveWord("USER_ID");

// GM: видалити з черги
game.riseHand.removeFromQueue("USER_ID");

// GM: очистити всю чергу
game.riseHand.clearQueue();

// Перевірити позицію в черзі
game.riseHand.getUserPosition("USER_ID");
```

### Скорочені debug команди

```javascript
riseHandDebug.raise(); // підняти руку (звичайна)
riseHandDebug.raise("urgent"); // підняти руку (терміново)
riseHandDebug.lower(); // опустити руку
riseHandDebug.queue(); // показати чергу
riseHandDebug.clear(); // очистити чергу (GM)
```

## Тестування

Детальні інструкції по тестуванню див. в [TESTING.md](TESTING.md)

## Розробка

### Структура проекту

```
rise-hand/
├── src/
│   ├── simple-rise-hand.ts          # Головний файл модуля
│   ├── core/
│   │   └── SimpleHandRaiseManager.ts # Логіка черги
│   ├── types/
│   │   └── index.ts                  # TypeScript типи
│   └── utils/
│       └── FoundryUtils.ts          # Допоміжні функції
├── lang/                            # Локалізація
├── dist/                            # Зібрані файли
├── module.json                      # Конфігурація модуля
└── package.json                     # Залежності
```

### Збірка

```bash
npm install    # встановити залежності
npm run build  # зібрати проект
npm run dev    # збірка з відстеженням змін
```

## Особливості v13

- Використовує новий `bundler` moduleResolution
- Підтримка `esnext` target для останніх JS функцій
- Безпечна робота з Foundry API через утилітні функції
- Fallback на консольне тестування через нестабільність UI типів

## API документація

Модуль надає глобальний API через `game.riseHand`:

```typescript
interface RiseHandAPI {
  raiseHand(priority: "normal" | "urgent"): Promise<void>;
  lowerHand(): Promise<void>;
  giveWord(userId: string): Promise<void>;
  removeFromQueue(userId: string): Promise<void>;
  clearQueue(): Promise<void>;
  getQueue(): HandRaiseRequest[];
  isUserInQueue(userId: string): boolean;
  getUserPosition(userId: string): number;
}
```

## Логи

Модуль виводить в консоль:

```
Rise Hand | Initializing simple module for v13
Rise Hand | Simple module initialized
Rise Hand | Ready! Available commands:
```

## Відомі проблеми

- UI компоненти тимчасово відключені через нестабільність типів v13
- Звукові сповіщення можуть не працювати на всіх системах
- Деякі Foundry API можуть змінюватися (v13 в beta)

## Внесок у розробку

1. Fork репозиторію
2. Створіть feature branch
3. Внесіть зміни
4. Протестуйте
5. Створіть Pull Request

## Ліцензія

MIT License

## Підтримка

- GitHub Issues для bug reports
- Discord сервер League of Foundry Developers
- Документація в Wiki (планується)

---

**Модуль готовий для базового використання!**
Дивіться [TESTING.md](TESTING.md) для інструкцій по тестуванню.
