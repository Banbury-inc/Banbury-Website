// Type import removed to avoid missing module type declarations

const config = {
  framework: {
    name: "@storybook/react-vite",
    options: {}
  },
  stories: [
    "../stories/**/*.mdx",
    "../stories/**/*.stories.@(js|jsx|ts|tsx)"
  ],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions"
  ],
  typescript: {
    reactDocgen: "react-docgen-typescript"
  },
  docs: {
    autodocs: "tag"
  },
  viteFinal: async (config: any) => {
    config.resolve = config.resolve || {}
    config.resolve.alias = {
      ...(config.resolve?.alias || {}),
      "@": "/home/mmills/Documents/Banbury-Website/frontend/src"
    }
    return config
  }
}

export default config


