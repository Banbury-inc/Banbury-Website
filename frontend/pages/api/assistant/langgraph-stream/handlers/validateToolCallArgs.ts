export interface MissingToolArgumentsDetails {
  toolName: string
  missingArgs: string[]
}

export class MissingToolArgumentsError extends Error {
  public readonly toolName: string
  public readonly missingArgs: string[]

  constructor({ toolName, missingArgs }: MissingToolArgumentsDetails) {
    const message = `Tool "${toolName}" is missing required arguments: ${missingArgs.join(', ')}`
    super(message)
    this.name = 'MissingToolArgumentsError'
    this.toolName = toolName
    this.missingArgs = missingArgs
  }
}

const REQUIRED_TOOL_ARGUMENTS: Record<string, string[]> = {
  web_search: ['query'],
  docx_ai: ['action'],
  sheet_ai: ['action'],
  tldraw_ai: ['action'],
  generate_image: ['prompt'],
  create_file: ['fileName', 'filePath', 'content'],
  download_from_url: ['url'],
  stagehand_goto: ['url'],
  stagehand_observe: ['instruction'],
  stagehand_act: ['suggestion'],
  stagehand_extract: ['instruction', 'schema'],
}

function isMissing(value: unknown): boolean {
  if (value === null || value === undefined) return true
  if (typeof value === 'string') return value.trim().length === 0
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === 'object') return Object.keys(value as Record<string, unknown>).length === 0
  return false
}

export function getMissingToolArguments(toolName: string, args: unknown): string[] {
  const requiredArgs = REQUIRED_TOOL_ARGUMENTS[toolName]
  if (!requiredArgs || requiredArgs.length === 0) {
    return []
  }

  const parsedArgs = (args && typeof args === 'object') ? (args as Record<string, unknown>) : {}

  return requiredArgs.filter((argName) => isMissing(parsedArgs[argName]))
}

export function ensureToolArguments(toolName: string, args: unknown): void {
  const missingArgs = getMissingToolArguments(toolName, args)
  if (missingArgs.length > 0) {
    throw new MissingToolArgumentsError({ toolName, missingArgs })
  }
}


