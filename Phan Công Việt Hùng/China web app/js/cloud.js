// Tài khoản + đồng bộ tiến độ + bảng xếp hạng tuần qua Firebase.
// Nếu chưa cấu hình firebase-config.js thì mọi hàm trả về trạng thái "offline".
import { firebaseConfig } from './firebase-config.js';
import { store, weekId } from './store.js';

const V = '10.14.1';
let fb = null;          // { auth, db, mods }
let user = null;
const userListeners = new Set();

export const cloudEnabled = () => !!firebaseConfig;
export const currentUser = () => user;
export function onUser(fn) { userListeners.add(fn); fn(user); return () => userListeners.delete(fn); }

async function init() {
  if (fb || !firebaseConfig) return fb;
  const [appM, authM, fsM] = await Promise.all([
    import(`https://www.gstatic.com/firebasejs/${V}/firebase-app.js`),
    import(`https://www.gstatic.com/firebasejs/${V}/firebase-auth.js`),
    import(`https://www.gstatic.com/firebasejs/${V}/firebase-firestore.js`),
  ]);
  const app = appM.initializeApp(firebaseConfig);
  const auth = authM.getAuth(app);
  const db = fsM.getFirestore(app);
  fb = { auth, db, authM, fsM };
  authM.onAuthStateChanged(auth, async u => {
    user = u;
    if (u) await pullThenPush();
    userListeners.forEach(fn => fn(user));
  });
  return fb;
}

// ----- Đăng nhập -----
export async function signInGoogle() {
  const { auth, authM } = await init();
  return authM.signInWithPopup(auth, new authM.GoogleAuthProvider());
}
export async function signInEmail(email, pass) {
  const { auth, authM } = await init();
  return authM.signInWithEmailAndPassword(auth, email, pass);
}
export async function signUpEmail(email, pass, name) {
  const { auth, authM } = await init();
  const cred = await authM.createUserWithEmailAndPassword(auth, email, pass);
  if (name) await authM.updateProfile(cred.user, { displayName: name });
  return cred;
}
export async function resetPassword(email) {
  const { auth, authM } = await init();
  return authM.sendPasswordResetEmail(auth, email);
}
export async function signOut() {
  const { auth, authM } = await init();
  return authM.signOut(auth);
}

// ----- Đồng bộ tiến độ -----
let pushTimer = null;
async function pullThenPush() {
  const { db, fsM } = fb;
  const ref = fsM.doc(db, 'users', user.uid);
  const snap = await fsM.getDoc(ref);
  const local = store.snapshot();
  const cloud = snap.exists() ? snap.data().progress : null;
  // Bản nào mới hơn thì dùng bản đó; bản trên mạng có nhiều XP hơn hẳn cũng ưu tiên.
  if (cloud && ((cloud.updatedAt || 0) > (local.updatedAt || 0) || cloud.xp > local.xp)) store.replace(cloud);
  else await push();
}
async function push() {
  if (!fb || !user) return;
  const { db, fsM } = fb;
  const p = store.snapshot();
  const name = user.displayName || (user.email || 'Bạn học').split('@')[0];
  await fsM.setDoc(fsM.doc(db, 'users', user.uid), { progress: p, name, updatedAt: fsM.serverTimestamp() });
  if (p.week === weekId() && p.weekXp > 0) {
    await fsM.setDoc(fsM.doc(db, 'leaderboard', p.week, 'users', user.uid), { name, xp: p.weekXp, updatedAt: fsM.serverTimestamp() });
  }
}
store.subscribe(() => {
  if (!user) return;
  clearTimeout(pushTimer);
  pushTimer = setTimeout(() => push().catch(console.error), 3000);
});

// ----- Bảng xếp hạng tuần -----
export async function leaderboard(n = 20) {
  const f = await init();
  if (!f) return [];
  const { db, fsM } = f;
  const q = fsM.query(fsM.collection(db, 'leaderboard', weekId(), 'users'), fsM.orderBy('xp', 'desc'), fsM.limit(n));
  const snap = await fsM.getDocs(q);
  return snap.docs.map(d => ({ uid: d.id, ...d.data() }));
}

// Khởi động sớm để tự đăng nhập lại
if (firebaseConfig) init().catch(console.error);
