// Hiệu ứng vui mắt: hoa mai rơi, tia sáng khi đúng, pháo giấy khi hoàn thành.
// Tất cả đều tắt khi người dùng bật "giảm chuyển động" trong hệ điều hành.
const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const COLORS = ['#c8102e', '#e0533d', '#d99a1e', '#ffd166', '#1f8a70', '#ff7b8b'];

/** Tia sáng bắn ra từ một phần tử (trả lời đúng). */
export function burst(target, n = 12) {
  if (reduce() || !target) return;
  const r = target.getBoundingClientRect();
  const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
  for (let i = 0; i < n; i++) {
    const p = document.createElement('i');
    p.className = 'fx-spark';
    const a = (Math.PI * 2 * i) / n + Math.random() * .4;
    const d = 40 + Math.random() * 40;
    p.style.cssText = `left:${cx}px;top:${cy}px;background:${COLORS[i % COLORS.length]};--dx:${Math.cos(a) * d}px;--dy:${Math.sin(a) * d}px`;
    document.body.appendChild(p);
    p.addEventListener('animationend', () => p.remove());
  }
}

/** Chữ nhỏ bay lên (ví dụ "+1", "对!"). */
export function floatText(target, text) {
  if (reduce() || !target) return;
  const r = target.getBoundingClientRect();
  const s = document.createElement('span');
  s.className = 'fx-float';
  s.textContent = text;
  s.style.cssText = `left:${r.left + r.width / 2}px;top:${r.top}px`;
  document.body.appendChild(s);
  s.addEventListener('animationend', () => s.remove());
}

/** Pháo giấy rơi khắp màn hình. */
export function confetti(n = 90) {
  if (reduce()) return;
  const box = document.createElement('div');
  box.className = 'fx-confetti';
  for (let i = 0; i < n; i++) {
    const c = document.createElement('i');
    const w = 6 + Math.random() * 6;
    c.style.cssText = `left:${Math.random() * 100}%;width:${w}px;height:${w * (Math.random() < .5 ? 1 : 2.2)}px;` +
      `background:${COLORS[i % COLORS.length]};animation-delay:${Math.random() * .6}s;` +
      `animation-duration:${2.2 + Math.random() * 1.6}s;--rot:${Math.random() * 720 - 360}deg;--x:${Math.random() * 160 - 80}px`;
    box.appendChild(c);
  }
  document.body.appendChild(box);
  setTimeout(() => box.remove(), 4600);
}

/** Hoa mai rơi nhẹ ở nền (có nút bật/tắt). */
let petalBox = null;
export function petals(on) {
  if (!on || reduce()) { petalBox?.remove(); petalBox = null; return; }
  if (petalBox) return;
  petalBox = document.createElement('div');
  petalBox.className = 'fx-petals';
  petalBox.setAttribute('aria-hidden', 'true');
  const count = innerWidth < 640 ? 9 : 16;
  for (let i = 0; i < count; i++) {
    const p = document.createElement('i');
    const size = 8 + Math.random() * 9;
    p.style.cssText = `left:${Math.random() * 100}%;width:${size}px;height:${size}px;` +
      `animation-duration:${11 + Math.random() * 10}s,${3 + Math.random() * 3}s;animation-delay:-${Math.random() * 20}s,-${Math.random() * 3}s;` +
      `opacity:${.35 + Math.random() * .4}`;
    petalBox.appendChild(p);
  }
  document.body.prepend(petalBox);
}
