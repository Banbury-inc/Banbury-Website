import React, { useEffect } from "react"
import type { Preview } from "@storybook/react"
import { ThemeProvider } from "../src/components/ThemeProvider"
import "../src/index.css"

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/
      }
    },
    backgrounds: {
      disable: true // Disable storybook backgrounds, use theme instead
    },
    layout: "fullscreen"
  },
  globalTypes: {
    theme: {
      description: "Global theme for components",
      defaultValue: "dark",
      toolbar: {
        title: "Theme",
        icon: "circlehollow",
        items: ["light", "dark"],
        dynamicTitle: true
      }
    }
  },
  decorators: [
    (Story, context) => {
      const theme = context.globals.theme || "dark"
      
      useEffect(() => {
        const root = document.documentElement
        const body = document.body
        
        if (theme === "dark") {
          root.classList.add("dark")
        } else {
          root.classList.remove("dark")
        }
        
        // Apply body styles to match app
        body.className = "bg-background text-foreground"
      }, [theme])

      return React.createElement(
        ThemeProvider,
        {
          attribute: "class",
          defaultTheme: theme,
          enableSystem: false,
          storageKey: "storybook-theme-mode",
          forcedTheme: theme
        },
        React.createElement("div", { className: "bg-background text-foreground p-4" }, React.createElement(Story))
      )
    }
  ]
}

export default preview


