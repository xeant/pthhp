import net from "node:net";
import tls from "node:tls";

type SendMailOptions = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

type SmtpConfig = {
  host: string;
  port: number;
  user?: string;
  password?: string;
  from: string;
  secure: boolean;
};

const getSmtpConfig = (): SmtpConfig | null => {
  const host = process.env.SMTP_HOST || process.env.MAIL_HOST;
  const from = process.env.SMTP_FROM || process.env.MAIL_FROM || process.env.SMTP_USER || process.env.MAIL_USER;
  if (!host || !from) return null;

  const port = Number(process.env.SMTP_PORT || process.env.MAIL_PORT || 587);
  const secure = (process.env.SMTP_SECURE || process.env.MAIL_SECURE) === "true" || port === 465;

  return {
    host,
    port,
    secure,
    from,
    user: process.env.SMTP_USER || process.env.MAIL_USER,
    password: process.env.SMTP_PASSWORD || process.env.MAIL_PASSWORD,
  };
};

const encodeHeader = (value: string) => {
  if (/^[\x00-\x7F]*$/.test(value)) return value;
  return `=?UTF-8?B?${Buffer.from(value, "utf8").toString("base64")}?=`;
};

const escapeHtml = (value: string) => value
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;");

const createMessage = (config: SmtpConfig, options: SendMailOptions) => {
  const boundary = `plextype-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const html = options.html || `<p>${escapeHtml(options.text).replace(/\n/g, "<br />")}</p>`;

  return [
    `From: ${config.from}`,
    `To: ${options.to}`,
    `Subject: ${encodeHeader(options.subject)}`,
    "MIME-Version: 1.0",
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    "",
    `--${boundary}`,
    "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: 8bit",
    "",
    options.text,
    "",
    `--${boundary}`,
    "Content-Type: text/html; charset=UTF-8",
    "Content-Transfer-Encoding: 8bit",
    "",
    html,
    "",
    `--${boundary}--`,
    "",
  ].join("\r\n");
};

class SmtpSession {
  private socket: net.Socket | tls.TLSSocket;
  private buffer = "";

  constructor(socket: net.Socket | tls.TLSSocket) {
    this.socket = socket;
    this.socket.setEncoding("utf8");
    this.socket.on("data", (chunk) => {
      this.buffer += chunk;
    });
  }

  waitForResponse(expected: number[]) {
    return new Promise<string>((resolve, reject) => {
      const deadline = setTimeout(() => {
        cleanup();
        reject(new Error("SMTP 응답 시간이 초과되었습니다."));
      }, 15000);

      const check = () => {
        const lines = this.buffer.split(/\r?\n/).filter(Boolean);
        const last = lines[lines.length - 1];
        if (!last || !/^\d{3}\s/.test(last)) return;

        const code = Number(last.slice(0, 3));
        if (!expected.includes(code)) {
          cleanup();
          reject(new Error(`SMTP 응답 오류: ${this.buffer.trim()}`));
          return;
        }

        const response = this.buffer;
        this.buffer = "";
        cleanup();
        resolve(response);
      };

      const cleanup = () => {
        clearTimeout(deadline);
        this.socket.off("data", check);
        this.socket.off("error", onError);
      };

      const onError = (error: Error) => {
        cleanup();
        reject(error);
      };

      this.socket.on("data", check);
      this.socket.on("error", onError);
      check();
    });
  }

  async command(command: string, expected: number[]) {
    this.socket.write(`${command}\r\n`);
    return this.waitForResponse(expected);
  }

  async upgradeTls(host: string) {
    this.socket = tls.connect({
      socket: this.socket,
      servername: host,
    });
    this.socket.setEncoding("utf8");
    this.socket.on("data", (chunk) => {
      this.buffer += chunk;
    });
  }

  close() {
    this.socket.end();
  }
}

const connectSocket = (config: SmtpConfig) => new Promise<net.Socket | tls.TLSSocket>((resolve, reject) => {
  const socket = config.secure
    ? tls.connect({ host: config.host, port: config.port, servername: config.host })
    : net.connect({ host: config.host, port: config.port });

  socket.setTimeout(15000);
  socket.once("connect", () => resolve(socket));
  socket.once("secureConnect", () => resolve(socket as tls.TLSSocket));
  socket.once("timeout", () => reject(new Error("SMTP 연결 시간이 초과되었습니다.")));
  socket.once("error", reject);
});

export const sendMail = async (options: SendMailOptions) => {
  const config = getSmtpConfig();

  if (!config) {
    console.info("[Mail disabled] SMTP 환경변수가 없어 메일을 발송하지 않았습니다.", {
      to: options.to,
      subject: options.subject,
      text: options.text,
    });
    return { sent: false };
  }

  const socket = await connectSocket(config);
  const session = new SmtpSession(socket);
  const message = createMessage(config, options);

  try {
    await session.waitForResponse([220]);
    await session.command(`EHLO ${config.host}`, [250]);

    if (!config.secure) {
      await session.command("STARTTLS", [220]);
      await session.upgradeTls(config.host);
      await session.command(`EHLO ${config.host}`, [250]);
    }

    if (config.user && config.password) {
      await session.command("AUTH LOGIN", [334]);
      await session.command(Buffer.from(config.user).toString("base64"), [334]);
      await session.command(Buffer.from(config.password).toString("base64"), [235]);
    }

    await session.command(`MAIL FROM:<${config.from}>`, [250]);
    await session.command(`RCPT TO:<${options.to}>`, [250, 251]);
    await session.command("DATA", [354]);
    await session.command(`${message}\r\n.`, [250]);
    await session.command("QUIT", [221]);

    return { sent: true };
  } finally {
    session.close();
  }
};
