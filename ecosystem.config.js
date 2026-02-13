module.exports = {
  apps: [{
    name: 'relationcraft',
    script: 'npm',
    args: 'start',
    cwd: '/home/xynet/relationcraft/relationcraft',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
    },
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
  }],
};
