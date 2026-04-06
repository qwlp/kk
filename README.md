# Python Practice Prototype

Small SvelteKit app for teaching Python with:

- SvelteKit
- Tailwind CSS
- Convex for backend persistence
- Effect v4 for server-side services
- Docker-based Python sandbox execution

## Environment

See [.env.example](/home/tsp/projects/kk/.env.example) for the required variables.

For your current Convex deployment, these are the values to use locally:

- `CONVEX_DEPLOYMENT=dev:sokpiseth-thin`
- `PUBLIC_CONVEX_URL=https://grandiose-mastiff-427.convex.cloud`
- `PUBLIC_CONVEX_SITE_URL=https://grandiose-mastiff-427.convex.site`

`CONVEX_PRIVATE_BRIDGE_KEY` is optional in this prototype. If you set it, set the same value in both the SvelteKit app env and the Convex deployment env.

## Development

The Python runner expects a Linux machine with Docker available to the app process.
