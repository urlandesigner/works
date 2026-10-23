require('dotenv').config();

const appJson = require('./app.json');

/** @type {import('@expo/config').ExpoConfig} */
module.exports = {
  expo: {
    ...appJson.expo,
    extra: {
      // Publicação no works: sem backend real, de propósito — ver README
      // desta pasta. Valores reais vêm de .env, nunca comitados.
      SUPABASE_URL: process.env.SUPABASE_URL || "",
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || "",
    },
  },
};
