module.exports = {
  apps: [
    {
      name: 'ilustrum-web',
      cwd: '/opt/ilustrum/app',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3000',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      error_file: '/opt/ilustrum/logs/pm2-error.log',
      out_file: '/opt/ilustrum/logs/pm2-out.log',
      log_file: '/opt/ilustrum/logs/pm2-combined.log',
      time: true,
    },
  ],
};

