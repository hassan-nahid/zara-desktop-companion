export class PluginManager {
  constructor() {
    this.plugins = new Map();
  }

  register(plugin) {
    if (!plugin?.name) {
      return;
    }
    this.plugins.set(plugin.name, plugin);
    plugin.init?.();
  }

  get(name) {
    return this.plugins.get(name);
  }

  list() {
    return Array.from(this.plugins.keys());
  }
}
