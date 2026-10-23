# MyCofreApp

O app mobile do MyCofre (Expo/React Native), com o mesmo núcleo do app web.
`site/` é a versão web do app, gerada por `npx expo export --platform web`
— útil para ver a interface sem instalar nada, mas a experiência real é no
celular.

As credenciais do Supabase em `app.config.js` foram trocadas por variáveis
de ambiente (`SUPABASE_URL`, `SUPABASE_ANON_KEY`), vazias nesta publicação:
sem elas, a tela de login avisa que o backend não está configurado, em vez
de travar.

Para regerar a versão web: `npm install && npx expo install react-dom react-native-web && npx expo export --platform web --output-dir dist`,
depois trocar os dois caminhos absolutos (`/favicon.ico`, `/_expo/...`) por
relativos em `dist/index.html` e mover `dist/` para `site/`.

Autor: Urlan Dipre.
