import EventEmitter from "node:events";

export default class AppEventEmitter extends EventEmitter {
  constructor() {
    super();
  }

  private static instance: AppEventEmitter;

  static getInstance(): AppEventEmitter {
    if (!AppEventEmitter.instance) {
      AppEventEmitter.instance = new AppEventEmitter();
    }
    return AppEventEmitter.instance;
  }
}
