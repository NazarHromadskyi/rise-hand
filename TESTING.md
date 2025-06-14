# Testing Rise Hand module for Foundry VTT v13

## Installation

1. **Module is already in the correct folder:** `/Data/modules/rise-hand`
2. **Activate the module in Foundry VTT:**
   - Enter the world
   - Settings → Manage Modules
   - Find "Rise Hand" and activate it
   - Restart the world

## Basic testing via console

After activating the module, open the browser console (F12) and try:

### 1. Basic API commands:

```javascript
// Raise hand (normal priority)
game.riseHand.raiseHand("normal");

// Raise hand (urgent priority)
game.riseHand.raiseHand("urgent");

// Lower hand
game.riseHand.lowerHand();

// View queue
game.riseHand.getQueue();

// Clear queue (GM only)
game.riseHand.clearQueue();
```

### 2. Debug shortcuts:

```javascript
// Raise hand
riseHandDebug.raise();
riseHandDebug.raise("urgent");

// Lower hand
riseHandDebug.lower();

// Show queue
riseHandDebug.queue();

// Clear (GM)
riseHandDebug.clear();
```

## Function testing

### Scenario 1: Basic hand raising

1. **Player 1:** `game.riseHand.raiseHand("normal")`
2. **Check:** Chat message "User raised their hand"
3. **GM:** `game.riseHand.getQueue()` - should show 1 request
4. **GM:** `game.riseHand.giveWord("USER_ID")` - give word

### Scenario 2: Priorities

1. **Player 1:** `game.riseHand.raiseHand("normal")`
2. **Player 2:** `game.riseHand.raiseHand("urgent")`
3. **GM:** `game.riseHand.getQueue()` - urgent should be first

### Scenario 3: Multiple requests

1. **3-4 players:** raise hands with different priorities
2. **GM:** check order in queue
3. **GM:** give word to each in order

## Expected behavior

### ✅ Should work:

- Raising/lowering hand
- Chat messages
- Queue with priorities (urgent -> normal)
- GM can give word and clear queue
- Synchronization between clients via sockets
- API available through `game.riseHand`

### ⚠️ Not yet implemented:

- UI buttons (planned for next version)
- Visual indicators above tokens
- Sound notifications
- Full localization (only basic texts for now)

## v13 Known limitations

- Some Foundry APIs may change
- UI components need additional work with new types
- Testing currently via console only

## Logs & diagnostics

Check console for messages:

```
Rise Hand | Initializing simple module for v13
Rise Hand | Simple module initialized
Rise Hand | Ready! Available commands:
```

If something doesn't work, check:

1. Module is activated in settings
2. No errors in browser console
3. Foundry VTT version 13.345+

The module is ready for basic testing of hand raising functionality!
