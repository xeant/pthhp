// app/api/system/stats/route.ts
import { NextRequest } from "next/server";
import si from 'systeminformation';
import { verify } from "@/core/utils/auth/jwtAuth";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const accessToken = req.cookies.get("accessToken")?.value;
  const verified = accessToken ? await verify(accessToken) : null;

  if (!verified?.isAdmin) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const sendUpdate = async () => {
        try {
          // 🌟 1. 진짜 데이터들을 한꺼번에 긁어옵니다.
          const [cpu, mem, network, disk, time] = await Promise.all([
            si.currentLoad(),
            si.mem(),
            si.networkStats(), // 실시간 전송량
            si.fsSize(),       // 디스크 용량
            si.time()          // 업타임
          ]);

          const stats = {
            cpu: Math.round(cpu.currentLoad),
            mem: Math.round((mem.active / mem.total) * 100),
            // ✅ 네트워크: 초당 수신(rx) / 송신(tx) 속도 (MB 단위 변환)
            network: {
              down: (network[0].rx_sec / 1024 / 1024).toFixed(2),
              up: (network[0].tx_sec / 1024 / 1024).toFixed(2),
            },
            // ✅ 디스크: 메인 파티션 사용률
            disk: Math.round(disk[0].use),
            // ✅ 업타임: 서버가 안 죽고 켜져있던 시간 (초)
            uptime: time.uptime,
            timestamp: Date.now()
          };

          controller.enqueue(encoder.encode(`data: ${JSON.stringify(stats)}\n\n`));
        } catch (e) {
          console.error("데이터 수집 에러:", e);
        }
      };

      const timer = setInterval(sendUpdate, 2000);
      req.signal.addEventListener('abort', () => {
        clearInterval(timer);
        controller.close();
      });
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-store, no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
