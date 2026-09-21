# Finishing reliability maintenance

This fork starts at upstream `v1.16.1` (`3612d066d250a8c48ce03e077926573a88a82e85`) and preserves upstream history and the MIT license. It carries the following general-purpose reliability patches:

- save and direct-export tools require Premiere to return acceptance instead of unconditionally reporting success;
- clip-speed readback reports `unknown` when the host cannot supply a finite value;
- keyframe readback identifies clip-relative tick and second values, while CEP interpolation verification remains explicitly unsupported;
- one CEP bridge writer is serialized across MCP processes. A timeout retains the command and writer lock until the local reconciler reads a completed response. Do not retry a mutation while that state is uncertain.

## Upstream synchronization

Fetch `upstream`, review the changes from the pinned base, rebase the fork branch deliberately, and run `npm run check`. Resolve every affected reliability test and regenerate supported actions when tool metadata changes. Do not copy project files, media, manifests, local paths, credentials, or creative choices into this public repository.

## Installation and rollback

Build and install a versioned local artifact only after source validation. Pin the client configuration to that artifact, retain the prior artifact and configuration bytes, then run a read-only host probe before enabling finishing work. To roll back, restore the prior client pin and retained artifact, verify the connection read-only, and reconcile any uncertain bridge command before a new mutation. Scheduled update monitoring is intentionally not configured.
