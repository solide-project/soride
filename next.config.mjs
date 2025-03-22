/** @type {import('next').NextConfig} */
const nextConfig = {
    /**
     * Used to silence sodium-native warnings from 
     */
    // webpack: (config) => {
    //     config.module.exprContextCritical = false; // Suppress require() warnings
    //     return config;
    // },
    webpack: (config) => {
        config.ignoreWarnings = [
            {
                module: /require-addon|sodium-native/, // Ignore specific warnings
                message: /Critical dependency/,
            },
        ];
        return config;
    },
};

export default nextConfig;
