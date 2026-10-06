import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../lib/cart';

/**
 * Registers the storefront's WebMCP tools (lib/agentTools.js) for AI agents in the visitor's
 * browser: search the catalogue, read a product, the size chart, shipping and contact details,
 * track an order, open a page, add a jacket to the cart. Only browsers that offer WebMCP
 * (document.modelContext) get them, and only they download the tools' code; everyone else is
 * unaffected. The tools are unregistered when this unmounts. Renders nothing.
 */
export default function AgentTools() {
  const navigate = useNavigate();
  const cart = useCart();
  // the tools are registered once, so they read the router and the cart through this
  const live = useRef({ navigate, cart });
  useEffect(() => { live.current = { navigate, cart }; }, [navigate, cart]);

  useEffect(() => {
    const modelContext = document.modelContext || navigator.modelContext;
    if (typeof modelContext?.registerTool !== 'function') return undefined;
    const controller = new AbortController();
    import('../lib/agentTools').then(({ createAgentTools }) => {
      if (controller.signal.aborted) return;
      for (const tool of createAgentTools(() => live.current)) {
        // aborting the signal unregisters the tool; an older draft of the API removed tools by name
        controller.signal.addEventListener('abort', () => { try { modelContext.unregisterTool?.(tool.name); } catch { /* already gone */ } }, { once: true });
        Promise.resolve()
          .then(() => modelContext.registerTool(tool, { signal: controller.signal }))
          .catch((err) => { if (!controller.signal.aborted) console.warn(`WebMCP: ${tool.name} was not registered`, err); });
      }
    }).catch(() => { /* the tools could not load (offline): the site works without them */ });
    return () => controller.abort();
  }, []);

  return null;
}
