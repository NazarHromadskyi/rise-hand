# Development Guidelines

## 🚨 Critical Rules

### 1. **Never Use Deprecated APIs**

- ❌ `Application` (V1) → ✅ `foundry.applications.api.ApplicationV2`
- ❌ `renderChatMessage` → ✅ `renderChatMessageHTML`
- ❌ `renderTemplate` → ✅ `foundry.applications.handlebars.renderTemplate`

### 2. **Check Foundry Compatibility**

Before using any API, check:

```bash
# Check current Foundry version
console.log(game.version)

# Check for deprecation warnings in browser console
```

## 📁 Project Structure

```
src/
├── ui/           # ApplicationV2 classes
├── core/         # Business logic
├── types/        # TypeScript definitions
├── utils/        # Helper functions
└── module.ts     # Main entry point

templates/        # Handlebars templates
styles/          # CSS files
lang/            # Localization files
```

## 🔧 Development Workflow

### Before Starting Development:

1. Check latest Foundry API documentation
2. Look for deprecation warnings
3. Use TypeScript strict mode
4. Set up proper linting

### During Development:

1. **Always test in browser console** for deprecation warnings
2. **Use modern event handling** (`data-action` attributes)
3. **Implement proper error handling**
4. **Write TypeScript types**

### Before Commit:

1. Run `npm run build` to check for errors
2. Test module in Foundry
3. Check browser console for warnings
4. Update compatibility in module.json if needed

## 🎯 ApplicationV2 Checklist

When creating new UI components:

- [ ] Extends `foundry.applications.api.ApplicationV2`
- [ ] Has `static DEFAULT_OPTIONS`
- [ ] Has `static PARTS` with template paths
- [ ] Implements `async _renderHTML()`
- [ ] Implements `_replaceHTML()`
- [ ] Uses `data-action` in templates
- [ ] Has proper action handlers (`_onActionName`)

## 🌐 Localization Rules

- **All user-facing text** must be localized
- **Code comments** stay in English
- **Console logs** can be in English
- **Error messages** should be localized

```typescript
// Good
const message = this.localize("RISE_HAND.ButtonText", "Default text");

// Bad
const message = "Raise Hand";
```

## 🚀 Performance Guidelines

### DO:

- Use native event handlers (ApplicationV2 actions)
- Minimize DOM queries
- Cache frequently used elements
- Use async/await for better readability

### DON'T:

- Use jQuery if possible (Foundry is moving away from it)
- Create memory leaks with event listeners
- Block the main thread with heavy operations

## 🧪 Testing Strategy

### Manual Testing:

1. **Different screen sizes** (mobile, tablet, desktop)
2. **Different user roles** (GM, Player)
3. **Multiple browser tabs**
4. **With other modules enabled**

### Automated Testing:

```bash
# Type checking
npm run build

# Linting (if configured)
npm run lint
```

## 📦 Release Checklist

- [ ] All deprecation warnings fixed
- [ ] TypeScript compiles without errors
- [ ] Tested in target Foundry version
- [ ] Updated module.json compatibility
- [ ] Updated CHANGELOG.md
- [ ] Tagged release in git

## 🔍 Debugging Tips

### Common Issues:

1. **"Application not renderable"** → Missing `_renderHTML`/`_replaceHTML`
2. **"Cannot find template"** → Check template path in `PARTS`
3. **"Action not found"** → Check action name matches method name
4. **"Hook deprecated"** → Update to modern hook name

### Debug Console Commands:

```javascript
// Check if module loaded
game.modules.get("rise-hand");

// Check ApplicationV2 instance
game.riseHand.showUI();

// Inspect DOM for data-action attributes
document.querySelectorAll("[data-action]");
```

## 📚 Resources

- [Foundry ApplicationV2 Documentation](https://foundryvtt.com/api/v11/classes/foundry.applications.api.ApplicationV2.html)
- [Migration Guide V1 → V2](https://foundryvtt.com/article/v11-application-migration/)
- [TypeScript Configuration](https://foundryvtt.com/article/typescript/)
