module.exports = {
  apps: [
    {
      name: "evogo-qrcode",
      cwd: __dirname,
      script: "server/dist/server.js",
      interpreter: process.execPath,
      instances: 1,
      exec_mode: "fork",
    },
  ],
};
