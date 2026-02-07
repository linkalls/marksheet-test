export type LogEntry = {
  id: string;
  timestamp: number;
  message: string;
  data?: any;
};

type Listener = (logs: LogEntry[]) => void;

class Logger {
  private logs: LogEntry[] = [];
  private listeners: Listener[] = [];
  private maxLogs = 100;

  addLog(message: string, data?: any) {
    const entry: LogEntry = {
      id: Math.random().toString(36).slice(2),
      timestamp: Date.now(),
      message,
      data,
    };
    this.logs = [entry, ...this.logs].slice(0, this.maxLogs);
    this.notify();
  }

  getLogs() {
    return this.logs;
  }

  clear() {
    this.logs = [];
    this.notify();
  }

  subscribe(listener: Listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l(this.logs));
  }
}

export const logger = new Logger();
