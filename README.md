# Rise Hand - Foundry VTT Module

A module for polite hand raising in Foundry VTT sessions.

## Features (current version v1.0)

### ✅ Implemented:

- 🤚 **Hand raising** with priorities (normal/urgent)
- 📋 **Queue with automatic sorting** (urgent → normal)
- 🎤 **GM management** (give word, remove, clear all)
- 🔄 **Real-time synchronization** between all clients
- 💬 **Chat messages** for all actions
- 🌍 **Localization** (Ukrainian/English)
- 🛠️ **API for integration** with other modules

### 🔄 Planned:

- UI buttons for players
- Control panel for GM

## Requirements

- **Foundry VTT v13.345+**
- ES2022 modules support

## Installation

1. Place the module folder in `Data/modules/rise-hand`
2. Activate the module in Foundry VTT settings
3. Restart the world

## Usage

### API commands (via console)

```javascript
// Raise hand
game.riseHand.raiseHand("normal"); // normal priority
game.riseHand.raiseHand("urgent"); // urgent priority

// Lower hand
game.riseHand.lowerHand();

// View queue
game.riseHand.getQueue();

// GM: give word to user
game.riseHand.giveWord("USER_ID");

// GM: remove from queue
game.riseHand.removeFromQueue("USER_ID");

// GM: clear entire queue
game.riseHand.clearQueue();

// Check position in queue
game.riseHand.getUserPosition("USER_ID");
```

### Debug shortcuts

```javascript
riseHandDebug.raise(); // raise hand (normal)
riseHandDebug.raise("urgent"); // raise hand (urgent)
riseHandDebug.lower(); // lower hand
riseHandDebug.queue(); // show queue
riseHandDebug.clear(); // clear queue (GM)
```

## Testing

For detailed testing instructions see [TESTING.md](TESTING.md)

## Development

### Project structure

```
rise-hand/
├── src/
│   ├── simple-rise-hand.ts          # Main module file
│   ├── core/
│   │   └── SimpleHandRaiseManager.ts # Queue logic
│   ├── types/
│   │   └── index.ts                  # TypeScript types
│   └── utils/
│       └── FoundryUtils.ts          # Utility functions
├── lang/                            # Localization
├── dist/                            # Built files
├── module.json                      # Module configuration
└── package.json                     # Dependencies
```

### Build

```bash
npm install    # install dependencies
npm run build  # build project
npm run dev    # build with watch mode
```

## v13 Features

- Uses new `bundler` moduleResolution
- Supports `esnext` target for latest JS features
- Safe Foundry API handling through utility functions
- Fallback to console testing due to UI type instability

## API Documentation

The module provides global API through `game.riseHand`:

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

## Logs

The module outputs to console:

```
Rise Hand | Initializing simple module for v13
Rise Hand | Simple module initialized
Rise Hand | Ready! Available commands:
```

## Known Issues

- UI components temporarily disabled due to v13 type instability
- Sound notifications may not work on all systems
- Some Foundry APIs may change (v13 in beta)

## Contributing

1. Fork repository
2. Create feature branch
3. Make changes
4. Test
5. Create Pull Request

## License

MIT License

## Support

- GitHub Issues for bug reports
- Discord server League of Foundry Developers
- Documentation in Wiki (planned)

---

**Module ready for basic usage!**
See [TESTING.md](TESTING.md) for testing instructions.
