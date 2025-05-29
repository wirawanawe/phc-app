/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  // Memory optimization
  experimental: {
    // Reduce memory usage during build
    workerThreads: false,
  },
  webpack: (config, { isServer }) => {
    // Suppress Sequelize warnings and import traces
    config.ignoreWarnings = [
      {
        module: /node_modules\/sequelize/,
        message:
          /Critical dependency: the request of a dependency is an expression/,
      },
      {
        module: /node_modules\/sequelize/,
        message: /Import trace for requested module/,
      },
    ];

    // Additional configuration to suppress verbose output
    config.stats = {
      ...config.stats,
      warnings: false,
      warningsFilter: [
        /node_modules\/sequelize/,
        /Critical dependency/,
        /Import trace/,
      ],
    };

    // Fix for "exports is not defined" error and module resolution
    config.resolve = {
      ...config.resolve,
      fallback: {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      },
    };

    // Ensure proper module handling
    config.module.rules.push({
      test: /\.m?js$/,
      resolve: {
        fullySpecified: false,
      },
    });

    // Disable problematic optimizations that cause vendor-chunks issues
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: "all",
          minSize: 20000,
          maxSize: 244000,
          cacheGroups: {
            default: {
              minChunks: 2,
              priority: -20,
              reuseExistingChunk: true,
            },
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: "vendors",
              priority: -10,
              chunks: "all",
            },
          },
        },
      };
    }

    return config;
  },
  // Suppress build output verbosity
  onDemandEntries: {
    // period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 25 * 1000,
    // number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 2,
  },
};

module.exports = nextConfig;
