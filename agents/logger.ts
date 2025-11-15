/**
 * Structured logging utility for TartanOptimus agents.
 * Logs agent behavior for testing and debugging.
 */

export type LogLevel = "info" | "warn" | "error" | "debug";

export interface LogEntry {
	timestamp: string;
	agentName: string;
	level: LogLevel;
	action: string;
	message: string;
	data?: Record<string, unknown>;
}

class AgentLogger {
	private logs: LogEntry[] = [];
	private enabled = true;

	/**
	 * Enable or disable logging
	 */
	setEnabled(enabled: boolean): void {
		this.enabled = enabled;
	}

	/**
	 * Log an entry
	 */
	private log(
		agentName: string,
		level: LogLevel,
		action: string,
		message: string,
		data?: Record<string, unknown>,
	): void {
		const entry: LogEntry = {
			timestamp: new Date().toISOString(),
			agentName,
			level,
			action,
			message,
			data,
		};

		this.logs.push(entry);

		if (this.enabled) {
			const prefix = `[${entry.timestamp}] [${agentName}] [${level.toUpperCase()}]`;
			const logMessage = `${prefix} ${action}: ${message}`;

			switch (level) {
				case "error":
					console.error(logMessage, data || "");
					break;
				case "warn":
					console.warn(logMessage, data || "");
					break;
				case "debug":
					console.debug(logMessage, data || "");
					break;
				default:
					console.log(logMessage, data || "");
			}
		}
	}

	/**
	 * Log agent execution start
	 */
	logStart(agentName: string, input: unknown): void {
		this.log(agentName, "info", "EXECUTE_START", "Agent execution started", {
			input,
		});
	}

	/**
	 * Log agent execution success
	 */
	logSuccess(agentName: string, output: unknown): void {
		this.log(agentName, "info", "EXECUTE_SUCCESS", "Agent execution completed", {
			output,
		});
	}

	/**
	 * Log agent execution error
	 */
	logError(agentName: string, error: string, details?: Record<string, unknown>): void {
		this.log(agentName, "error", "EXECUTE_ERROR", error, details);
	}

	/**
	 * Log agent action
	 */
	logAction(
		agentName: string,
		action: string,
		message: string,
		data?: Record<string, unknown>,
	): void {
		this.log(agentName, "info", action, message, data);
	}

	/**
	 * Get all logs
	 */
	getLogs(): LogEntry[] {
		return [...this.logs];
	}

	/**
	 * Get logs for a specific agent
	 */
	getLogsForAgent(agentName: string): LogEntry[] {
		return this.logs.filter((log) => log.agentName === agentName);
	}

	/**
	 * Clear all logs
	 */
	clearLogs(): void {
		this.logs = [];
	}
}

export const agentLogger = new AgentLogger();

