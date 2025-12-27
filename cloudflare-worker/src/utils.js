// Basic utilities for Worker

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export function jsonResponse(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
      ...extraHeaders,
    },
  });
}

export function errorResponse(message, status = 500) {
  return jsonResponse({ error: message }, status);
}

export function parsePath(url) {
  try {
    return new URL(url).pathname;
  } catch (e) {
    return '/';
  }
}

// Minimal markdown passthrough; can be replaced with real parser if needed
export function parseMarkdown(markdown) {
  return markdown || '';
}

