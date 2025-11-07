import { processStreamChunk } from "../../../pages/api/assistant/langgraph-stream/handlers/processStreamChunk"
import { MissingToolArgumentsError } from "../../../pages/api/assistant/langgraph-stream/handlers/validateToolCallArgs"

function buildParams(overrides: Partial<Parameters<typeof processStreamChunk>[0]> = {}) {
  const send = jest.fn()

  return {
    chunk: {
      messages: [
        {
          _getType: () => "ai",
          id: "ai-1",
          content: [{ type: "text", text: "Working on it" }],
          tool_calls: [
            {
              id: "call-1",
              name: "docx_ai",
              args: { action: "format", documentName: "Report.docx" },
            },
          ],
        },
      ],
    },
    allMessages: [],
    processedAiMessages: new Set<string>(),
    processedToolCalls: new Set<string>(),
    currentToolExecution: null,
    send,
    ...overrides,
  }
}

describe("processStreamChunk tool arguments", () => {
  it("allows tool calls when required arguments are present", async () => {
    const params = buildParams()

    await expect(processStreamChunk(params)).resolves.toMatchObject({
      currentToolExecution: expect.any(Object),
    })

    expect(params.send).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "tool-call-start",
        part: expect.objectContaining({
          toolName: "docx_ai",
          args: expect.objectContaining({ action: "format" }),
        }),
      })
    )
  })

  it("throws a MissingToolArgumentsError when arguments are missing", async () => {
    const params = buildParams({
      chunk: {
        messages: [
          {
            _getType: () => "ai",
            id: "ai-1",
            content: [{ type: "text", text: "Updating document" }],
            tool_calls: [
              {
                id: "call-1",
                name: "docx_ai",
                args: { documentName: "Report.docx" },
              },
            ],
          },
        ],
      },
    })

    await expect(processStreamChunk(params)).rejects.toBeInstanceOf(MissingToolArgumentsError)

    expect(params.send).not.toHaveBeenCalledWith(
      expect.objectContaining({ type: "tool-call-start" })
    )
  })
})


