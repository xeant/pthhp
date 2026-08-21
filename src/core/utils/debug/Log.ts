export default class Log {
  static info(params: any) {
    console.log(Log.formatMessage('INFO', params));
  }

  static warn(params: any) {
    console.warn(Log.formatMessage('WARN', params));
  }

  static error(params: any) {
    console.error(Log.formatMessage('ERROR', params));
  }

  private static getCallerInfo() {
    const stack = new Error().stack;
    if (!stack) return;

    const stackLines = stack.split('\n');
    const callerLine = stackLines[4]?.trim() || stackLines[3]?.trim();

    const match = callerLine.match(/at\s+(.*)\s+\((.*):(\d+):(\d+)\)/);
    if (match) {
      const [, functionName, fileName, lineNumber] = match;
      return { functionName, fileName, lineNumber };
    }

    const fallbackMatch = callerLine.match(/at\s+(.*)/);
    if (fallbackMatch) {
      return { functionName: fallbackMatch[1], fileName: 'N/A', lineNumber: 'N/A' };
    }
  }

  private static formatMessage(level: string, params: any) {
    const timestamp = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
    const callerInfo = Log.getCallerInfo();
    const paramStr = JSON.stringify(params, null, 2);

    if (!callerInfo) {
      return `
Time: ${timestamp}
Function: N/A
File: N/A
Line Number: N/A
Value: ${paramStr}
      `;
    }

    return `\
===============================
Time: ${timestamp}
Function: ${callerInfo.functionName}
File: ${callerInfo.fileName}
Line Number: ${callerInfo.lineNumber}
Value: ${paramStr}
===============================
    `;
  }
}
