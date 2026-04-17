#!/usr/bin/env node

/**
 * 健康检查脚本
 * 用于 CI/CD pipeline 中验证服务是否正常运行
 */

const http = require('http');

const options = {
  host: process.env.API_HOST || 'localhost',
  port: process.env.API_PORT || 3000,
  path: '/health',
  timeout: 5000,
  method: 'GET'
};

const request = http.request(options, (res) => {
  console.log(`Health check status: ${res.statusCode}`);

  if (res.statusCode === 200) {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      console.log(`Response: ${data}`);
      process.exit(0);
    });
  } else {
    console.error('Health check failed');
    process.exit(1);
  }
});

request.on('error', (err) => {
  console.error(`Health check error: ${err.message}`);
  process.exit(1);
});

request.on('timeout', () => {
  console.error('Health check timeout');
  request.destroy();
  process.exit(1);
});

request.end();
