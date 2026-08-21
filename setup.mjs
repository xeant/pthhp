import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import readline from 'readline/promises';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const run = (cmd) => {
  try {
    execSync(cmd, { stdio: 'inherit' });
  } catch (e) {
    console.error(`❌ 실행 실패: ${cmd}`);
    process.exit(1);
  }
};

const envValue = (value) => JSON.stringify(String(value));
const base64Url = (value) => value.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');

const generateVapidKeys = () => {
  const ecdh = crypto.createECDH('prime256v1');
  ecdh.generateKeys();

  return {
    publicKey: base64Url(ecdh.getPublicKey()),
    privateKey: base64Url(ecdh.getPrivateKey()),
  };
};

async function setup() {
  console.log("🚀 Plextype 맞춤형 설치를 시작합니다...");

  // 1. 사이트 정보 입력
  console.log("\n🏷️  [1/3] 사이트 정보 설정");
  const appName = await rl.question('사이트 이름 - 영문 APP_NAME (plextype): ') || 'plextype';
  const appTitle = await rl.question('사이트 이름 - 한글 APP_TITLE (plextype): ') || 'plextype';

  // 2. 관리자 정보 입력
  console.log("\n👤 [2/3] 관리자(Admin) 계정 설정");
  const adminId = await rl.question('관리자 ID (admin): ') || 'admin';
  const adminPw = await rl.question('관리자 비밀번호 (password1234): ') || 'password1234';
  const adminEmail = await rl.question('관리자 이메일 (admin@example.com): ') || 'admin@example.com';
  const adminNickname = await rl.question('관리자 닉네임 (관리자): ') || '관리자';

  // 3. 데이터베이스 정보 분할 입력
  console.log("\n🗄️  [3/3] 데이터베이스(PostgreSQL) 연결 설정");
  const dbUser = await rl.question('DB 사용자명 (plextype): ') || 'plextype';
  const dbPw = await rl.question('DB 비밀번호 (change-this-to-a-long-random-password): ') || 'change-this-to-a-long-random-password';
  const dbHost = await rl.question('DB 호스트 주소 (postgres): ') || 'postgres';
  const dbPort = await rl.question('DB 포트 번호 (5432): ') || '5432';
  const dbName = await rl.question('데이터베이스 이름 (plextype): ') || 'plextype';
  const redisHost = await rl.question('Redis 호스트 주소 (redis): ') || 'redis';
  const redisPort = await rl.question('Redis 포트 번호 (6379): ') || '6379';

  console.log("\n🔔 선택 기능 설정");
  const useWebPushAnswer = await rl.question('Web Push 브라우저 푸시를 사용할까요? (y/N): ') || 'n';
  const useWebPush = ['y', 'yes'].includes(useWebPushAnswer.trim().toLowerCase());
  const webPushSubject = useWebPush
    ? await rl.question(`Web Push VAPID subject (mailto:${adminEmail}): `) || `mailto:${adminEmail}`
    : '';

  const useFcmAnswer = await rl.question('Firebase FCM 모바일 푸시를 사용할까요? (y/N): ') || 'n';
  const useFcm = ['y', 'yes'].includes(useFcmAnswer.trim().toLowerCase());
  const fcmProjectId = useFcm ? await rl.question('Firebase Project ID: ') || '' : '';
  const googleApplicationCredentials = useFcm ? await rl.question('Firebase Admin SDK JSON 경로 (비워두면 추후 설정): ') || '' : '';
  const fcmAndroidChannelId = useFcm ? await rl.question('Android 알림 채널 ID (default_notifications): ') || 'default_notifications' : '';

  const dbUrl = `postgresql://${encodeURIComponent(dbUser)}:${encodeURIComponent(dbPw)}@${dbHost}:${dbPort}/${dbName}?schema=public`;
  const redisUrl = `redis://${redisHost}:${redisPort}`;

  rl.close();

  // 3. 환경 변수 파일(.env) 생성
  console.log("\n🔑 셋업: .env 파일 및 보안 토큰 생성 중...");
  if (!fs.existsSync('.env')) {
    const generateToken = () => crypto.randomBytes(32).toString('base64');
    const vapidKeys = useWebPush ? generateVapidKeys() : { publicKey: '', privateKey: '' };
    const envContent = `PROJECT_NAME=${envValue('plextype')}
APP_NAME=${envValue(appName)}
APP_TITLE=${envValue(appTitle)}
PROJECT_TITLE=${envValue(appTitle)}
NEXT_PUBLIC_DEFAULT_URL=${envValue('http://localhost:3000')}
NEXT_PUBLIC_SECRET=${envValue(generateToken())}

JWT_SECRET=${envValue(generateToken())}
SECRET_KEY=${envValue(generateToken())}
ACCESSTOKEN_EXPIRES_IN=${envValue('1h')}
REFRESHTOKEN_EXPIRES_IN=${envValue('4h')}

ADMIN_ACCOUNT_ID=${envValue(adminId)}
ADMIN_PASSWORD=${envValue(adminPw)}
ADMIN_EMAIL=${envValue(adminEmail)}
ADMIN_NICKNAME=${envValue(adminNickname)}

DATABASE_URL=${envValue(dbUrl)}
REDIS_URL=${envValue(redisUrl)}

# PWA / Web Push
WEB_PUSH_VAPID_PUBLIC_KEY=${envValue(vapidKeys.publicKey)}
WEB_PUSH_VAPID_PRIVATE_KEY=${envValue(vapidKeys.privateKey)}
WEB_PUSH_VAPID_SUBJECT=${envValue(webPushSubject)}

# FCM Mobile Push
FCM_ANDROID_CHANNEL_ID=${envValue(fcmAndroidChannelId)}
FIREBASE_PROJECT_ID=${envValue(fcmProjectId)}
GOOGLE_APPLICATION_CREDENTIALS=${envValue(googleApplicationCredentials)}
FIREBASE_SERVICE_ACCOUNT_BASE64=${envValue('')}
FIREBASE_SERVICE_ACCOUNT_JSON=${envValue('')}
FIREBASE_CLIENT_EMAIL=${envValue('')}
FIREBASE_PRIVATE_KEY=${envValue('')}
`;
    fs.writeFileSync('.env', envContent);
    console.log("✅ .env 파일 생성 완료!");
  }

  // Storage 및 의존성 설치 로직
  console.log("\n📁 셋업: Storage 폴더 설정 중...");
  if (!fs.existsSync('storage')) fs.mkdirSync('storage');
  if (!fs.existsSync('public')) fs.mkdirSync('public');
  const linkPath = path.join('public', 'storage');
  if (!fs.existsSync(linkPath)) {
    const target = path.join('..', 'storage');
    const type = process.platform === 'win32' ? 'junction' : 'dir';
    try {
      fs.symlinkSync(target, linkPath, type);
      console.log("✅ 심볼릭 링크 생성 완료!");
    } catch (e) {
      console.log("⚠️  링크 생성 실패.");
    }
  }

  console.log("\n📦 셋업: 패키지 설치 및 DB 초기화 중...");
  run('npm install');
  run('npm run migrate:init');
  run('npm run prisma:generate');
  run('npm run db:seed');

  console.log("\n" + "=".repeat(50));
  console.log("🎉 Plextype 시스템 설치가 모두 끝났습니다!");
  if (dbHost === 'postgres' || redisHost === 'redis') {
    console.log("이제 'docker compose up -d'를 입력하여 개발 서버를 실행하세요.");
    console.log("로그 확인은 'docker compose logs -f node'를 사용하세요.");
  } else {
    console.log("이제 'npm run dev'를 입력하여 개발을 시작하세요.");
  }
  console.log("=".repeat(50));
}

setup();
