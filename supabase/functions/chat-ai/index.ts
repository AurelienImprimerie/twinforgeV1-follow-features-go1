import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { consumeTokensAtomic, createInsufficientTokensResponse } from "../_shared/tokenMiddleware.ts";
import { validateChatAIRequest } from "./requestValidator.ts";
import { createCSRFProtection } from "../_shared/csrfProtection.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey, X-CSRF-Token",
};

interface ChatRequest {
  messages: Array<{
    role: "system" | "user" | "assistant";
    content: string;
  }>;
  mode: "training" | "nutrition" | "fasting" | "general" | "body-scan";
  contextData?: any;
  stream?: boolean;
}

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

function log(level: 'info' | 'warn' | 'error', message: string, requestId: string, data?: any) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level,
    service: 'chat-ai',
    requestId,
    message,
    ...data
  };

  if (level === 'error') {
    console.error(JSON.stringify(logEntry));
  } else if (level === 'warn') {
    console.warn(JSON.stringify(logEntry));
  } else {
    console.log(JSON.stringify(logEntry));
  }
}

Deno.serve(async (req: Request) => {
  const requestId = crypto.randomUUID();

  console.log('🚀 EDGE FUNCTION INVOKED - chat-ai', {
    requestId,
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url
  });

  if (req.method === "OPTIONS") {
    console.log('✅ OPTIONS request handled', { requestId });
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    log('info', '📥 Chat request received', requestId, { method: req.method });

    if (!OPENAI_API_KEY) {
      log('error', '❌ OPENAI_API_KEY not configured', requestId);
      console.error('CRITICAL: OPENAI_API_KEY is missing!');
      throw new Error("OPENAI_API_KEY is not configured");
    }

    console.log('✅ OPENAI_API_KEY is configured', { requestId });

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const requestBody = await req.json();
    const { messages, mode, contextData, stream = false }: ChatRequest = requestBody;

    // Sprint 2 Phase 3.2: Validate request with unified validation system
    const validationError = validateChatAIRequest(requestBody);
    if (validationError) {
      log('error', 'Request validation failed', requestId, { error: validationError });

      return new Response(
        JSON.stringify({ error: validationError }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Sprint 3 Phase 5.3: CSRF Protection for AI chat (prompt injection prevention)
    const csrfProtection = createCSRFProtection(supabase);
    const csrfToken = req.headers.get('x-csrf-token');

    const csrfValidation = await csrfProtection.validateRequest(
      user.id,
      csrfToken,
      req,
      'chat-ai'
    );

    if (!csrfValidation.valid) {
      log('error', 'CSRF validation failed', requestId, {
        error: csrfValidation.error,
        tokenProvided: !!csrfToken,
        originValidated: csrfValidation.originValidated,
      });

      return new Response(
        JSON.stringify({
          error: 'CSRF validation failed',
          message: csrfValidation.error
        }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    log('info', 'CSRF validation passed', requestId, {
      tokenValidated: csrfValidation.tokenValidated,
      originValidated: csrfValidation.originValidated,
    });

    log('info', '✅ Request parsed and validated successfully', requestId, {
      mode,
      messageCount: messages.length,
      stream,
      lastMessageRole: messages[messages.length - 1]?.role
    });

    // NOTE: With atomic consumption, we no longer check balance beforehand
    // The atomic function will handle verification and consumption in one transaction
    log('info', 'Calling OpenAI API with atomic token consumption', requestId, {
      model: 'gpt-5-mini',
      messageCount: messages.length,
      stream,
      requestId
    });

    const openAIResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages,
        stream: false,
      }),
    });

    if (!openAIResponse.ok) {
      const error = await openAIResponse.json();
      log('error', 'OpenAI API error', requestId, { error });
      throw new Error(`OpenAI API error: ${JSON.stringify(error)}`);
    }

    const openAIData = await openAIResponse.json();
    const assistantMessage = openAIData.choices[0].message.content;
    const usage = openAIData.usage;

    log('info', 'OpenAI response received', requestId, {
      promptTokens: usage.prompt_tokens,
      completionTokens: usage.completion_tokens,
      totalTokens: usage.total_tokens
    });

    // Consume tokens atomically
    const consumptionResult = await consumeTokensAtomic(
      supabase,
      {
        userId: user.id,
        edgeFunctionName: 'chat-ai',
        operationType: 'chat-completion',
        openaiModel: 'gpt-4o-mini',
        openaiInputTokens: usage.prompt_tokens,
        openaiOutputTokens: usage.completion_tokens
      },
      requestId
    );

    if (!consumptionResult.success) {
      log('error', 'Token consumption failed', requestId, {
        error: consumptionResult.error,
        insufficientBalance: !consumptionResult.success
      });

      return createInsufficientTokensResponse(
        consumptionResult.remainingBalance,
        consumptionResult.consumed || usage.total_tokens,
        consumptionResult.needsUpgrade || false,
        corsHeaders
      );
    }

    log('info', '✅ Tokens consumed successfully', requestId, {
      tokensConsumed: usage.total_tokens,
      remainingBalance: consumptionResult.remainingBalance
    });

    return new Response(
      JSON.stringify({
        message: assistantMessage,
        usage: usage,
        balanceRemaining: consumptionResult.remainingBalance
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    log('error', '❌ Fatal error in chat-ai', requestId, {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });

    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});