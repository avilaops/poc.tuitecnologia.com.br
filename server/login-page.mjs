export function loginPage({ error = false } = {}) {
  return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex,nofollow,noarchive" />
    <meta name="theme-color" content="#071a2b" />
    <title>Acesso reservado — JurisFlow Municipal</title>
    <style>
      :root { color-scheme: light; font-family: "Segoe UI", system-ui, sans-serif; color: #17303c; background: #071a2b; }
      * { box-sizing: border-box; }
      body { min-height: 100vh; margin: 0; display: grid; place-items: center; padding: 24px; background: radial-gradient(circle at 16% 8%, #123f4d 0, transparent 34%), linear-gradient(145deg, #071a2b, #0a2738 58%, #0d3c43); }
      main { width: min(940px, 100%); min-height: 570px; display: grid; grid-template-columns: 1.1fr .9fr; overflow: hidden; background: #fff; border: 1px solid rgba(255,255,255,.15); border-radius: 22px; box-shadow: 0 35px 90px rgba(0,0,0,.3); }
      .intro { padding: 54px; color: #eaf7f5; background: linear-gradient(150deg, #0a343f, #092332); position: relative; }
      .intro:after { content: ""; width: 260px; height: 260px; position: absolute; right: -90px; bottom: -110px; border: 1px solid rgba(70,210,191,.25); border-radius: 50%; box-shadow: 0 0 0 45px rgba(53,195,177,.035), 0 0 0 90px rgba(53,195,177,.025); }
      .brand { display: flex; align-items: center; gap: 11px; font-weight: 700; letter-spacing: -.02em; }
      .mark { width: 38px; height: 38px; display: grid; place-items: center; color: #eafffb; background: #087f76; border-radius: 11px; }
      .eyebrow { margin: 105px 0 11px; color: #45c8b8; font-size: 11px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; }
      h1 { max-width: 420px; margin: 0; color: #fff; font-size: clamp(32px, 4vw, 46px); line-height: 1.05; letter-spacing: -.055em; }
      .intro p:last-of-type { max-width: 410px; margin-top: 20px; color: #9db6bc; font-size: 14px; line-height: 1.65; }
      .safety { margin-top: 62px; display: flex; gap: 9px; color: #8eb0b5; font-size: 11px; }
      .form-area { padding: 62px 54px; display: flex; flex-direction: column; justify-content: center; }
      .form-area small { color: #087f76; font-size: 10px; font-weight: 700; letter-spacing: .11em; text-transform: uppercase; }
      h2 { margin: 8px 0 7px; color: #142c38; font-size: 28px; letter-spacing: -.04em; }
      .hint { margin: 0 0 28px; color: #73848c; font-size: 12px; line-height: 1.5; }
      label { display: grid; gap: 7px; margin-top: 15px; color: #405660; font-size: 11px; font-weight: 650; }
      input { width: 100%; height: 46px; padding: 0 13px; color: #203b46; background: #f7f9fa; border: 1px solid #dce4e7; border-radius: 9px; outline: none; font: inherit; }
      input:focus { border-color: #75bbb2; box-shadow: 0 0 0 4px #e8f6f3; }
      .portal-button { width: 100%; height: 46px; margin-top: 23px; display: flex; align-items: center; justify-content: center; color: #fff; background: #087f76; border-radius: 9px; box-shadow: 0 10px 24px rgba(8,127,118,.2); font-size: 12px; font-weight: 700; text-decoration: none; }
      .portal-button:hover { background: #076c65; }
      .error { margin: 0 0 5px; padding: 10px 12px; color: #a63838; background: #fff0ef; border: 1px solid #f1d4d2; border-radius: 8px; font-size: 11px; }
      .notice { margin-top: 22px; padding-top: 18px; color: #8a989e; border-top: 1px solid #e7ecee; font-size: 10px; line-height: 1.5; }
      @media (max-width: 760px) { main { grid-template-columns: 1fr; } .intro { min-height: 220px; padding: 30px; } .eyebrow { margin-top: 52px; } .intro p:last-of-type, .safety { display: none; } .form-area { padding: 38px 30px; } }
    </style>
  </head>
  <body>
    <main>
      <section class="intro">
        <div class="brand"><span class="mark">§</span><span>JurisFlow Municipal</span></div>
        <p class="eyebrow">Ambiente de apresentação</p>
        <h1>Operação jurídica com controle e rastreabilidade.</h1>
        <p>Acesso reservado à demonstração da prova de conceito. Todas as informações apresentadas no sistema são fictícias.</p>
        <div class="safety">◈ Sessão protegida · acesso registrado · dados fictícios</div>
      </section>
      <section class="form-area">
        <small>Acesso reservado</small>
        <h2>Entrar na demonstração</h2>
        <p class="hint">Use as credenciais fornecidas pela equipe responsável.</p>
        ${error ? '<p class="error" role="alert">A autorização expirou ou já foi utilizada. Entre novamente pelo portal.</p>' : ''}
        <a class="portal-button" href="https://cliente.avilaops.com/login">Entrar pelo portal do cliente</a>
        <p class="notice">Por segurança, tentativas e acessos são registrados com identificador anonimizado. Não compartilhe as credenciais publicamente.</p>
      </section>
    </main>
  </body>
</html>`
}
