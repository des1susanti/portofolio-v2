// Pengubah Markdown sederhana -> HTML (judul, tebal, miring, tautan, gambar, daftar, kode, kutipan).
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function inline(s) {
  s = esc(s);
  s = s.replace(/`([^`]+)`/g, '<code>$1</code>');
  s = s.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, '<img src="$2" alt="$1" loading="lazy">');
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  s = s.replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');
  s = s.replace(/(^|[^*])\*([^*]+)\*/g, '$1<i>$2</i>');
  return s;
}

export function md(src) {
  // buang "front matter" di antara --- ... ---
  src = src.replace(/^---[\s\S]*?---\s*/, '');
  const lines = src.replace(/\r/g, '').split('\n');
  let html = '', list = null, para = [], code = null;
  let table = null;
  const flush = () => {
    if (para.length) { html += `<p>${inline(para.join(' '))}</p>`; para = []; }
    if (list) { html += `</${list}>`; list = null; }
  };
  for (const ln of lines) {
    if (code !== null) {
      if (ln.startsWith('```')) { html += `<pre><code>${esc(code.join('\n'))}</code></pre>`; code = null; }
      else code.push(ln);
      continue;
    }
    if (ln.startsWith('```')) { flush(); code = []; continue; }
    if (/^\s*\|.*\|\s*$/.test(ln)) {
      const cells = ln.trim().slice(1, -1).split('|').map((c) => c.trim());
      if (cells.every((c) => /^:?-{2,}:?$/.test(c))) continue;          // garis pemisah
      if (!table) { flush(); table = true; html += '<table><thead><tr>' + cells.map((c) => `<th>${inline(c)}</th>`).join('') + '</tr></thead><tbody>'; }
      else html += '<tr>' + cells.map((c) => `<td>${inline(c)}</td>`).join('') + '</tr>';
      continue;
    }
    if (table) { html += '</tbody></table>'; table = null; }
    let m;
    if ((m = ln.match(/^(#{1,4})\s+(.*)/))) { flush(); const n = Math.min(4, m[1].length + 1); html += `<h${n}>${inline(m[2])}</h${n}>`; continue; }
    if ((m = ln.match(/^\s*[-*]\s+(.*)/))) { if (para.length) flush(); if (list !== 'ul') { flush(); list = 'ul'; html += '<ul>'; } html += `<li>${inline(m[1])}</li>`; continue; }
    if ((m = ln.match(/^\s*\d+\.\s+(.*)/))) { if (para.length) flush(); if (list !== 'ol') { flush(); list = 'ol'; html += '<ol>'; } html += `<li>${inline(m[1])}</li>`; continue; }
    if ((m = ln.match(/^>\s?(.*)/))) { flush(); html += `<blockquote>${inline(m[1])}</blockquote>`; continue; }
    if (!ln.trim()) { flush(); continue; }
    if (list) flush();
    para.push(ln.trim());
  }
  if (code !== null) html += `<pre><code>${esc(code.join('\n'))}</code></pre>`;
  if (table) html += '</tbody></table>';
  flush();
  return html;
}
