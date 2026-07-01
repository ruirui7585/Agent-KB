export default {
  apps: [{
    name: 'calsnap',
    script: 'src/index.js',
    cwd: '/opt/calsnap/server',
    node_args: '--env-file=/etc/calsnap/calsnap.env',
    env: {
      NODE_ENV: 'production',
      PORT: '3000',
    },
    autorestart: true,
    max_restarts: 10,
    restart_delay: 5000,
  }]
};
