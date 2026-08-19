// React 19 requires this flag so `act(...)` runs in the dedicated
// "act environment" mode instead of warning that the environment isn't
// configured for it. Vitest loads this file before every test file.
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
