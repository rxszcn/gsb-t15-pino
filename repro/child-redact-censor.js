// 复现：同一份脱敏配置，挂在根 logger 上输出正常，挂到子 logger 上变成一串「无法序列化」
const pino = require('../');

function run(tag, viaChild) {
  const out = [];
  const censor = () => {
    const o = { big: 10n };
    o.self = o;
    return o;
  };
  const cfg = { redact: { paths: ['secret'], censor } };
  const log = viaChild
    ? pino({}, { write(s) { out.push(s); } }).child({}, cfg)
    : pino(cfg, { write(s) { out.push(s); } });
  try {
    log.info({ secret: 1 });
  } catch (e) {
    out.push('THROW ' + e.message);
  }
  const line = out[out.length - 1] || '';
  let shown = line.trim();
  try { shown = JSON.stringify(JSON.parse(line).secret); } catch (e) {}
  console.log(tag, '->', shown.slice(0, 110));
}

run('根 logger ', false);
run('子 logger ', true);
