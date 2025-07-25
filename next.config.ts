import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure proper headers for camera/microphone access
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Permissions-Policy',
            value: 'camera=*, microphone=*, display-capture=*'
          }
        ]
      }
    ];
  },
  
  // Optimize for static export if needed
  trailingSlash: true,
  
  // Ensure WebAssembly and worker files are properly handled
  webpack: (config, { isServer }) => {
    // Handle WebAssembly files
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    };

    // Handle MediaPipe WASM files
    config.module.rules.push({
      test: /\.wasm$/,
      type: 'webassembly/async',
    });

    return config;
  },
};

export default nextConfig;