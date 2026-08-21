'use server';

import redisClient from "@core/utils/redis/redis";
import { dispatchNotificationAction } from "@/modules/notification/actions/notification.action";

export async function getActiveUserList(limit?: number) {
  try {
    const activeKeys = await redisClient.keys("active_user:*");
    if (activeKeys.length === 0) return [];

    const [rawSessions, rawProfiles] = await Promise.all([
      redisClient.mget(...activeKeys),
      redisClient.mget(...activeKeys.map(key => `user:profile:${key.split(":")[1]}`))
    ]);

    const now = new Date().getTime();
    let loginAtDate = now;

    let result = activeKeys.map((key, index) => {
      const parts = key.split(":");
      const id = parts[1];
      const rawIp = parts.slice(2).join(":").replace(/^::ffff:/, "");
      
      // 🌟 1. 타입 명시: 이 변수들은 각각 Date와 any 타입이라고 못박아줍니다. ㅡㅡ+
      const now: Date = new Date();
      let loginAtDate: Date = now; 
      let sessionInfo: any = null; 

      const sessionData = rawSessions[index] as string;

      if (sessionData && sessionData.startsWith('{')) {
        try {
          // 🌟 2. JSON 파싱 결과를 any로 받아 'never' 에러 방지
          sessionInfo = JSON.parse(sessionData); 
          if (sessionInfo && typeof sessionInfo === 'object' && sessionInfo.loginAt) {
            loginAtDate = new Date(sessionInfo.loginAt);
          }
        } catch (e) {
          console.error("JSON 파싱 에러:", e);
        }
      }
      
      // 🌟 3. 계산 시에는 .getTime()을 써서 숫자(ms)끼리 계산하게 합니다.
      const diffMs = now.getTime() - loginAtDate.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      
      const profile = rawProfiles[index] ? JSON.parse(rawProfiles[index] as string) : {};
      
      return {
        id,
        ip: rawIp,
        nickName: profile.nickName || `User #${id}`,
        accountId: profile.accountId || '-',
        duration: diffMins,
        // 🌟 4. 훅에서 쓸 수 있게 원본 시각 배달
        loginAt: sessionInfo?.loginAt || now.toISOString(), 
        status: "online" as const,
      };
    });

    const finalResult = result.reverse();
    return limit ? finalResult.slice(0, limit) : finalResult;
  } catch (error) {
    console.error("데이터 수집 에러:", error);
    return [];
  }
}

export async function forceLogout(userId: string) { // 🌟 IP는 이제 참고용으로만 쓰거나 빼도 됩니다.
  try {
    // 1. 🌟 해당 유저의 모든 접속 키 찾기 (와일드카드 활용)
    // 예: active_user:3:* -> 3번 유저가 모바일, PC 등 어디서 접속했든 다 찾아냅니다.
    const pattern = `active_user:${userId}:*`;
    const keys = await redisClient.keys(pattern);

    if (keys.length > 0) {
      // 몽땅 삭제 ㅡㅡ+
      await redisClient.del(...keys);
      console.log(`[추방 성공] 유저 ${userId}의 세션 ${keys.length}개 삭제 완료`);
    }

    // 3. 알림 생성 로직 (기존 saveNotification 그대로 사용)
    await dispatchNotificationAction({
      userId: Number(userId),
      type: 'warning',
      title: '강제 로그아웃',
      content: '관리자에 의해 모든 세션에서 강제 로그아웃 되었습니다.',
      metadata: {
        appId: "gjworks",
        groupKey: "ADMIN",
        subType: "force-logout",
      },
    });

    return { success: true };
  } catch (error) {
    console.error("추방 실패:", error);
    return { success: false };
  }
}
